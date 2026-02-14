import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFinance } from '../contexts/FinanceContext';
import { User, Bell, Shield, Moon, Sun, LogOut, ChevronRight, Palette } from 'lucide-react';
import { cn } from '../lib/utils';
import { ProfileModal } from '../components/ProfileModal';

export const SettingsPage: React.FC = () => {
    const { logout, user } = useAuth();
    const { settings, updateSettings } = useFinance();
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const toggleTheme = () => {
        const nextTheme = settings.theme === 'light' ? 'dark' :
            settings.theme === 'dark' ? 'system' : 'light';
        updateSettings({ theme: nextTheme });
    };

    const sections = [
        {
            title: 'Perfil',
            items: [
                {
                    id: 'usr',
                    label: 'Dados do Usuário',
                    icon: <User size={18} />,
                    desc: user?.name || 'Altere seu nome, email e senha',
                    onClick: () => setIsProfileModalOpen(true)
                },
                {
                    id: 'notif',
                    label: 'Notificações',
                    icon: <Bell size={18} />,
                    desc: 'Gerencie alertas de contas a vencer',
                    action: <div className={`w-10 h-6 rounded-full p-1 transition-colors ${settings.notifications ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`} onClick={(e) => { e.stopPropagation(); updateSettings({ notifications: !settings.notifications }); }}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.notifications ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                }
            ]
        },
        {
            title: 'Sistema',
            items: [
                {
                    id: 'theme',
                    label: 'Tema e Aparência',
                    icon: <Palette size={18} />,
                    desc: settings.theme === 'light' ? 'Modo Claro' : settings.theme === 'dark' ? 'Modo Escuro' : 'Seguir Sistema',
                    onClick: toggleTheme,
                    action: (
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                            <div className={cn("p-1.5 rounded-md transition-all", settings.theme === 'light' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400")}>
                                <Sun size={14} />
                            </div>
                            <div className={cn("p-1.5 rounded-md transition-all", settings.theme === 'dark' ? "bg-white dark:bg-slate-700 text-brand-600 shadow-sm" : "text-slate-400")}>
                                <Moon size={14} />
                            </div>
                        </div>
                    )
                },
                { id: 'priv', label: 'Privacidade e Segurança', icon: <Shield size={18} />, desc: 'Controle de acesso e biometria' }
            ]
        }
    ];

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <header>
                <h2 className="text-2xl font-bold dark:text-white">Configurações</h2>
                <p className="text-slate-500 dark:text-slate-400">Personalize sua experiência no Finanças.</p>
            </header>

            <div className="space-y-8">
                {sections.map(section => (
                    <div key={section.title}>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-4">{section.title}</h3>
                        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            {section.items.map((item, idx) => (
                                <button
                                    key={item.id}
                                    onClick={item.onClick}
                                    className={cn(
                                        "w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left",
                                        idx !== section.items.length - 1 && "border-b border-slate-50 dark:border-slate-800"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 group-hover:text-brand-600 transition-colors">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white">{item.label}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.action}
                                        <ChevronRight size={16} className="text-slate-300" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 p-4 text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/20 rounded-2xl hover:bg-rose-100 transition-colors mt-8"
                >
                    <LogOut size={20} /> Sair da Conta
                </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-12 pb-8">
                Versão 1.0.0 (v4 Tailwind) • Finanças Controle © 2026
            </p>

            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
        </div>
    );
};
