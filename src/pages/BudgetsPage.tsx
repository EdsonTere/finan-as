import React, { useState, useMemo } from 'react';
import { Target, Plus, TrendingUp, ChevronRight, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useFinance } from '../contexts/FinanceContext';
import { BudgetModal } from '../components/BudgetModal';

export const BudgetsPage: React.FC = () => {
    const { budgets, categories, transactions, deleteBudget } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const budgetStats = useMemo(() => {
        const now = new Date();
        const currentMonthTag = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        return budgets.map(budget => {
            const category = categories.find(c => c.id === budget.categoryId);
            const spent = transactions
                .filter(t => {
                    const monthTag = t.date.substring(0, 7);
                    return t.categoryId === budget.categoryId && t.type === 'expense' && monthTag === currentMonthTag;
                })
                .reduce((acc, curr) => acc + curr.amount, 0);

            return {
                ...budget,
                categoryName: category?.name || 'Categoria Removida',
                spent,
                percent: Math.min((spent / budget.amount) * 100, 100)
            };
        });
    }, [budgets, categories, transactions]);

    const totals = useMemo(() => {
        const totalBudgeted = budgets.reduce((acc, curr) => acc + curr.amount, 0);
        const totalSpent = budgetStats.reduce((acc, curr) => acc + curr.spent, 0);
        return { totalBudgeted, totalSpent };
    }, [budgets, budgetStats]);

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Planejamento</h2>
                    <p className="text-slate-500 dark:text-slate-400">Defina metas de gastos por categoria.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn btn-primary bg-brand-600 shadow-lg shadow-brand-500/20"
                >
                    <Plus size={18} /> Novo Orçamento
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card bg-brand-600 text-white border-none shadow-xl shadow-brand-500/20">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-white/20 rounded-lg"><Target size={20} /></div>
                    </div>
                    <p className="text-brand-100 text-sm font-medium">Meta Global de Gastos</p>
                    <h3 className="text-3xl font-bold mt-1">{formatCurrency(totals.totalBudgeted)}</h3>
                </div>
                <div className="card dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-sm font-medium">Total Orçado</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(totals.totalBudgeted)}</h3>
                </div>
                <div className="card dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-slate-500 text-sm font-medium">Gasto nas Categorias Orçadas</p>
                    <h3 className="text-2xl font-bold mt-1 dark:text-white">{formatCurrency(totals.totalSpent)}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card dark:bg-slate-900 border-none">
                    <h4 className="font-bold mb-6 dark:text-white">Orçamentos Ativos</h4>
                    <div className="space-y-6">
                        {budgetStats.map(budget => (
                            <div key={budget.id} className="card group hover:border-brand-500/50 transition-all">
                                <div className="flex justify-between items-end">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold dark:text-white">{budget.categoryName}</p>
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Excluir este orçamento?')) {
                                                        try {
                                                            await deleteBudget(budget.id);
                                                        } catch (err: any) {
                                                            console.error('Failed to delete budget:', err);
                                                            const detailedError = `Não foi possível excluir o orçamento.\n\n` +
                                                                `Erro: ${err.message || 'Desconhecido'}\n` +
                                                                (err.details ? `Detalhes: ${err.details}\n` : '') +
                                                                (err.hint ? `Dica: ${err.hint}\n` : '') +
                                                                `Código: ${err.code || 'N/A'}`;
                                                            alert(detailedError);
                                                        }
                                                    }
                                                }}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-danger"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400">{formatCurrency(budget.spent)} de {formatCurrency(budget.amount)}</p>
                                    </div>
                                    <p className={cn("text-xs font-bold", budget.percent >= 100 ? "text-danger" : "text-brand-600")}>
                                        {budget.percent.toFixed(0)}%
                                    </p>
                                </div>
                                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-50 dark:border-slate-800">
                                    <div
                                        className={cn("h-full transition-all duration-1000", budget.percent >= 100 ? "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-brand-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]")}
                                        style={{ width: `${budget.percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}

                        {budgets.length === 0 && (
                            <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                <Target size={32} className="mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Nenhum orçamento definido.</p>
                                <button onClick={() => setIsModalOpen(true)} className="text-brand-600 font-bold mt-2 hover:underline text-xs uppercase">
                                    Criar meu primeiro orçamento
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card dark:bg-slate-900 border-none flex flex-col items-center justify-center text-center p-8">
                    <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-4 text-brand-600">
                        <TrendingUp size={40} />
                    </div>
                    <h4 className="font-bold dark:text-white">Dica de Planejamento</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                        Defina orçamentos realistas para suas principais despesas e acompanhe sua evolução mensal.
                    </p>
                    <button className="mt-6 text-brand-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        Ver estatísticas detalhadas <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <BudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

