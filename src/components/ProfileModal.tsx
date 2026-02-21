import React, { useState } from 'react';
import { X, User, Mail, Save, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, updateProfile, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateProfile({ name });
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        if (confirm('Tem certeza que deseja sair?')) {
            try {
                await logout();
                onClose();
                // Force reload to clear all states and redirect to login
                window.location.href = '/';
            } catch (err) {
                console.error('Logout error:', err);
                alert('Erro ao sair do sistema.');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[var(--bg-card)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[var(--bg-app)]/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-500 rounded-xl text-white">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold dark:text-white">Editar Perfil</h3>
                            <p className="text-xs text-slate-500">Atualize suas informações pessoais</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-500 outline-none rounded-xl p-3 pl-10 text-sm font-medium text-slate-900 dark:text-white transition-all"
                                    placeholder="Seu nome"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 opacity-60 cursor-not-allowed">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">E-mail (Não editável)</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent outline-none rounded-xl p-3 pl-10 text-sm font-medium dark:text-white transition-all cursor-not-allowed"
                                    placeholder="exemplo@email.com"
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Salvar
                            </button>
                        </div>
                    </form>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                        <button
                            onClick={handleLogout}
                            className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-rose-100 dark:border-rose-900/50"
                        >
                            <LogOut size={18} />
                            Sair do Sistema
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
