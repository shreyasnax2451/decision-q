'use client';
import styles from './SliderInput.module.css';

interface Props {
    value: number;
    onChange: (v: number) => void;
    label: string;
}

const LABELS = ['', 'Not Important', 'Slightly', 'Moderate', 'Important', 'Critical'];

export function SliderInput({ value, onChange, label }: Props) {
    return (
        <div className={styles.wrap}>
            <div className={styles.row}>
                <span className={styles.labelText}>{label}</span>
                <span className={styles.valueDisplay}>{value}</span>
            </div>
            <input
                type="range"
                min={1}
                max={5}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ '--fill-pct': `${((value - 1) / 4) * 100}%` } as React.CSSProperties}
            />
            <div className={styles.scaleHint}>
                <span>1</span>
                <span className={styles.hintLabel}>{LABELS[value]}</span>
                <span>5</span>
            </div>
        </div>
    );
}
