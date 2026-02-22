import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    avatar_url?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (updates: Partial<User>) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isFirstLoad = useRef(true);

    const fetchProfile = async (supabaseUser: SupabaseUser) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            if (error) {
                console.warn('[Auth] Profile fetch failed, using metadata fallback:', error.message);
                setUser({
                    id: supabaseUser.id,
                    email: supabaseUser.email || '',
                    name: supabaseUser.user_metadata?.name || 'Usuário',
                    role: 'user'
                });
                return;
            }

            setUser({
                id: supabaseUser.id,
                email: supabaseUser.email || '',
                name: profile.name || 'Usuário',
                role: profile.role || 'user',
                avatar_url: profile.avatar_url
            });
        } catch (err) {
            console.error('[Auth] Unexpected error in fetchProfile:', err);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isLoading && isFirstLoad.current) {
                console.warn('[Auth] Loading taking too long (10s), forcing recovery...');
                setIsLoading(false);
            }
        }, 10000);

        const initAuth = async () => {
            const start = Date.now();
            console.log('[Auth] Initializing session...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;

                if (session?.user) {
                    console.log('[Auth] Session found, fetching profile...');
                    await fetchProfile(session.user);
                } else {
                    console.log('[Auth] No active session found.');
                }
            } catch (error: any) {
                console.error('[Auth] Error in initAuth:', error.message);
            } finally {
                setIsLoading(false);
                isFirstLoad.current = false;
                clearTimeout(timeout);
                console.log(`[Auth] Auth initialized in ${Date.now() - start}ms`);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('[Auth] State change event:', event);

            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setUser(null);
            }

            // Only finalize loading if it's still true
            setIsLoading(false);
            isFirstLoad.current = false;
        });

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } }
        });
        if (error) throw error;
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('[Auth] Error signing out:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('supabase.auth.token');
            window.dispatchEvent(new Event('storage'));
        }
    };

    const updateProfile = async (updates: Partial<User>) => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .update({ name: updates.name, updated_at: new Date().toISOString() })
            .eq('id', user.id);
        if (error) throw error;
        setUser(prev => prev ? { ...prev, ...updates } : null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signUp, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
