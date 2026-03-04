'use client';
import styles from './ProgressDots.module.css';

interface Props {
    steps: string[];
    current: number;
}

export function ProgressDots({ steps, current }: Props) {
    return (
        <div className={styles.wrap}>
            {steps.map((label, i) => (
                <div key={label} className={styles.dotWrap} title={label}>
                    <div
                        className={`${styles.dot} ${i === current ? styles.dotActive : i < current ? styles.dotDone : ''}`}
                    />
                    {i < steps.length - 1 && (
                        <div className={`${styles.line} ${i < current ? styles.lineDone : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
}
