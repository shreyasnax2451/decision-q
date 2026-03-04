'use client';
import styles from './CardShell.module.css';

interface Props {
    step: string;
    label: string;
    children: React.ReactNode;
}

export function CardShell({ step, label, children }: Props) {
    return (
        <div className={styles.shell}>
            <div className={styles.cardHeader}>
                <span className={styles.stepNum}>{step}</span>
                <span className={styles.stepLabel}>{label}</span>
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
}
