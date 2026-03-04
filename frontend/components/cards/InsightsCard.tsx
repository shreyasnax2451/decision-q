'use client';
import { DecisionState } from '@/types/decision';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import styles from './cards.module.css';

interface Props {
    decision: DecisionState;
    onRestart: () => void;
}

function computeInsights(decision: DecisionState) {
    const totalWeight = decision.criteria.reduce((s, c) => s + c.weight, 0);
    const results = decision.options.map((opt) => {
        const weighted = decision.criteria.reduce((sum, c) => {
            const entry = decision.scores.find(
                (s) => s.optionId === opt.id && s.criterionId === c.id
            );
            return sum + (entry?.score ?? 3) * c.weight;
        }, 0);
        return { label: opt.label, score: totalWeight > 0 ? weighted / totalWeight : 0 };
    });

    // Radar data: per option avg score per criterion
    const winner = results.sort((a, b) => b.score - a.score)[0];
    const radarData = decision.criteria.map((c) => {
        const scores = decision.options.map((o) => {
            return decision.scores.find((s) => s.optionId === o.id && s.criterionId === c.id)?.score ?? 3;
        });
        return { subject: c.label, value: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 20) };
    });

    // Bias: dominant criterion by weight
    const topCriterion = [...decision.criteria].sort((a, b) => b.weight - a.weight)[0];
    const moneyKeywords = ['salary', 'pay', 'money', 'compensation', 'income', 'finance'];
    const meaningKeywords = ['growth', 'impact', 'purpose', 'meaning', 'learn', 'network'];
    const topLabel = topCriterion?.label?.toLowerCase() ?? '';
    const moneyLean = moneyKeywords.some((k) => topLabel.includes(k));
    const meaningLean = meaningKeywords.some((k) => topLabel.includes(k));
    const leanLabel = moneyLean ? 'Money' : meaningLean ? 'Meaning' : 'Balanced';

    return { winner, results, radarData, topCriterion, leanLabel };
}

export function InsightsCard({ decision, onRestart }: Props) {
    const { winner, results, radarData, topCriterion, leanLabel } = computeInsights(decision);

    // Mock social stats
    const mockCrowdPct = Math.round(50 + winner.score * 10);

    return (
        <div className={styles.insightsCard}>
            <div className={styles.insightsHeader}>
                <div className={styles.revealStep} style={{ color: 'var(--sage-light)' }}>06 · Insights</div>
                <h2 className={styles.insightsTitle}>Your Decision Profile</h2>
            </div>

            <div className={styles.insightsGrid}>
                {/* Radar Chart */}
                <div className={styles.insightPanel}>
                    <div className={styles.insightPanelLabel}>Criteria Balance</div>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                <PolarGrid stroke="rgba(125,168,123,0.2)" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                />
                                <Radar
                                    dataKey="value"
                                    stroke="var(--sage)"
                                    fill="var(--sage)"
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Bias indicator */}
                <div className={styles.insightPanel}>
                    <div className={styles.insightPanelLabel}>Your Bias</div>
                    <div className={styles.biasDisplay}>
                        <div className={styles.biasLabel}>Top weight: <strong>{topCriterion?.label ?? '—'}</strong></div>
                        <div className={styles.biasPill}>{leanLabel} lean</div>
                    </div>
                    <div className={styles.biasBar}>
                        <span>Money</span>
                        <div className={styles.biasFill}>
                            <div
                                className={styles.biasFillInner}
                                style={{ marginLeft: leanLabel === 'Money' ? '0%' : leanLabel === 'Meaning' ? '60%' : '40%', width: '40%' }}
                            />
                        </div>
                        <span>Meaning</span>
                    </div>
                </div>

                {/* Scores table */}
                <div className={styles.insightPanel} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.insightPanelLabel}>All Options</div>
                    <div className={styles.scoresTable}>
                        {results.map((r, i) => (
                            <div key={r.label} className={`${styles.scoreRow} ${i === 0 ? styles.scoreRowWinner : ''}`}>
                                <span className={styles.scoreRank}>{i + 1}</span>
                                <span className={styles.scoreName}>{r.label}</span>
                                <div className={styles.scoreMiniBar}>
                                    <div className={styles.scoreMiniBarFill} style={{ width: `${(r.score / 5) * 100}%` }} />
                                </div>
                                <span className={styles.scoreNum}>{r.score.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Crowd */}
                <div className={styles.insightPanel} style={{ gridColumn: '1 / -1' }}>
                    <div className={styles.insightPanelLabel}>The Crowd&apos;s Choice</div>
                    <div className={styles.crowdStat}>
                        <span className={styles.crowdPct}>{mockCrowdPct}%</span>
                        <span className={styles.crowdText}>of users in similar decisions chose <strong>{winner.label}</strong></span>
                    </div>
                </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: '8px', background: 'var(--sage)' }} onClick={onRestart}>
                ↺ Start a New Decision
            </button>
        </div>
    );
}
