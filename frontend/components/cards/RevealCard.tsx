'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DecisionState } from '@/types/decision';
import styles from './cards.module.css';

interface Props {
    decision: DecisionState;
    onNext: () => void;
    onBack: () => void;
}

function computeScores(decision: DecisionState) {
    const totalWeight = decision.criteria.reduce((s, c) => s + c.weight, 0);
    return decision.options.map((opt) => {
        const weighted = decision.criteria.reduce((sum, c) => {
            const entry = decision.scores.find(
                (s) => s.optionId === opt.id && s.criterionId === c.id
            );
            return sum + (entry?.score ?? 3) * c.weight;
        }, 0);
        const normalized = totalWeight > 0 ? weighted / totalWeight : 0;
        return { option: opt, score: normalized };
    });
}

export function RevealCard({ decision, onNext, onBack }: Props) {
    const [revealed, setRevealed] = useState(false);
    const results = computeScores(decision).sort((a, b) => b.score - a.score);
    const winner = results[0];
    const maxScore = 5;

    useEffect(() => {
        const t = setTimeout(() => setRevealed(true), 600);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className={styles.revealCard}>
            {/* Glow rings */}
            <div className={styles.revealGlow} />

            <div className={styles.revealStep}>05 · The Reveal</div>

            {!revealed ? (
                <div className={styles.revealLoading}>
                    <div className={styles.loadingSpinner} />
                    <p>Calculating your decision...</p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                    className={styles.revealContent}
                >
                    <div className={styles.winnerBadge}>Winner</div>
                    <div className={styles.winnerName}>{winner.option.label}</div>
                    <div className={styles.winnerScoreDisplay}>
                        <span className={styles.winnerScoreNum}>{winner.score.toFixed(1)}</span>
                        <span className={styles.winnerScoreOf}>/ 5.0</span>
                    </div>

                    {/* All results bar chart */}
                    <div className={styles.resultsChart}>
                        {results.map((r, i) => (
                            <motion.div
                                key={r.option.id}
                                className={styles.resultRow}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                            >
                                <span className={styles.resultLabel}>{r.option.label}</span>
                                <div className={styles.resultBarWrap}>
                                    <motion.div
                                        className={`${styles.resultBar} ${i === 0 ? styles.resultBarWinner : ''}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(r.score / maxScore) * 100}%` }}
                                        transition={{ delay: 0.5 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                                    />
                                </div>
                                <span className={styles.resultScore}>{r.score.toFixed(1)}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className={styles.btnRow} style={{ marginTop: '24px' }}>
                <button className="btn-ghost" onClick={onBack} style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.15)' }}>← Back</button>
                <button
                    className={styles.revealNextBtn}
                    onClick={onNext}
                    disabled={!revealed}
                >
                    View Insights
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
