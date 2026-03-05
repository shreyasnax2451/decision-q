'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { decisionsApi, DecisionListItem } from '@/lib/api';
import { useRequireAuth } from '@/lib/auth-context';
import { NavDropdown } from '@/components/ui/NavDropdown';
import styles from './dashboard.module.css';

export default function Dashboard() {
    const router = useRouter();
    const { user, loading: authLoading } = useRequireAuth();
    const [decisions, setDecisions] = useState<DecisionListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) return;

        const fetchData = async () => {
            try {
                const decisionsData = await decisionsApi.list();
                setDecisions(decisionsData);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className={styles.container}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                    <p>Loading your insights...</p>
                </div>
            </div>
        );
    }

    // Mock insights based on PRD requirements
    const insights = [
        { label: 'Risk Tolerance', value: 65, category: 'Moderate-High' },
        { label: 'Long-term Bias', value: 80, category: 'Strongly Long-term' },
        { label: 'Growth Ratio', value: 45, category: 'Growth vs Comfort' },
        { label: 'Meaning Priority', value: 72, category: 'Purpose vs Money' },
    ];

    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <Link href="/decide" className={styles.logoLink}>
                        <span className={styles.logoMark}>Q</span>
                        <span className={styles.logoText}>Decision</span>
                    </Link>
                </div>
                <NavDropdown />
            </nav>

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <div className={styles.welcomeSection}>
                        <h1>Welcome, {user?.first_name || 'Decider'}!</h1>
                        <p>Everything is clear when you weight what matters.</p>
                    </div>
                    <div className={styles.headerBtns}>
                        <Link href="/invite" className="btn-ghost" style={{ borderStyle: 'dashed' }}>
                            Invite a Friend
                        </Link>
                        <Link href="/decide" className="btn-primary">
                            Start New Decision
                        </Link>
                    </div>
                </header>

                {/* Quick Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Total Decisions</span>
                        <span className={styles.statValue}>{decisions.length}</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Most Weighted</span>
                        <span className={styles.statValue}>Growth</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Avg. Risk Score</span>
                        <span className={styles.statValue}>4.2</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statLabel}>Remaining Decisions</span>
                        <span className={styles.statValue}>{user?.decisions_remaining ?? 5}</span>
                    </div>
                </div>

                <div className={styles.mainGrid}>
                    {/* Left Column: Insights & History */}
                    <section>
                        <div className={styles.insightCard}>
                            <h3 className={styles.sectionTitle}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                                Personal Insight Summary
                            </h3>
                            <div className={styles.insightGrid}>
                                {insights.map((insight) => (
                                    <div key={insight.label} className={styles.insightItem}>
                                        <div className={styles.insightHeader}>
                                            <span>{insight.label}</span>
                                            <span>{insight.category}</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: `${insight.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 className={styles.sectionTitle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" /></svg>
                            Decision History
                        </h3>
                        <div className={styles.historySection}>
                            {decisions.length === 0 ? (
                                <div className={styles.decisionItem} style={{ justifyContent: 'center', cursor: 'default' }}>
                                    <p>No decisions made yet.</p>
                                </div>
                            ) : (
                                decisions.map((d) => (
                                    <div key={d.id} className={styles.decisionItem} onClick={() => router.push(`/decide?id=${d.id}`)}>
                                        <div className={styles.decisionInfo}>
                                            <h4>{d.title}</h4>
                                            <div className={styles.decisionMeta}>
                                                <span>{new Date(d.created_at).toLocaleDateString()}</span>
                                                <span>{d.options_count} options</span>
                                            </div>
                                        </div>
                                        <span className={styles.winnerBadge}>Completed</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Right Column: Comparison & Analytics */}
                    <aside>
                        <div className={styles.comparisonSection}>
                            <h3>Social Comparison</h3>
                            <p className={styles.comparisonText}>
                                How does your decision logic stack up against other high-performers?
                            </p>
                            <div className={styles.comparisonStat}>72%</div>
                            <p className={styles.comparisonText} style={{ marginBottom: 0 }}>
                                of users shared your primary weighting criteria for recent career decisions.
                            </p>
                        </div>

                        <div style={{ marginTop: '32px' }}>
                            <h3 className={styles.sectionTitle}>Trend Analytics</h3>
                            <div className={styles.analyticsLocked}>
                                <div className={styles.lockIcon}>🔒</div>
                                <p className={styles.lockText}>
                                    Coming soon...
                                </p>
                                <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginTop: '8px' }} />
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
