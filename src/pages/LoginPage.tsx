import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Wallet, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('admin@financas.com');
    const [password, setPassword] = useState('123456');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await login(email, password);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Left Side: Visual/Branding */}
            <div className="w-full max-w-md space-y-8 animate-fade-in flex flex-col items-center justify-center p-4 mx-auto">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-500/20 mb-4">
                        <Wallet className="text-white w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight dark:text-white">Seja bem-vindo</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Acesse sua conta para gerenciar suas finanças</p>
                </div>

                <div className="card shadow-xl p-8 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                <button type="button" className="text-xs text-brand-600 hover:text-brand-500 font-medium">Esqueceu a senha?</button>
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
                            className="btn btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-brand-500/30"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-sm text-slate-500">
                            Não tem uma conta? <button className="text-brand-600 font-bold hover:underline">Cadastre-se grátis</button>
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
