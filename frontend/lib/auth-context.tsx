'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, UserProfile } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextValue {
    user: UserProfile | null;
    token: string | null;
    loading: boolean;
    login: (token: string) => Promise<void>;
    logout: () => void;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchMe = useCallback(async () => {
        try {
            const me = await authApi.me();
            setUser(me);
        } catch {
            setUser(null);
            setToken(null);
            localStorage.removeItem('dq_token');
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('dq_token');
        if (stored) {
            setToken(stored);
            fetchMe().finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [fetchMe]);

    const login = useCallback(async (newToken: string) => {
        localStorage.setItem('dq_token', newToken);
        setToken(newToken);
        const me = await authApi.me();
        setUser(me);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('dq_token');
        setToken(null);
        setUser(null);
        router.push('/login');
    }, [router]);

    const refresh = useCallback(async () => {
        await fetchMe();
    }, [fetchMe]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

/** Redirects to /login if not authenticated. Shows nothing while loading. */
export function useRequireAuth() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    return { user, loading };
}
