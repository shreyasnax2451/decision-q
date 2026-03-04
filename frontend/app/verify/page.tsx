'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import styles from '@/components/auth/auth.module.css';

function VerifyForm() {
    const router = useRouter();
    const params = useSearchParams();
    const email = params.get('email') ?? '';
    const { login } = useAuth();

    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown > 0) {
            const t = setTimeout(() => setResendCooldown((n) => n - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendCooldown]);

    const code = digits.join('');

    const handleDigit = (i: number, val: string) => {
        const cleaned = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[i] = cleaned;
        setDigits(next);
        if (cleaned && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        if (code.length < 6) return;
        setError('');
        setLoading(true);
        try {
            const { access_token } = await authApi.verify(email, code);
            await login(access_token);
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof ApiError ? err.message : 'Verification failed');
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setResendCooldown(60);
        try {
            // Posting to /signup with an empty password on an existing
            // unverified account triggers the backend's resend-OTP path.
            await authApi.signup(email, '', '', '').catch(() => { });
        } catch { }
    };

    return (
        <div className={styles.page}>
            <div className={styles.bgGlow} />
            <div className={styles.card}>
                <div className={styles.logo}>
                    <span className={styles.logoMark}>Q</span>
                    <span className={styles.logoText}>Decision</span>
                </div>

                <h1 className={styles.heading}>Check your email</h1>
                <p className={styles.emailHint}>
                    We sent a 6-digit code to <strong>{email || 'your email'}</strong>
                </p>

                <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {error && <div className={styles.error}>{error}</div>}

                    <div className={styles.otpWrap} onPaste={handlePaste}>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={(el) => { inputRefs.current[i] = el; }}
                                className={`${styles.otpDigit} ${d ? styles.filled : ''}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={d}
                                onChange={(e) => handleDigit(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                            />
                        ))}
                    </div>

                    <button
                        className={styles.submitBtn}
                        onClick={handleVerify}
                        disabled={code.length < 6 || loading}
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue →'}
                    </button>

                    <div className={styles.resendRow}>
                        <button
                            className={styles.resendBtn}
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                        >
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Didn't get it? Resend"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div />}>
            <VerifyForm />
        </Suspense>
    );
}
