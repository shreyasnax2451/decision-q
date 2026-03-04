const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('dq_token');
}

async function request<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new ApiError(res.status, err.detail ?? 'Something went wrong');
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// ─── Auth ─────────────────────────────────────────────
export interface TokenResponse { access_token: string; token_type: string; }
export interface UserProfile {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    is_verified: boolean;
    created_at: string;
    decisions_used: number;
    decisions_remaining: number;
    referral_code?: string;
}

export const authApi = {
    signup: (email: string, password: string, firstName: string, lastName: string) =>
        request<{ message: string }>('/auth/signup', {
            method: 'POST', body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName }),
        }),

    verify: (email: string, code: string) =>
        request<TokenResponse>('/auth/verify', {
            method: 'POST', body: JSON.stringify({ email, code }),
        }),

    login: (email: string, password: string) =>
        request<TokenResponse>('/auth/login', {
            method: 'POST', body: JSON.stringify({ email, password }),
        }),

    me: () => request<UserProfile>('/auth/me'),
};

// ─── Decisions ─────────────────────────────────────────
export interface DecisionListItem {
    id: string; title: string; created_at: string; options_count: number;
}
export interface DecisionDetail {
    id: string; title: string; created_at: string;
    options: { id: string; label: string; order: number }[];
    criteria: { id: string; label: string; weight: number }[];
    scores: { id: string; option_id: string; criterion_id: string; score: number }[];
}
export interface CreateDecisionPayload {
    title: string;
    options: { label: string; order: number }[];
    criteria: { label: string; weight: number }[];
    scores: { option_id: string; criterion_id: string; score: number }[];
}

export const decisionsApi = {
    list: () => request<DecisionListItem[]>('/decisions'),
    get: (id: string) => request<DecisionDetail>(`/decisions/${id}`),
    create: (payload: CreateDecisionPayload) =>
        request<DecisionDetail>('/decisions', {
            method: 'POST', body: JSON.stringify(payload),
        }),
    delete: (id: string) => request<void>(`/decisions/${id}`, { method: 'DELETE' }),
};
