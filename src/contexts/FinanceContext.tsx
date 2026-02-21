import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type AccountType = 'bank' | 'wallet' | 'credit' | 'debit' | 'pix' | 'other';

export interface Account {
    id: string;
    name: string;
    balance: number;
    initialBalance: number;
    type: AccountType;
    isActive: boolean;
    color: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    parentId?: string;
    icon: string;
    color: string;
    isActive: boolean;
}

export interface Budget {
    id: string;
    categoryId: string;
    amount: number;
    period: 'monthly' | 'yearly';
    createdAt: string;
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'income' | 'expense' | 'transfer';
    categoryId?: string;
    accountId: string;
    targetAccountId?: string;
    description: string;
    isFixed: boolean;
    isRecurring: boolean;
    installments?: {
        current: number;
        total: number;
        parentId: string;
    };
    attachments: string[];
    status: 'pending' | 'completed';
    createdAt: string;
}

export interface Settings {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    currency: string;
}

interface FinanceContextType {
    accounts: Account[];
    categories: Category[];
    transactions: Transaction[];
    budgets: Budget[];
    settings: Settings;
    isLoading: boolean;
    realtimeStatus: string;
    error: string | null;
    addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
    updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    addAccount: (acc: Omit<Account, 'id'>) => Promise<void>;
    deleteAccount: (id: string) => Promise<void>;
    updateAccount: (id: string, updates: Partial<Account>) => Promise<void>;
    addCategory: (cat: Omit<Category, 'id'>) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
    addBudget: (b: Omit<Budget, 'id' | 'createdAt'>) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
    updateSettings: (updates: Partial<Settings>) => void;
    summary: {
        totalBalance: number;
        monthlyIncome: number;
        monthlyExpense: number;
    };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [realtimeStatus, setRealtimeStatus] = useState('CONNECTING');
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const [settings, setSettings] = useState<Settings>(() => {
        try {
            const stored = localStorage.getItem('finanças_settings');
            if (stored) return JSON.parse(stored);
        } catch (e) {
            console.error('Error parsing settings', e);
        }
        return { theme: 'system', notifications: true, currency: 'BRL' };
    });

    const fetchData = useCallback(async (showLoading = true) => {
        if (!supabase) {
            setError('Supabase client not initialized');
            setIsLoading(false);
            return;
        }

        // We depend on Auth state here, although RLS protects the data.
        // The App.tsx ensures this is only called when authenticated.

        if (showLoading) setIsLoading(true);
        setError(null);

        const timeout = setTimeout(() => {
            if (showLoading) {
                console.warn('Finance data fetch taking too long, forcing complete...');
                setError('A sincronização com o banco de dados está lenta. Tente atualizar a página ou use o botão de Forçar Recarregamento.');
                setIsLoading(false);
            }
        }, 12000);

        try {
            const results = await Promise.all([
                supabase.from('accounts').select('*').order('name'),
                supabase.from('categories').select('*').order('name'),
                supabase.from('transactions').select('*').order('date', { ascending: false }),
                supabase.from('budgets').select('*')
            ]);

            const fetchErrors = results.filter(r => r.error);
            if (fetchErrors.length > 0) {
                console.warn('Partial fetch errors encountered:', fetchErrors);
                // Throw error if something actually failed, including permission denied 42501
                const actualError = fetchErrors.find(r => r.error?.code !== 'PGRST301');
                if (actualError) {
                    const msg = actualError.error?.code === '42501'
                        ? 'Permissão negada (RLS). Rode o script de recuperação no Supabase.'
                        : actualError.error?.message || 'Database error';
                    throw new Error(msg);
                }
            }

            const [accountsRes, categoriesRes, transactionsRes, budgetsRes] = results;

            if (accountsRes.data) setAccounts(accountsRes.data.map(a => ({
                ...a,
                initialBalance: a.initial_balance || 0,
                isActive: a.is_active ?? true
            })));

            if (categoriesRes.data) setCategories(categoriesRes.data.map(c => ({
                ...c,
                isActive: c.is_active ?? true
            })));

            if (transactionsRes.data) setTransactions(transactionsRes.data.map(t => ({
                ...t,
                categoryId: t.category_id,
                accountId: t.account_id,
                targetAccountId: t.target_account_id,
                isFixed: t.is_fixed || false,
                isRecurring: t.is_recurring || false,
                status: t.status || 'completed',
                attachments: t.attachments || []
            })));

            if (budgetsRes.data) setBudgets(budgetsRes.data.map(b => ({
                ...b,
                categoryId: b.category_id
            })));

        } catch (err: any) {
            console.error('Error fetching data from Supabase:', err);
            setError(err.message || 'Failed to connect to database');
        } finally {
            clearTimeout(timeout);
            if (showLoading) setIsLoading(false);
        }
    }, []);

    // Initial load and reload on auth change
    useEffect(() => {
        if (isAuthenticated) {
            console.log('User authenticated, fetching finance data...');
            fetchData();
        } else {
            // Clear state on logout
            setAccounts([]);
            setCategories([]);
            setTransactions([]);
            setBudgets([]);
            setIsLoading(false);
        }
    }, [fetchData, isAuthenticated]);

    // Realtime subscription
    useEffect(() => {
        let retryTimeout: any;

        const subscribe = () => {
            console.log('Attempting to subscribe to Realtime...');
            const channel = supabase
                .channel('db_changes')
                .on('postgres_changes', { event: '*', schema: 'public' }, () => {
                    fetchData(false);
                })
                .subscribe((status, err) => {
                    console.log('Realtime status:', status, err);
                    setRealtimeStatus(status);

                    if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || status === 'CLOSED') {
                        // Attempt to reconnect after 5 seconds
                        clearTimeout(retryTimeout);
                        retryTimeout = setTimeout(() => {
                            console.log('Retrying Realtime connection...');
                            subscribe();
                        }, 5000);
                    }
                });

            return channel;
        };

        const channel = subscribe();

        return () => {
            clearTimeout(retryTimeout);
            supabase.removeChannel(channel);
        };
    }, [fetchData]);

    useEffect(() => {
        localStorage.setItem('finanças_settings', JSON.stringify(settings));
        const root = window.document.documentElement;
        if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [settings]);

    const updateAccountBalance = async (accountId: string, change: number) => {
        const acc = accounts.find(a => a.id === accountId);
        if (!acc) return;
        const newBalance = acc.balance + change;
        const { error } = await supabase.from('accounts').update({ balance: newBalance }).eq('id', accountId);
        if (!error) setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: newBalance } : a));
    };

    const addTransaction = async (t: Omit<Transaction, 'id' | 'createdAt'>) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const { data, error } = await supabase.from('transactions').insert([{
            date: t.date,
            amount: t.amount,
            type: t.type,
            category_id: t.categoryId || null,
            account_id: t.accountId,
            target_account_id: t.targetAccountId || null,
            description: t.description,
            status: t.status,
            attachments: t.attachments,
            is_fixed: t.isFixed,
            is_recurring: t.isRecurring,
            user_id: userId
        }]).select().single();

        if (error) {
            console.error('Error adding transaction:', error);
            const detailedError = new Error(error.message || 'Erro desconhecido no banco de dados');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            throw detailedError;
        }
        const newT: Transaction = {
            ...data,
            categoryId: data.category_id,
            accountId: data.account_id,
            targetAccountId: data.target_account_id,
            isFixed: data.is_fixed,
            isRecurring: data.is_recurring
        };
        setTransactions(prev => [newT, ...prev]);
        await updateAccountBalance(t.accountId, t.type === 'income' ? t.amount : -t.amount);
        if (t.type === 'transfer' && t.targetAccountId) await updateAccountBalance(t.targetAccountId, t.amount);
    };

    const deleteTransaction = async (id: string) => {
        const t = transactions.find(trans => trans.id === id);
        if (!t) return;
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
        setTransactions(prev => prev.filter(trans => trans.id !== id));
        await updateAccountBalance(t.accountId, t.type === 'income' ? -t.amount : t.amount);
        if (t.type === 'transfer' && t.targetAccountId) await updateAccountBalance(t.targetAccountId, -t.amount);
    };

    const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
        const dbUpdates: any = { ...updates };
        if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
        if (updates.accountId) dbUpdates.account_id = updates.accountId;
        if (updates.targetAccountId) dbUpdates.target_account_id = updates.targetAccountId;
        if (updates.isFixed !== undefined) dbUpdates.is_fixed = updates.isFixed;
        if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;

        // Remove camelCase keys
        ['categoryId', 'accountId', 'targetAccountId', 'isFixed', 'isRecurring'].forEach(key => delete dbUpdates[key]);

        const { error } = await supabase.from('transactions').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating transaction:', error);
            throw error;
        }
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const addAccount = async (acc: Omit<Account, 'id'>) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const { data, error } = await supabase.from('accounts').insert([{
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            initial_balance: acc.initialBalance,
            is_active: acc.isActive,
            color: acc.color,
            user_id: userId
        }]).select().single();
        if (error) {
            console.error('Error adding account:', error);
            const detailedError = new Error(error.message || 'Erro ao adicionar conta');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setAccounts(prev => [...prev, { ...data, initialBalance: data.initial_balance, isActive: data.is_active }]);
    };

    const deleteAccount = async (id: string) => {
        const { error } = await supabase.from('accounts').delete().eq('id', id);
        if (error) {
            console.error('Error deleting account:', error);
            const detailedError = new Error(error.message || 'Erro ao excluir conta');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    const updateAccount = async (id: string, updates: Partial<Account>) => {
        const dbUpdates: any = { ...updates };
        if (updates.initialBalance !== undefined) dbUpdates.initial_balance = updates.initialBalance;
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        // Remove camelCase keys
        delete dbUpdates.initialBalance;
        delete dbUpdates.isActive;

        const { error } = await supabase.from('accounts').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating account:', error);
            const detailedError = new Error(error.message || 'Erro ao atualizar conta');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, ...updates } : acc));
    };

    const addCategory = async (cat: Omit<Category, 'id'>) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const { data, error } = await supabase.from('categories').insert([{
            name: cat.name,
            type: cat.type,
            icon: cat.icon,
            color: cat.color,
            is_active: cat.isActive,
            user_id: userId
        }]).select().single();
        if (error) {
            console.error('Error adding category:', error);
            const detailedError = new Error(error.message || 'Erro ao adicionar categoria');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setCategories(prev => [...prev, { ...data, isActive: data.is_active }]);
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) {
            console.error('Error deleting category:', error);
            const detailedError = new Error(error.message || 'Erro ao excluir categoria');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setCategories(prev => prev.filter(cat => cat.id !== id));
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        const dbUpdates: any = { ...updates };
        if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

        // Remove camelCase
        delete dbUpdates.isActive;

        const { error } = await supabase.from('categories').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating category:', error);
            const detailedError = new Error(error.message || 'Erro ao atualizar categoria');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
    };

    const addBudget = async (b: Omit<Budget, 'id' | 'createdAt'>) => {
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        const { data, error } = await supabase.from('budgets').insert([{
            category_id: b.categoryId || null,
            amount: b.amount,
            period: b.period,
            user_id: userId
        }]).select().single();
        if (error) {
            console.error('Error adding budget:', error);
            const detailedError = new Error(error.message || 'Erro ao adicionar orçamento');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setBudgets(prev => [...prev, { ...data, categoryId: data.category_id }]);
    };

    const deleteBudget = async (id: string) => {
        const { error } = await supabase.from('budgets').delete().eq('id', id);
        if (error) {
            console.error('Error deleting budget:', error);
            const detailedError = new Error(error.message || 'Erro ao excluir orçamento');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setBudgets(prev => prev.filter(b => b.id !== id));
    };

    const updateBudget = async (id: string, updates: Partial<Budget>) => {
        const dbUpdates: any = { ...updates };
        if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;

        // Remove camelCase
        delete dbUpdates.categoryId;

        const { error } = await supabase.from('budgets').update(dbUpdates).eq('id', id);
        if (error) {
            console.error('Error updating budget:', error);
            const detailedError = new Error(error.message || 'Erro ao atualizar orçamento');
            (detailedError as any).details = error.details;
            (detailedError as any).hint = error.hint;
            (detailedError as any).code = error.code;
            throw detailedError;
        }
        setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const updateSettings = (updates: Partial<Settings>) => setSettings(prev => ({ ...prev, ...updates }));

    const summary = useMemo(() => {
        const currentMonthTag = new Date().toISOString().substring(0, 7);
        return {
            totalBalance: (accounts || []).reduce((acc, curr) => acc + (parseFloat(curr.balance.toString()) || 0), 0),
            monthlyIncome: (transactions || []).filter(t => t.type === 'income' && t.date.substring(0, 7) === currentMonthTag).reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0),
            monthlyExpense: (transactions || []).filter(t => t.type === 'expense' && t.date.substring(0, 7) === currentMonthTag).reduce((acc, curr) => acc + (parseFloat(curr.amount.toString()) || 0), 0),
        };
    }, [accounts, transactions]);

    return (
        <FinanceContext.Provider value={{
            accounts, categories, transactions, budgets, settings, isLoading, realtimeStatus, error,
            addTransaction, updateTransaction, deleteTransaction, addAccount, deleteAccount, updateAccount,
            addCategory, deleteCategory, updateCategory, addBudget, deleteBudget, updateBudget,
            updateSettings, summary
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

export const useFinance = () => {
    const context = useContext(FinanceContext);
    if (context === undefined) throw new Error('useFinance must be used within a FinanceProvider');
    return context;
};
