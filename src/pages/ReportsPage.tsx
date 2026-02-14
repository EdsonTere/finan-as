import React, { useState, useMemo } from 'react';
import { useFinance } from '../contexts/FinanceContext';
import { FileDown, Printer, FileText, Search, X } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export const ReportsPage: React.FC = () => {
    const { transactions, categories, accounts } = useFinance();

    // Filter State
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    });
    const [categoryId, setCategoryId] = useState('all');
    const [accountId, setAccountId] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = useMemo(() => {
        return (transactions || []).filter(t => {
            const tDate = t.date; // YYYY-MM-DD
            const matchesDate = !startDate || !endDate ? true : (tDate >= startDate && tDate <= endDate);
            const matchesCategory = categoryId === 'all' || t.categoryId === categoryId;
            const matchesAccount = accountId === 'all' || t.accountId === accountId;
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesDate && matchesCategory && matchesAccount && matchesSearch;
        });
    }, [transactions, startDate, endDate, categoryId, accountId, searchTerm]);

    const setPreset = (type: string) => {
        const now = new Date();
        if (type === 'Mensal') {
            setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
            setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);
        } else if (type === 'Anual') {
            setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]);
            setEndDate(new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]);
        }
    };

    const exportCSV = () => {
        const headers = ['Data', 'Descricao', 'Categoria', 'Conta', 'Tipo', 'Valor'];
        const rows = filteredTransactions.map(t => [
            t.date,
            t.description,
            categories.find(c => c.id === t.categoryId)?.name || 'Geral',
            accounts.find(a => a.id === t.accountId)?.name || 'N/A',
            t.type === 'income' ? 'Receita' : t.type === 'expense' ? 'Despesa' : 'Transferência',
            t.amount.toString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `relatorio_${startDate}_a_${endDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Relatórios e Exportação</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gere documentos detalhados de suas movimentações.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={exportCSV}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <FileDown size={18} /> Exportar CSV
                    </button>
                    <button onClick={() => window.print()} className="btn btn-primary bg-brand-600 shadow-lg shadow-brand-500/20 flex items-center gap-2">
                        <Printer size={18} /> Imprimir
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <aside className="md:col-span-1 space-y-4">
                    <div className="card p-4 space-y-6">
                        <div>
                            <h4 className="font-bold text-xs mb-3 uppercase tracking-wider text-slate-400">Atalhos</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['Mensal', 'Anual'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setPreset(type)}
                                        className="px-3 py-2 rounded-lg text-xs font-bold transition-all bg-slate-50 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 border border-slate-100 dark:border-slate-700"
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Filtros</h4>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Início</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="input text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Fim</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="input text-xs h-9"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Conta</label>
                                <select
                                    value={accountId}
                                    onChange={(e) => setAccountId(e.target.value)}
                                    className="input text-xs h-9"
                                >
                                    <option value="all">Todas as Contas</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Categoria</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="input text-xs h-9"
                                >
                                    <option value="all">Todas as Categorias</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setCategoryId('all');
                                        setAccountId('all');
                                        setSearchTerm('');
                                    }}
                                    className="w-full py-2 text-[10px] font-black uppercase text-slate-400 hover:text-danger transition-colors flex items-center justify-center gap-1"
                                >
                                    <X size={12} /> Limpar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                <section className="md:col-span-3 space-y-6">
                    <div className="card">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold dark:text-white">Extrato Consolidado</h3>
                                    <p className="text-[10px] font-black uppercase text-slate-400">
                                        {filteredTransactions.length} transações encontradas
                                    </p>
                                </div>
                            </div>
                            <div className="relative flex-1 max-w-xs">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Buscar na listagem..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input pl-10 text-xs h-9 text-slate-950 dark:text-white font-semibold"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {/* Desktop Table View */}
                            <table className="hidden md:table w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] border-b border-slate-100 dark:border-slate-800 font-black uppercase tracking-wider">
                                        <th className="pb-4">Data</th>
                                        <th className="pb-4">Descrição</th>
                                        <th className="pb-4">Categoria / Conta</th>
                                        <th className="pb-4 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {filteredTransactions.map(t => (
                                        <tr key={t.id} className="text-sm group hover:bg-[var(--bg-hover)] transition-colors">
                                            <td className="py-4 text-slate-500 text-xs">{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="py-4 font-semibold dark:text-white">{t.description}</td>
                                            <td className="py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[9px] font-black uppercase tracking-tight text-brand-600">
                                                        {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                                                    </span>
                                                    <span className="text-[9px] font-medium text-slate-400">
                                                        {accounts.find(a => a.id === t.accountId)?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className={cn("py-4 text-right font-black", t.type === 'income' ? 'text-success' : t.type === 'expense' ? 'text-danger' : 'text-slate-400')}>
                                                {formatCurrency(t.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-slate-50 dark:divide-slate-800">
                                {filteredTransactions.map(t => (
                                    <div key={t.id} className="py-4 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(t.date).toLocaleDateString('pt-BR')}</span>
                                            <span className={cn("font-black text-sm", t.type === 'income' ? 'text-success' : t.type === 'expense' ? 'text-danger' : 'text-slate-400')}>
                                                {formatCurrency(t.amount)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold dark:text-white text-sm">{t.description}</p>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-tight text-brand-600">
                                                    {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">
                                                    {accounts.find(a => a.id === t.accountId)?.name || 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};
