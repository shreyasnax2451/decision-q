'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Option } from '@/types/decision';
import { CardShell } from '@/components/ui/CardShell';
import styles from './cards.module.css';

interface Props {
    options: Option[];
    onChange: (v: Option[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export function OptionsCard({ options, onChange, onNext, onBack }: Props) {
    const [input, setInput] = useState('');

    const addOption = () => {
        const trimmed = input.trim();
        if (!trimmed || options.length >= 4) return;
        const newOption: Option = { id: crypto.randomUUID(), label: trimmed };
        onChange([...options, newOption]);
        setInput('');
    };

    const removeOption = (id: string) => {
        onChange(options.filter((o) => o.id !== id));
    };

    return (
        <CardShell step="02" label="The Options">
            <p className={styles.cardDesc}>
                What are you choosing between? Add up to 4 options. Order is important, my friend!
            </p>
            <p className={styles.cardDesc}>
                Order is important, my friend!
            </p>

            <div className={styles.optionsList}>
                <AnimatePresence>
                    {options.map((opt, i) => (
                        <motion.div
                            key={opt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className={styles.optionChip}
                        >
                            <span className={styles.optionIndex}>{String.fromCharCode(65 + i)}</span>
                            <span className={styles.optionLabel}>{opt.label}</span>
                            <button
                                className={styles.removeBtn}
                                onClick={() => removeOption(opt.id)}
                                aria-label="Remove option"
                            >
                                ×
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {options.length < 4 && (
                <div className={styles.inputRow}>
                    <input
                        className="input-field"
                        type="text"
                        placeholder={`Option ${options.length + 1}...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addOption()}
                        autoFocus
                    />
                    <button
                        className={styles.addBtn}
                        onClick={addOption}
                        disabled={!input.trim()}
                    >
                        +
                    </button>
                </div>
            )}

            <div className={styles.btnRow}>
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button
                    className="btn-primary"
                    onClick={onNext}
                    disabled={options.length < 2}
                    style={{ flex: 1 }}
                >
                    Next ({options.length}/4)
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </CardShell>
    );
}
