'use client';
import { useState } from 'react';
import { CardShell } from '@/components/ui/CardShell';
import styles from './cards.module.css';

interface Props {
    value: string;
    onChange: (v: string) => void;
    onNext: () => void;
}

export function HookCard({ value, onChange, onNext }: Props) {
    const [localVal, setLocalVal] = useState(value);

    const handleNext = () => {
        if (!localVal.trim()) return;
        onChange(localVal.trim());
        onNext();
    };

    return (
        <CardShell step="01" label="The Hook">
            <p className={styles.cardDesc}>
                What decision are you facing? Be specific — clarity starts here.
            </p>

            <div className={styles.inputGroup}>
                <input
                    className="input-field"
                    type="text"
                    placeholder='e.g. "Should I take the Fintech offer?"'
                    value={localVal}
                    onChange={(e) => setLocalVal(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                    autoFocus
                    maxLength={120}
                />
                <span className={styles.charCount}>{localVal.length}/120</span>
            </div>

            <div className={styles.hint}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1v7m0 3v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Press Enter or click Next to continue
            </div>

            <button
                className="btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={handleNext}
                disabled={!localVal.trim()}
            >
                Next
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </CardShell>
    );
}
