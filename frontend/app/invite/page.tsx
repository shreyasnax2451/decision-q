'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRequireAuth } from '@/lib/auth-context';
import { NavDropdown } from '@/components/ui/NavDropdown';
import styles from './invite.module.css';

export default function Invite() {
    const { user, loading: authLoading } = useRequireAuth();
    const [copied, setCopied] = useState(false);

    if (authLoading) return null;

    const handleCopy = () => {
        const inviteCode = user?.referral_code;
        navigator.clipboard.writeText(inviteCode || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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

            <main className={styles.content}>
                {/* <Link href="/dashboard" className={styles.backBtn}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </Link> */}

                <div className={styles.hero}>
                    <h1>Invite your <span className={styles.highlight}>inner circle.</span></h1>
                    <p className={styles.subtitle}>
                        Structure is better when shared. Every friend you invite unlocks 2 more decisions for you.
                    </p>
                </div>

                <div className={styles.inviteCard}>
                    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--navy-mid)', marginLeft: '4px' }}>
                            Your referral code
                        </label>
                        <div className={styles.referralInput}>
                            <input
                                readOnly
                                value={user?.referral_code || ''}
                                className={styles.codeInput}
                            />
                            <button className={styles.copyBtn} onClick={handleCopy}>
                                {copied ? 'Copied!' : 'Copy Code'}
                            </button>
                        </div>
                    </div>

                    <p className={styles.footerText}>
                        Decisions are added automatically once your friend verifies their account.
                    </p>
                </div>

                <div style={{ marginTop: '80px', opacity: 0.5 }}>
                    <p style={{ fontSize: '0.8rem' }}>Decision-Q Referral Program · Terms Apply</p>
                </div>
            </main>
        </div>
    );
}
