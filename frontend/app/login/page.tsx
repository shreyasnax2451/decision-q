'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import styles from '@/components/auth/auth.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { access_token } = await authApi.login(email, password);
            await login(access_token);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Login failed');
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

                <h1 className={styles.heading}>Welcome back</h1>
                <p className={styles.subtext}>Log in to resume your decisions.</p>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {error && <div className={styles.error}>{error}</div>}

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
                            autoFocus
                        />
                    </div>

                    <div className={styles.fieldWrap}>
                        <label className={styles.label} htmlFor="password">Password</label>
                        <input
                            id="password"
                            className={styles.inputDark}
                            type="password"
                            placeholder="Your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className={styles.submitBtn} type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Log In →'}
                    </button>
                </form>

                <hr className={styles.divider} />
                <p className={styles.footer}>
                    No account yet?{' '}
                    <Link href="/signup" className={styles.footerLink}>Sign up free</Link>
                </p>
            </div>
        </div>
    );
}
