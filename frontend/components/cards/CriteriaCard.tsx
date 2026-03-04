'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Criterion } from '@/types/decision';
import { CardShell } from '@/components/ui/CardShell';
import { SliderInput } from '@/components/ui/SliderInput';
import styles from './cards.module.css';

interface Props {
    criteria: Criterion[];
    onChange: (v: Criterion[]) => void;
    onNext: () => void;
    onBack: () => void;
}

export function CriteriaCard({ criteria, onChange, onNext, onBack }: Props) {
    const [input, setInput] = useState('');

    const addCriterion = () => {
        const trimmed = input.trim();
        if (!trimmed || criteria.length >= 5) return;
        onChange([...criteria, { id: crypto.randomUUID(), label: trimmed, weight: 3 }]);
        setInput('');
    };

    const updateWeight = (id: string, weight: number) => {
        onChange(criteria.map((c) => (c.id === id ? { ...c, weight } : c)));
    };

    const remove = (id: string) => {
        onChange(criteria.filter((c) => c.id !== id));
    };

    return (
        <CardShell step="03" label="The Values">
            <p className={styles.cardDesc}>
                What matters most to you? Name your criteria and set how important each is.
            </p>

            <div className={styles.criteriaList}>
                <AnimatePresence>
                    {criteria.map((c) => (
                        <motion.div
                            key={c.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.25 }}
                            className={styles.criterionItem}
                        >
                            <div className={styles.criterionHeader}>
                                <span className={styles.criterionLabel}>{c.label}</span>
                                <button className={styles.removeBtn} onClick={() => remove(c.id)}>×</button>
                            </div>
                            <SliderInput
                                value={c.weight}
                                onChange={(v) => updateWeight(c.id, v)}
                                label="Importance"
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {criteria.length < 5 && (
                <div className={styles.inputRow}>
                    <input
                        className="input-field"
                        type="text"
                        placeholder={`e.g. Salary, Growth, Balance...`}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCriterion()}
                        autoFocus
                    />
                    <button className={styles.addBtn} onClick={addCriterion} disabled={!input.trim()}>+</button>
                </div>
            )}

            <div className={styles.btnRow}>
                <button className="btn-ghost" onClick={onBack}>← Back</button>
                <button
                    className="btn-primary"
                    onClick={onNext}
                    disabled={criteria.length < 1}
                    style={{ flex: 1 }}
                >
                    Next
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
        </CardShell>
    );
}
