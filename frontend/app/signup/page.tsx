'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import styles from '@/components/auth/auth.module.css';

export default function SignupPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await authApi.signup(email, password, firstName, lastName);
            router.push(`/verify?email=${encodeURIComponent(email)}`);
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgGlow} />
            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={styles.logoMark}>Q</span>
                    <span className={styles.logoText}>Decision</span>
                </div>

                <h1 className={styles.heading}>Create your account</h1>
                <p className={styles.subtext}>
                    Make up to 5 structured decisions for Free. No credit card needed.
                </p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.fieldRow}>
                        <div className={styles.fieldWrap}>
                            <label className={styles.label} htmlFor="firstName">First Name</label>
                            <input
                                id="firstName"
                                className={styles.inputDark}
                                type="text"
                                placeholder="Jane"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div className={styles.fieldWrap}>
                            <label className={styles.label} htmlFor="lastName">Last Name</label>
                            <input
                                id="lastName"
                                className={styles.inputDark}
                                type="text"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className={styles.fieldWrap}>
                        <label className={styles.label} htmlFor="email">Email</label>
                        <input
                            id="email"
                            className={styles.inputDark}
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.fieldWrap}>
                        <label className={styles.label} htmlFor="password">Password</label>
                        <input
                            id="password"
                            className={styles.inputDark}
                            type="password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                        />
                    </div>

                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Sending code...' : 'Create Account →'}
                    </button>
                </form>

                <hr className={styles.divider} />
                <p className={styles.footer}>
                    Already have an account?{' '}
                    <Link href="/login" className={styles.footerLink}>Log in</Link>
                </p>
            </div>
        </div>
    );
}
