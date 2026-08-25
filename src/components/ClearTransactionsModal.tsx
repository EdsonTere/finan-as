import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFinance } from '../contexts/FinanceContext';

interface ClearTransactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTypeFilter?: 'all' | 'income' | 'expense' | 'transfer';
}

export const ClearTransactionsModal: React.FC<ClearTransactionsModalProps> = ({
    isOpen,
    onClose,
    currentTypeFilter = 'all'
}) => {
    const { clearTransactions } = useFinance();
    const [scope, setScope] = useState<'current_month' | 'all' | 'type_filtered'>('current_month');
    const [resetAccountBalances, setResetAccountBalances] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleClear = async () => {
        setIsDeleting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const count = await clearTransactions({
                scope,
                typeFilter: currentTypeFilter,
                resetAccountBalances
            });

            if (count === 0) {
                setErrorMessage('Nenhum lançamento encontrado para os critérios selecionados.');
            } else {
                setSuccessMessage(`${count} lançamento(s) removido(s) com sucesso!`);
                setTimeout(() => {
                    setSuccessMessage(null);
                    onClose();
                }, 1500);
            }
        } catch (err: any) {
            console.error('Erro ao limpar lançamentos:', err);
            setErrorMessage(err.message || 'Ocorreu um erro ao tentar limpar as transações.');
        } finally {
            setIsDeleting(false);
        }
    };

    const getTypeName = (t: string) => {
        switch (t) {
            case 'income': return 'Receitas';
            case 'expense': return 'Despesas';
            case 'transfer': return 'Transferências';
            default: return 'Lançamentos';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-[var(--bg-card)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-rose-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg shadow-rose-500/30">
                            <Trash2 size={22} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold dark:text-white">Limpeza de Lançamentos</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Limpe os dados para virada de mês</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Alert Banner */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3 text-xs font-medium">
                        <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-500" />
                        <div>
                            <p className="font-bold text-amber-700 dark:text-amber-300">Atenção!</p>
                            <p>Esta ação irá apagar os lançamentos selecionados do banco de dados e não poderá ser desfeita.</p>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {successMessage && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                            {errorMessage}
                        </div>
                    )}

                    {/* Scope Options */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                            O que você deseja apagar?
                        </label>
                        <div className="space-y-2">
                            <label className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                scope === 'current_month' 
                                    ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 font-bold dark:text-white' 
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="clearScope"
                                    checked={scope === 'current_month'}
                                    onChange={() => setScope('current_month')}
                                    className="accent-brand-600"
                                />
                                <div className="text-xs">
                                    <p className="font-bold">Apenas Lançamentos do Mês Atual</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Recomendado para virar o mês limpo</p>
                                </div>
                            </label>

                            {currentTypeFilter !== 'all' && (
                                <label className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                    scope === 'type_filtered' 
                                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 font-bold dark:text-white' 
                                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="clearScope"
                                        checked={scope === 'type_filtered'}
                                        onChange={() => setScope('type_filtered')}
                                        className="accent-brand-600"
                                    />
                                    <div className="text-xs">
                                        <p className="font-bold">Apenas {getTypeName(currentTypeFilter)}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Limpar somente os registros da aba ativa</p>
                                    </div>
                                </label>
                            )}

                            <label className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                                scope === 'all' 
                                    ? 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10 font-bold text-rose-600 dark:text-rose-400' 
                                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                            }`}>
                                <input
                                    type="radio"
                                    name="clearScope"
                                    checked={scope === 'all'}
                                    onChange={() => setScope('all')}
                                    className="accent-rose-600"
                                />
                                <div className="text-xs">
                                    <p className="font-bold">Todas as Transações Registradas</p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Apaga TODO o histórico do sistema</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Account Balance Option */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <label className="flex items-start gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={resetAccountBalances}
                                onChange={(e) => setResetAccountBalances(e.target.checked)}
                                className="mt-0.5 accent-brand-600 rounded"
                            />
                            <div className="text-xs">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <RotateCcw size={13} className="text-brand-500" /> Resetar Saldo das Contas
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    Define o saldo de todas as contas para o valor inicial cadastrado (começar do zero).
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Limpando...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Confirmar Limpeza
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
