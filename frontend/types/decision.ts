export interface Option {
    id: string;
    label: string;
}

export interface Criterion {
    id: string;
    label: string;
    weight: number; // 1-5
}

export interface ScoreEntry {
    optionId: string;
    criterionId: string;
    score: number; // 1-5
}

export interface DecisionState {
    title: string;
    options: Option[];
    criteria: Criterion[];
    scores: ScoreEntry[];
}

export type Step = 'hook' | 'options' | 'criteria' | 'score' | 'reveal' | 'insights';

export const STEPS: Step[] = ['hook', 'options', 'criteria', 'score', 'reveal', 'insights'];
