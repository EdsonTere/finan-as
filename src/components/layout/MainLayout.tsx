import React, { useState, useMemo } from 'react';
import {
    LayoutDashboard,
    Wallet,
    ArrowUpCircle,
    ArrowDownCircle,
    ArrowLeftRight,
    BarChart3,
    PieChart,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    User,
    LogOut,
    ChevronRight,
    Tag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useFinance, type Transaction } from '../../contexts/FinanceContext';
import { formatCurrency } from '../../lib/utils';

// Helper for Tailwind classes
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
    collapsed?: boolean;
}

const NavItem = ({ icon, label, active, onClick, collapsed }: NavItemProps) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
            active
                ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20"
                : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
        )}
    >
        <span className={cn(active ? "text-white" : "text-slate-400 group-hover:text-brand-500")}>
            {icon}
        </span>
        {!collapsed && <span className="font-medium">{label}</span>}
        {active && !collapsed && <ChevronRight className="ml-auto w-4 h-4 opacity-50" />}

        {collapsed && (
            <div className="absolute left-14 bg-slate-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {label}
            </div>
        )}
    </button>
);

export const MainLayout: React.FC<{
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}> = ({ children, activeTab, onTabChange }) => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [headerSearch, setHeaderSearch] = useState('');
    const { transactions, categories, realtimeStatus } = useFinance();

    const searchResults = useMemo(() => {
        if (!headerSearch.trim()) return [];
        return (transactions || []).filter((t: Transaction) =>
            t.description.toLowerCase().includes(headerSearch.toLowerCase())
        ).slice(0, 5);
    }, [headerSearch, transactions]);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'accounts', label: 'Contas', icon: <Wallet size={20} /> },
        { id: 'categories', label: 'Categorias', icon: <Tag size={20} /> },
        { id: 'income', label: 'Receitas', icon: <ArrowUpCircle size={20} /> },
        { id: 'expenses', label: 'Despesas', icon: <ArrowDownCircle size={20} /> },
        { id: 'transfers', label: 'Transferências', icon: <ArrowLeftRight size={20} /> },
        { id: 'reports', label: 'Relatórios', icon: <BarChart3 size={20} /> },
        { id: 'budgets', label: 'Orçamentos', icon: <PieChart size={20} /> },
        { id: 'settings', label: 'Configurações', icon: <Settings size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-app)] flex transition-colors duration-300">
            {/* Sidebar Desktop */}
            <aside
                className={cn(
                    "hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-[var(--bg-card)] transition-all duration-300 sticky top-0 h-screen",
                    collapsed ? "w-20" : "w-64"
                )}
            >
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wallet className="text-white w-5 h-5" />
                    </div>
                    {!collapsed && <h1 className="font-bold text-xl tracking-tight dark:text-white">Finanças</h1>}
                </div>

                <nav className="flex-1 px-4 space-y-1 mt-4">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.id}
                            {...item}
                            active={activeTab === item.id}
                            collapsed={collapsed}
                            onClick={() => onTabChange(item.id)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                    >
                        {collapsed ? <Menu size={20} /> : <X size={20} />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 text-slate-500"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="relative flex-1 max-w-[150px] sm:max-w-xs ml-2">
                            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3 h-3 sm:w-4 sm:h-4 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="lançamentos..."
                                value={headerSearch}
                                onChange={(e) => setHeaderSearch(e.target.value)}
                                className="bg-white dark:bg-slate-800 border-none rounded-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-1.5 text-[10px] sm:text-sm w-full focus:ring-2 focus:ring-brand-500 outline-none transition-all text-slate-950 dark:text-white font-semibold"
                            />

                            {/* Search Results Dropdown */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-fade-in translate-y-0 min-w-[200px]">
                                    <div className="p-2 border-b border-slate-50 dark:border-slate-800">
                                        <span className="text-[10px] font-black uppercase text-slate-400 px-2">Lançamentos Encontrados</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {searchResults.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setHeaderSearch('');
                                                    // Potential navigation logic here
                                                    onTabChange('income'); // Just an example, maybe it should navigate to a specific tab
                                                }}
                                                className="w-full text-left p-3 hover:bg-[var(--bg-hover)] transition-colors flex items-center justify-between border-b border-slate-50 dark:border-slate-800 last:border-0"
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold dark:text-white">{t.description}</span>
                                                    <span className="text-[9px] text-slate-500 uppercase font-medium">
                                                        {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                                                    </span>
                                                </div>
                                                <span className={cn("text-[10px] font-black", t.type === 'income' ? "text-success" : "text-danger")}>
                                                    {formatCurrency(t.amount)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-4">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            <div className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                realtimeStatus === 'SUBSCRIBED' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                            )}></div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-none uppercase tracking-tighter">
                                {realtimeStatus === 'SUBSCRIBED' ? "Sincronizado" : realtimeStatus}
                            </span>
                        </div>
                        <button className="p-1.5 sm:p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
                            <Bell size={18} className="sm:w-5 sm:h-5" />
                            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-danger rounded-full border-2 border-white dark:border-slate-900"></span>
                        </button>
                        <div className="h-6 sm:h-8 w-[1px] bg-slate-200 dark:border-slate-800 hidden xs:block"></div>
                        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold dark:text-white leading-none">Edson Admin</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
                            </div>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 border border-brand-200 dark:border-brand-800">
                                <User size={16} className="sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="p-4 md:p-8 animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="absolute inset-y-0 left-0 w-3/4 bg-white dark:bg-slate-900 shadow-2xl flex flex-col p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                                    <Wallet className="text-white w-5 h-5" />
                                </div>
                                <h1 className="font-bold text-xl dark:text-white tracking-tight">Finanças</h1>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex-1 space-y-2">
                            {navItems.map((item) => (
                                <NavItem
                                    key={item.id}
                                    {...item}
                                    active={activeTab === item.id}
                                    onClick={() => {
                                        onTabChange(item.id);
                                        setMobileMenuOpen(false);
                                    }}
                                />
                            ))}
                        </nav>
                        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
                            <button className="flex items-center gap-3 text-danger font-medium p-3 w-full hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors">
                                <LogOut size={20} />
                                Sair
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
