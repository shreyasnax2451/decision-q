'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DecisionState, Step, STEPS } from '@/types/decision';
import { decisionsApi, ApiError } from '@/lib/api';
import { useAuth, useRequireAuth } from '@/lib/auth-context';
import { HookCard } from '@/components/cards/HookCard';
import { OptionsCard } from '@/components/cards/OptionsCard';
import { CriteriaCard } from '@/components/cards/CriteriaCard';
import { ScoreCard } from '@/components/cards/ScoreCard';
import { RevealCard } from '@/components/cards/RevealCard';
import { InsightsCard } from '@/components/cards/InsightsCard';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { NavDropdown } from '@/components/ui/NavDropdown';
import styles from './page.module.css';

const initialState: DecisionState = {
    title: '',
    options: [],
    criteria: [],
    scores: [],
};

const STEP_LABELS = ['Hook', 'Options', 'Values', 'Score', 'Reveal', 'Insights'];

const variants: Variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
    exit: (dir: number) => ({
        x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.97,
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    }),
};

export default function DecidePage() {
    const { user, loading } = useRequireAuth();
    const { refresh } = useAuth();
    const router = useRouter();

    const [state, setState] = useState<DecisionState>(initialState);
    const [stepIndex, setStepIndex] = useState(0);
    const [dir, setDir] = useState(1);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [limitReached, setLimitReached] = useState(false);

    const currentStep: Step = STEPS[stepIndex];

    // Check decision limit on mount
    useEffect(() => {
        if (user) {
            setLimitReached(user.decisions_remaining === 0);
        }
    }, [user]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: 'var(--grey-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 36, height: 36, border: '3px solid var(--grey-border)', borderTopColor: 'var(--sage)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            </div>
        );
    }

    if (!user) return null; // useRequireAuth handles redirect

    const advance = () => {
        setDir(1);
        setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    };
    const goBack = () => {
        setDir(-1);
        setStepIndex((i) => Math.max(i - 1, 0));
    };

    // Called when user reaches Reveal step — save to backend
    const saveDecision = async (finalState: DecisionState) => {
        setSaving(true);
        setSaveError('');
        try {
            // Map frontend temp UUIDs to label-based payload (backend resolves by label)
            const optionPayload = finalState.options.map((o, i) => ({ label: o.label, order: i }));
            const criteriaPayload = finalState.criteria.map((c) => ({ label: c.label, weight: c.weight }));

            // Build label→index maps to convert temp IDs into backend-compatible labels
            const optionLabelById: Record<string, string> = {};
            finalState.options.forEach((o) => { optionLabelById[o.id] = o.label; });
            const criterionLabelById: Record<string, string> = {};
            finalState.criteria.forEach((c) => { criterionLabelById[c.id] = c.label; });

            const scoresPayload = finalState.scores
                .map((s) => ({
                    option_id: optionLabelById[s.optionId] ?? s.optionId,
                    criterion_id: criterionLabelById[s.criterionId] ?? s.criterionId,
                    score: s.score,
                }))
                .filter((s) => s.option_id && s.criterion_id);

            await decisionsApi.create({
                title: finalState.title,
                options: optionPayload,
                criteria: criteriaPayload,
                scores: scoresPayload,
            });

            await refresh(); // update decisions_remaining
        } catch (err) {
            const msg = err instanceof ApiError ? err.message : 'Failed to save decision';
            setSaveError(msg);
            if (err instanceof ApiError && err.status === 403) {
                setLimitReached(true);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleScoreNext = async (finalState: DecisionState) => {
        setState(finalState);
        await saveDecision(finalState);
        advance();
    };

    const renderCard = () => {
        switch (currentStep) {
            case 'hook':
                return (
                    <HookCard
                        value={state.title}
                        onChange={(title) => setState((s) => ({ ...s, title }))}
                        onNext={advance}
                    />
                );
            case 'options':
                return (
                    <OptionsCard
                        options={state.options}
                        onChange={(options) => setState((s) => ({ ...s, options }))}
                        onNext={advance}
                        onBack={goBack}
                    />
                );
            case 'criteria':
                return (
                    <CriteriaCard
                        criteria={state.criteria}
                        onChange={(criteria) => setState((s) => ({ ...s, criteria }))}
                        onNext={advance}
                        onBack={goBack}
                    />
                );
            case 'score':
                return (
                    <ScoreCard
                        options={state.options}
                        criteria={state.criteria}
                        scores={state.scores}
                        onChange={(scores) => setState((s) => ({ ...s, scores }))}
                        saving={saving}
                        saveError={saveError}
                        onNext={() => handleScoreNext({ ...state })}
                        onBack={goBack}
                    />
                );
            case 'reveal':
                return (
                    <RevealCard
                        decision={state}
                        onNext={advance}
                        onBack={goBack}
                    />
                );
            case 'insights':
                return (
                    <InsightsCard
                        decision={state}
                        onRestart={() => {
                            if (user.decisions_remaining === 0) {
                                setLimitReached(true);
                                return;
                            }
                            setState(initialState);
                            setDir(-1);
                            setStepIndex(0);
                        }}
                    />
                );
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgGlow} />

            {/* Nav */}
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <a href="/decide" className={styles.logoLink}>
                        <span className={styles.logoMark}>Q</span>
                        <span className={styles.logoText}>Decision</span>
                    </a>
                </div>

                <ProgressDots steps={STEP_LABELS} current={stepIndex} />

                <NavDropdown />
            </nav>

            {/* Limit wall */}
            {limitReached ? (
                <div className={styles.cardArea}>
                    <div className={styles.limitCard}>
                        <div className={styles.limitIcon}>⚡</div>
                        <h2 className={styles.limitTitle}>Decision limit reached</h2>
                        <p className={styles.limitText}>
                            You&apos;ve used all 5 of your free decisions. Upgrade to the paid plan to unlock unlimited decisions.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '8px' }}
                            onClick={() => router.push('/dashboard')}
                        >
                            View My Decisions
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.cardArea}>
                    <AnimatePresence mode="wait" custom={dir}>
                        <motion.div
                            key={currentStep}
                            custom={dir}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            className={styles.cardWrapper}
                        >
                            {renderCard()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
