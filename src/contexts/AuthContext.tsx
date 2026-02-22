import React, { createContext, useContext, useState, useEffect } from 'react';
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

    const fetchProfile = async (supabaseUser: SupabaseUser) => {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();

        if (error) {
            console.error('Error fetching profile:', error);
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
    };

    useEffect(() => {
        // Check active session
        const initAuth = async () => {
            const start = Date.now();
            console.log('[Auth] Starting initAuth...');
            try {
                const { data: { session } } = await supabase.auth.getSession();
                console.log(`[Auth] getSession took ${Date.now() - start}ms`, session?.user?.id);
                if (session?.user) {
                    await fetchProfile(session.user);
                    console.log(`[Auth] fetchProfile took ${Date.now() - start}ms total`);
                }
            } catch (error) {
                console.error('[Auth] Error initializing auth:', error);
            } finally {
                setIsLoading(false);
                console.log(`[Auth] initAuth finished in ${Date.now() - start}ms`);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email);

            if (session?.user) {
                // If we already have the profile for this user, don't fetch again
                // unless it's a 'SIGNED_IN' event which might mean a new login
                if (user?.id !== session.user.id || event === 'SIGNED_IN') {
                    await fetchProfile(session.user);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
    };

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                }
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
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
            .update({
                name: updates.name,
                updated_at: new Date().toISOString()
            })
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
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
