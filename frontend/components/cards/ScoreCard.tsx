'use client';
import { useState } from 'react';
import { Option, Criterion, ScoreEntry } from '@/types/decision';
import { CardShell } from '@/components/ui/CardShell';
import styles from './cards.module.css';

interface Props {
    options: Option[];
    criteria: Criterion[];
    scores: ScoreEntry[];
    onChange: (scores: ScoreEntry[]) => void;
    saving: boolean;
    saveError: string;
    onNext: () => void;
    onBack: () => void;
}

function getScore(scores: ScoreEntry[], optionId: string, criterionId: string): number {
    return scores.find((s) => s.optionId === optionId && s.criterionId === criterionId)?.score ?? 3;
}

function setScore(scores: ScoreEntry[], optionId: string, criterionId: string, score: number): ScoreEntry[] {
    const existing = scores.find((s) => s.optionId === optionId && s.criterionId === criterionId);
    if (existing) {
        return scores.map((s) =>
            s.optionId === optionId && s.criterionId === criterionId ? { ...s, score: score } : s
        );
    }
    return [...scores, { optionId, criterionId, score: score }];
}

const DOT_LABELS = ['', 'Poor', 'Fair', 'OK', 'Good', 'Great'];

export function ScoreCard({ options, criteria, scores, onChange, saving, saveError, onNext, onBack }: Props) {
    const [activeOption, setActiveOption] = useState(0);
    const opt = options[activeOption];

    const isComplete = options.length > 0 && criteria.length > 0;
    const progressPct = Math.round((activeOption / Math.max(options.length - 1, 1)) * 100);

    return (
        <CardShell step="04" label="Score Each Option">
            <p className={styles.cardDesc}>
                For <strong style={{ color: 'var(--sage-light)' }}>{opt?.label ?? '…'}</strong>, rate how well it satisfies each criterion.
            </p>

            {/* Option tabs */}
            <div className={styles.scoreOptionTabs}>
                {options.map((o, i) => (
                    <button
                        key={o.id}
                        className={`${styles.scoreOptionTab} ${i === activeOption ? styles.scoreOptionTabActive : ''}`}
                        onClick={() => setActiveOption(i)}
                    >
                        {o.label}
                    </button>
                ))}
            </div>

            {/* Progress bar */}
            <div className={styles.scoreProgress}>
                <div className={styles.scoreProgressFill} style={{ width: `${progressPct}%` }} />
            </div>

            {/* Criteria sliders */}
            <div className={styles.scoreCriteriaList}>
                {criteria.map((c) => {
                    const val = getScore(scores, opt.id, c.id);
                    return (
                        <div key={c.id} className={styles.scoreCriterionRow}>
                            <div className={styles.scoreCriterionHeader}>
                                <span className={styles.scoreCriterionLabel}>{c.label}</span>
                                <span className={styles.scoreDotLabel}>{DOT_LABELS[val]}</span>
                                <span className={styles.scoreVal}>{val}</span>
                            </div>
                            <div className={styles.scoreDots}>
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <button
                                        key={n}
                                        className={`${styles.scoreDot} ${val >= n ? styles.scoreDotFilled : ''}`}
                                        onClick={() => onChange(setScore(scores, opt.id, c.id, n))}
                                        aria-label={`Score ${n}`}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {saveError && (
                <p style={{ color: 'var(--rose, #e07070)', fontSize: '13px', margin: '8px 0 0' }}>
                    {saveError}
                </p>
            )}

            <div className={styles.btnRow} style={{ marginTop: '24px' }}>
                <button className="btn-ghost" onClick={onBack} disabled={saving}>
                    ← Back
                </button>
                {activeOption < options.length - 1 ? (
                    <button
                        className="btn-primary"
                        onClick={() => setActiveOption((i) => i + 1)}
                        style={{ flex: 1 }}
                        disabled={!isComplete}
                    >
                        Next Option →
                    </button>
                ) : (
                    <button
                        className="btn-primary"
                        onClick={onNext}
                        disabled={!isComplete || saving}
                        style={{ flex: 1 }}
                    >
                        {saving ? 'Saving…' : 'See the Reveal →'}
                        {!saving && (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
        </CardShell>
    );
}
