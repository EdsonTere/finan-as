import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { Search, Trash2, Calendar, Wallet } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '../lib/utils';
import { TransactionModal } from '../components/TransactionModal';

interface TransactionsPageProps {
    type?: 'all' | 'income' | 'expense' | 'transfer';
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ type = 'all' }) => {
    const { transactions, categories, accounts, deleteTransaction } = useFinance();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>(type);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'income' | 'expense' | 'transfer'>('expense');

    const filteredTransactions = useMemo(() => {
        return (transactions || []).filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || t.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [transactions, searchTerm, typeFilter]);

    const openModal = (type: 'income' | 'expense' | 'transfer') => {
        setModalType(type);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Lançamentos</h2>
                    <p className="text-slate-500 dark:text-slate-400">Histórico completo de sua movimentação financeira.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => openModal('income')} className="btn btn-primary bg-success hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 text-xs py-2 px-4">
                        Nova Receita
                    </button>
                    <button onClick={() => openModal('expense')} className="btn btn-primary bg-danger hover:bg-rose-600 shadow-lg shadow-rose-500/20 text-xs py-2 px-4">
                        Nova Despesa
                    </button>
                    <button onClick={() => openModal('transfer')} className="btn btn-primary bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 text-xs py-2 px-4">
                        Transferência
                    </button>
                </div>
            </header>

            <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Buscar transações..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="input pl-10 text-slate-950 dark:text-white font-semibold"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'income', 'expense', 'transfer'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTypeFilter(t as any)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider",
                                    typeFilter === t
                                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20"
                                        : "bg-slate-50 text-slate-500 dark:bg-slate-800 hover:bg-slate-100"
                                )}
                            >
                                {t === 'all' ? 'Tudo' : t === 'income' ? 'Receitas' : t === 'expense' ? 'Despesas' : 'Transf.'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card overflow-hidden border-none p-0 relative">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-400 text-[10px] border-b border-slate-50 dark:border-slate-800 uppercase tracking-widest font-bold">
                                <th className="px-6 py-4">Status & Data</th>
                                <th className="px-6 py-4">Descrição</th>
                                <th className="px-6 py-4">Categoria</th>
                                <th className="px-6 py-4">Conta</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="group hover:bg-[var(--bg-hover)] transition-colors border-b border-slate-50 dark:border-slate-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                t.type === 'income' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                            )}></div>
                                            <span className="text-xs font-medium dark:text-slate-400">{formatDate(t.date)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold dark:text-white">{t.description}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                                            {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Wallet size={12} />
                                            {accounts.find(a => a.id === t.accountId)?.name || 'N/A'}
                                        </div>
                                    </td>
                                    <td className={cn("px-6 py-4 text-right font-black text-sm",
                                        t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                                        {formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={async () => {
                                                if (confirm('Excluir esta transação?')) {
                                                    try {
                                                        await deleteTransaction(t.id);
                                                    } catch (err) {
                                                        alert('Erro ao excluir transação.');
                                                    }
                                                }
                                            }}
                                            className="p-2 text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredTransactions.map(t => (
                        <div key={t.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        t.type === 'income' ? "bg-emerald-500" : "bg-rose-500"
                                    )}></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDate(t.date)}</span>
                                </div>
                                <span className={cn("font-black text-sm",
                                    t.type === 'income' ? "text-emerald-600" : "text-rose-600")}>
                                    {formatCurrency(t.amount)}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-bold dark:text-white">{t.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-tighter">
                                        {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                                    </span>
                                    <span className="text-[9px] text-slate-400 flex items-center gap-1">
                                        <Wallet size={10} />
                                        {accounts.find(a => a.id === t.accountId)?.name || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button
                                    onClick={() => deleteTransaction(t.id)}
                                    className="px-3 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 rounded-lg uppercase tracking-wider"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTransactions.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                        <Calendar size={48} className="mb-4 opacity-10" />
                        <p className="font-medium">Nenhum lançamento encontrado.</p>
                        {(searchTerm || typeFilter !== 'all') && (
                            <button
                                onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
                                className="text-brand-600 font-bold mt-2 hover:underline text-sm"
                            >
                                Limpar filtros
                            </button>
                        )}
                    </div>
                )}
            </div>

            <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} type={modalType} />
        </div>
    );
};
