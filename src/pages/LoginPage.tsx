import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Lock, Mail, Eye, EyeOff, Loader2, User as UserIcon } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const { login, signUp } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signUp(email, password, name);
                setSuccess('Cadastro realizado! Por favor, verifique seu e-mail para confirmar a conta (se habilitado no Supabase) ou tente fazer login.');
                setIsLogin(true);
                setPassword('');
            }
        } catch (err: any) {
            console.error(err);
            const message = err.message || '';

            if (message.includes('rate limit exceeded')) {
                setError('Limite de tentativas excedido. Por favor, aguarde alguns minutos antes de tentar novamente.');
            } else if (message.includes('Invalid login credentials')) {
                setError('E-mail ou senha incorretos. Por favor, verifique seus dados.');
            } else if (message.includes('User already registered')) {
                setError('Este e-mail já está em uso por outra conta.');
            } else if (message.includes('Email not confirmed')) {
                setError('E-mail ainda não confirmado. Por favor, verifique sua caixa de entrada.');
            } else if (message.includes('Password should be at least 6 characters')) {
                setError('A senha deve ter pelo menos 6 caracteres.');
            } else {
                setError(message || 'Ocorreu um erro inesperado. Tente novamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="w-full max-w-md space-y-8 animate-fade-in flex flex-col items-center justify-center p-4 mx-auto">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/20 mb-4">
                        <Wallet className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">
                        {isLogin ? 'Seja bem-vindo' : 'Crie sua conta'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isLogin ? 'Acesse sua conta para gerenciar suas finanças' : 'Comece hoje mesmo a organizar suas finanças'}
                    </p>
                </div>

                <div className="card shadow-xl p-8 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 w-full">
                    {error && (
                        <div className="mb-4 p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm font-medium">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-sm font-medium">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold dark:text-slate-300">Nome</label>
                                <div className="relative group">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="input pl-11"
                                        placeholder="Seu nome completo"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-semibold dark:text-slate-300">E-mail</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-11"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-semibold dark:text-slate-300">Senha</label>
                                {isLogin && (
                                    <button type="button" className="text-xs text-brand-600 hover:text-brand-500 font-medium">
                                        Esqueceu a senha?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-11"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={isSubmitting}
                            className="btn btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (isLogin ? 'Entrar' : 'Cadastrar')}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-sm text-slate-500">
                            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'} {' '}
                            <button
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="text-brand-600 font-bold hover:underline"
                            >
                                {isLogin ? 'Cadastre-se grátis' : 'Faça login agora'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-xs text-slate-400 dark:text-slate-600">
                    © 2026 Finanças Pro. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};
