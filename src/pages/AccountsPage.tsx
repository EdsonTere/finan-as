import React, { useState } from 'react';
import { useFinance, type Account, type AccountType } from '../contexts/FinanceContext';
import { Plus, Wallet, Landmark, CreditCard, Coins, Trash2, Pencil } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

export const AccountsPage: React.FC = () => {
    const { accounts, addAccount, updateAccount, deleteAccount } = useFinance();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<Omit<Account, 'id'>>({
        name: '',
        type: 'bank',
        balance: 0,
        initialBalance: 0,
        isActive: true,
        color: '#3b82f6'
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingId) {
                await updateAccount(editingId, formData);
            } else {
                await addAccount({ ...formData, balance: formData.initialBalance });
            }
            resetForm();
        } catch (err: any) {
            console.error('Failed to save account:', err);
            const detailedMessage = `Não foi possível salvar a conta.\n\n` +
                `Erro: ${err.message || 'Desconhecido'}\n` +
                (err.details ? `Detalhes: ${err.details}\n` : '') +
                (err.hint ? `Dica: ${err.hint}\n` : '') +
                `Código: ${err.code || 'N/A'}\n\n` +
                `Verifique se as permissões (RLS) do Supabase estão configuradas corretamente.`;
            alert(detailedMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (acc: Account) => {
        setFormData({
            name: acc.name,
            type: acc.type,
            balance: acc.balance,
            initialBalance: acc.initialBalance,
            isActive: acc.isActive,
            color: acc.color
        });
        setEditingId(acc.id);
        setIsFormOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'bank', balance: 0, initialBalance: 0, isActive: true, color: '#3b82f6' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const typeIcons: Record<AccountType, React.ReactNode> = {
        bank: <Landmark size={20} />,
        wallet: <Wallet size={20} />,
        credit: <CreditCard size={20} />,
        debit: <CreditCard size={20} />,
        pix: <Coins size={20} />,
        other: <Wallet size={20} />,
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Minhas Contas</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie seus bancos, carteiras e cartões.</p>
                </div>
                {!isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="btn btn-primary bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20"
                    >
                        <Plus size={18} /> Nova Conta
                    </button>
                )}
            </header>

            {isFormOpen && (
                <div className="card animate-slide-up border-brand-500/30">
                    <h3 className="text-lg font-bold mb-4 dark:text-white">
                        {editingId ? 'Editar Conta' : 'Nova Conta'}
                    </h3>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold dark:text-slate-300">Nome da Conta</label>
                            <input
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="input"
                                placeholder="Ex: Nubank, Itaú..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold dark:text-slate-300">Tipo</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as AccountType })}
                                className="input"
                            >
                                <option value="bank">Banco</option>
                                <option value="wallet">Carteira / Dinheiro</option>
                                <option value="credit">Cartão de Crédito</option>
                                <option value="pix">PIX</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-semibold dark:text-slate-300">
                                {editingId ? 'Saldo Atual' : 'Saldo Inicial'}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                value={editingId ? formData.balance : formData.initialBalance}
                                onChange={e => {
                                    const val = parseFloat(e.target.value);
                                    if (editingId) {
                                        setFormData({ ...formData, balance: val });
                                    } else {
                                        setFormData({ ...formData, initialBalance: val });
                                    }
                                }}
                                className="input"
                                placeholder="0,00"
                            />
                        </div>
                        <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t dark:border-slate-800 mt-2">
                            <button type="button" onClick={resetForm} className="btn btn-secondary text-xs uppercase tracking-wider font-bold">Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-brand-600 text-xs uppercase tracking-wider font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Salvando...' : (editingId ? 'Salvar Alterações' : 'Criar Conta')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map(acc => (
                    <div key={acc.id} className="card group hover:border-brand-500/50 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-600">
                                    {typeIcons[acc.type]}
                                </div>
                                <div>
                                    <h4 className="font-bold dark:text-white uppercase text-xs tracking-wider">{acc.type}</h4>
                                    <h3 className="text-lg font-bold dark:text-white">{acc.name}</h3>
                                </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(acc)}
                                    className="p-1 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 rounded"
                                    title="Editar"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => deleteAccount(acc.id)}
                                    className="p-1 text-slate-400 hover:text-danger hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                                    title="Excluir"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">Saldo Atual</p>
                            <p className={cn("text-2xl font-bold", acc.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                                {formatCurrency(acc.balance)}
                            </p>
                        </div>
                    </div>
                ))}

                {accounts.length === 0 && !isFormOpen && (
                    <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                        <Wallet size={48} className="mb-4 opacity-20" />
                        <p>Nenhuma conta cadastrada ainda.</p>
                        <button onClick={() => setIsFormOpen(true)} className="text-brand-600 font-bold mt-2 hover:underline">
                            Adicionar minha primeira conta
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

