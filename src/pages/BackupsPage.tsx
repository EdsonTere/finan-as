import React, { useState } from 'react';
import { useFinance, type MonthlyBackup } from '../contexts/FinanceContext';
import { formatCurrency, formatDate, getLocalMonthTag } from '../lib/utils';
import { Archive, Plus, Trash2, Calendar, Eye, Download, CheckCircle2, AlertTriangle, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const BackupsPage: React.FC = () => {
    const { backups, createMonthlyBackup, deleteMonthlyBackup, categories, settings, updateSettings } = useFinance();
    const [selectedBackup, setSelectedBackup] = useState<MonthlyBackup | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const currentMonthTag = getLocalMonthTag();

    const handleGenerateBackup = async () => {
        setIsGenerating(true);
        setStatusMessage(null);

        try {
            const newBackup = await createMonthlyBackup(currentMonthTag);
            setStatusMessage({
                type: 'success',
                text: `Backup do mês (${newBackup.monthName}) gerado com sucesso! Lançamentos arquivados.`
            });
        } catch (err: any) {
            setStatusMessage({
                type: 'error',
                text: err.message || 'Erro ao gerar backup.'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteBackup = async (id: string, monthName: string) => {
        if (window.confirm(`Tem certeza que deseja excluir o backup de "${monthName}"? Esta ação é irreversível.`)) {
            try {
                await deleteMonthlyBackup(id);
                if (selectedBackup?.id === id) {
                    setSelectedBackup(null);
                }
                setStatusMessage({
                    type: 'success',
                    text: `Backup de ${monthName} removido com sucesso.`
                });
            } catch (err: any) {
                setStatusMessage({
                    type: 'error',
                    text: err.message || 'Erro ao excluir backup.'
                });
            }
        }
    };

    const exportBackupJSON = (backup: MonthlyBackup) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `backup_financas_${backup.monthKey}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const filteredBackups = backups.filter(b =>
        b.monthName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.monthKey.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Archive className="text-brand-500" size={28} />
                        Backups & Fechamento Mensal
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Armazene o histórico de suas movimentações mês a mês e mantenha seu sistema organizado.
                    </p>
                </div>
                <button
                    onClick={handleGenerateBackup}
                    disabled={isGenerating}
                    className="btn btn-primary bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 py-3 px-5 flex items-center gap-2 disabled:opacity-50"
                >
                    {isGenerating ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Plus size={20} />
                    )}
                    <span>Gerar Backup do Mês Atual</span>
                </button>
            </div>

            {/* Auto Backup Info Card */}
            <div className="bg-brand-50/50 dark:bg-brand-950/20 border border-brand-100 dark:border-brand-900/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        <Archive size={20} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Backup Mensal Automático {settings.autoBackup !== false ? 'Ativado (23:59hs)' : 'Desativado'}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            O sistema realiza o fechamento automaticamente no último dia do mês às 23:59h ou ao abrir o sistema no novo mês.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => updateSettings({ autoBackup: settings.autoBackup === false ? true : false })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                        settings.autoBackup !== false
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                >
                    {settings.autoBackup !== false ? '✓ Ativado' : 'Ativar Backup Automático'}
                </button>
            </div>

            {/* Notification Banner */}
            <AnimatePresence>
                {statusMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 font-medium text-sm border ${
                            statusMessage.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                    >
                        {statusMessage.type === 'success' ? (
                            <CheckCircle2 size={20} className="shrink-0 text-emerald-500" />
                        ) : (
                            <AlertTriangle size={20} className="shrink-0 text-rose-500" />
                        )}
                        <span className="flex-1">{statusMessage.text}</span>
                        <button
                            onClick={() => setStatusMessage(null)}
                            className="text-xs underline hover:opacity-80"
                        >
                            Fechar
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info Card */}
            <div className="card bg-gradient-to-r from-brand-600/10 via-brand-500/5 to-transparent border-brand-500/20 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-brand-600 rounded-2xl text-white shadow-md shadow-brand-500/20">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">Como funciona o Fechamento Mensal?</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 leading-relaxed">
                            Ao clicar em <strong>"Gerar Backup do Mês Atual"</strong>, todas as suas despesas, receitas e movimentações registradas no mês corrente serão consolidadas e salvas nesta aba com o nome do mês. Em seguida, a tela de movimentações ativas fica liberada para o novo mês.
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-4 bg-[var(--bg-card)] p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Search className="text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Buscar backups por mês ou ano..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none w-full text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium"
                />
            </div>

            {/* Backups List Grid */}
            {filteredBackups.length === 0 ? (
                <div className="card text-center py-12 space-y-3">
                    <Archive className="mx-auto text-slate-300 dark:text-slate-600" size={48} />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Nenhum backup encontrado</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                        Você ainda não gerou backups para os meses anteriores. Quando o mês encerrar, clique no botão acima para arquivá-lo.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBackups.map((backup) => (
                        <div
                            key={backup.id}
                            className="card hover:border-brand-500/40 transition-all duration-200 flex flex-col justify-between group shadow-md"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold dark:text-white capitalize">{backup.monthName}</h3>
                                            <span className="text-xs text-slate-400 font-mono">{backup.monthKey}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                                        {backup.transactions.length} lançamentos
                                    </span>
                                </div>

                                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800/60 my-4 text-sm">
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5"><ArrowUpCircle size={15} className="text-success" /> Entradas:</span>
                                        <span className="font-bold text-success">{formatCurrency(backup.totalIncome)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5"><ArrowDownCircle size={15} className="text-danger" /> Saídas:</span>
                                        <span className="font-bold text-danger">{formatCurrency(backup.totalExpense)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold dark:text-white">
                                        <span>Saldo Resultante:</span>
                                        <span className={backup.netBalance >= 0 ? "text-emerald-500" : "text-rose-500"}>
                                            {formatCurrency(backup.netBalance)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 pt-2">
                                <button
                                    onClick={() => setSelectedBackup(backup)}
                                    className="flex-1 py-2 px-3 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-100 dark:hover:bg-brand-900 text-brand-600 dark:text-brand-300 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Eye size={16} /> Ver Transações
                                </button>
                                <button
                                    onClick={() => exportBackupJSON(backup)}
                                    title="Baixar JSON"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors"
                                >
                                    <Download size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteBackup(backup.id, backup.monthName)}
                                    title="Excluir Backup"
                                    className="p-2 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 rounded-xl transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Detalhes do Backup */}
            {selectedBackup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-[var(--bg-card)] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col"
                    >
                        {/* Header do Modal */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-brand-500/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-brand-600 rounded-xl text-white">
                                    <Archive size={22} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold dark:text-white capitalize">
                                        Backup: {selectedBackup.monthName}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Lançamentos arquivados ({selectedBackup.transactions.length} registros)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedBackup(null)}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Conteúdo da Tabela */}
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-center text-sm font-medium">
                                <div>
                                    <p className="text-xs text-slate-400">Total Receitas</p>
                                    <p className="font-bold text-success text-base">{formatCurrency(selectedBackup.totalIncome)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Total Despesas</p>
                                    <p className="font-bold text-danger text-base">{formatCurrency(selectedBackup.totalExpense)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Saldo Líquido</p>
                                    <p className={`font-bold text-base ${selectedBackup.netBalance >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                        {formatCurrency(selectedBackup.netBalance)}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/50 uppercase border-b border-slate-100 dark:border-slate-800">
                                            <th className="p-3">Descrição</th>
                                            <th className="p-3">Categoria</th>
                                            <th className="p-3">Data</th>
                                            <th className="p-3 text-right">Valor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {selectedBackup.transactions.map((t) => (
                                            <tr key={t.id} className="text-sm hover:bg-[var(--bg-hover)] transition-colors">
                                                <td className="p-3 font-medium dark:text-white">{t.description}</td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                                                    {categories.find(c => c.id === t.categoryId)?.name || 'Geral'}
                                                </td>
                                                <td className="p-3 text-slate-500 dark:text-slate-400 text-xs">
                                                    {formatDate(t.date)}
                                                </td>
                                                <td className={`p-3 text-right font-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                                                    {formatCurrency(t.amount)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer do Modal */}
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button
                                onClick={() => exportBackupJSON(selectedBackup)}
                                className="btn btn-secondary text-sm flex items-center gap-2"
                            >
                                <Download size={16} /> Exportar JSON
                            </button>
                            <button
                                onClick={() => setSelectedBackup(null)}
                                className="btn btn-primary bg-slate-800 hover:bg-slate-900 text-white text-sm"
                            >
                                Fechar
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};
