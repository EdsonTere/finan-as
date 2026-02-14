import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../contexts/FinanceContext';
import { X, Calendar, DollarSign, Tag, CreditCard, FileText, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const transactionSchema = z.object({
    description: z.string().min(3, 'Descrição muito curta'),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    date: z.string(),
    accountId: z.string().min(1, 'Selecione uma conta'),
    targetAccountId: z.string().optional(),
    categoryId: z.string().optional(),
    type: z.enum(['income', 'expense', 'transfer']),
    isFixed: z.boolean(),
    isRecurring: z.boolean(),
}).refine(data => {
    if (data.type === 'transfer') {
        return !!data.targetAccountId && data.targetAccountId !== data.accountId;
    }
    return !!data.categoryId;
}, {
    message: "Conta de destino é obrigatória para transferências e deve ser diferente da conta de origem",
    path: ["targetAccountId"]
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'income' | 'expense' | 'transfer';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, type }) => {
    const { accounts, categories, addTransaction } = useFinance();
    const targetType = (type === 'transfer' ? 'expense' : type);
    const filteredCategories = categories.filter(c => c.type === targetType);

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<TransactionFormValues>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type,
            date: new Date().toISOString().split('T')[0],
            isFixed: false,
            isRecurring: false,
        }
    });

    const currentAccountId = watch('accountId');

    useEffect(() => {
        if (isOpen) {
            reset({
                type,
                description: '',
                amount: 0,
                date: new Date().toISOString().split('T')[0],
                isFixed: false,
                isRecurring: false,
                accountId: '',
                categoryId: '',
                targetAccountId: ''
            });
        }
    }, [isOpen, type, reset]);

    const onSubmit = async (data: TransactionFormValues) => {
        try {
            setIsSubmitting(true);

            // Sanitize empty strings to null for UUID fields
            const sanitizedData = {
                ...data,
                categoryId: data.categoryId || null,
                targetAccountId: data.targetAccountId || null,
                status: 'completed',
                attachments: [],
            };

            await addTransaction(sanitizedData as any);
            reset();
            onClose();
        } catch (err: any) {
            console.error('Failed to save transaction:', err);
            const errorMessage = err.message || 'Erro desconhecido';
            alert(`Não foi possível salvar a transação.\n\nDetalhes: ${errorMessage}\n\nVerifique se as permissões (RLS) do Supabase estão configuradas para permitir inserções.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--bg-card)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white">
                        Nova {type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Transferência'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-semibold dark:text-slate-300">Valor</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('amount', { valueAsNumber: true })}
                                    className="input pl-10 text-2xl font-bold"
                                    placeholder="0,00"
                                />
                            </div>
                            {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label className="text-sm font-semibold dark:text-slate-300">Descrição</label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    {...register('description')}
                                    className="input pl-10"
                                    placeholder={type === 'transfer' ? 'Ex: Transferência entre contas' : 'Ex: Supermercado, Aluguel...'}
                                />
                            </div>
                            {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold dark:text-slate-300">Data</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="date"
                                    {...register('date')}
                                    className="input pl-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold dark:text-slate-300">
                                {type === 'transfer' ? 'Conta de Origem' : 'Conta'}
                            </label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <select {...register('accountId')} className="input pl-10 appearance-none">
                                    <option value="">Selecione...</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>
                            {errors.accountId && <p className="text-xs text-danger">{errors.accountId.message}</p>}
                        </div>

                        {type === 'transfer' ? (
                            <div className="space-y-1">
                                <label className="text-sm font-semibold dark:text-slate-300">Conta de Destino</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <select {...register('targetAccountId')} className="input pl-10 appearance-none">
                                        <option value="">Selecione...</option>
                                        {accounts.filter(a => a.id !== currentAccountId).map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                {errors.targetAccountId && <p className="text-xs text-danger">{errors.targetAccountId.message}</p>}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label className="text-sm font-semibold dark:text-slate-300">Categoria</label>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <select {...register('categoryId')} className="input pl-10 appearance-none">
                                        <option value="">Selecione...</option>
                                        {filteredCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input type="checkbox" {...register('isFixed')} className="peer sr-only" />
                                <div className="w-5 h-5 border-2 border-slate-300 rounded group-hover:border-brand-500 peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all"></div>
                                <Check className="absolute text-white w-3 h-3 scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Fixa</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input type="checkbox" {...register('isRecurring')} className="peer sr-only" />
                                <div className="w-5 h-5 border-2 border-slate-300 rounded group-hover:border-brand-500 peer-checked:bg-brand-600 peer-checked:border-brand-600 transition-all"></div>
                                <Check className="absolute text-white w-3 h-3 scale-0 peer-checked:scale-100 transition-transform" />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">Recorrente</span>
                        </label>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className={cn("btn btn-primary font-bold uppercase tracking-wider text-xs",
                            type === 'income' ? "bg-success hover:bg-emerald-600" :
                                type === 'expense' ? "bg-danger hover:bg-rose-600" :
                                    "bg-brand-600 hover:bg-brand-700",
                            isSubmitting && "opacity-50 cursor-not-allowed")}>
                            {isSubmitting ? 'Salvando...' : (type === 'transfer' ? 'Transferir' : 'Lançar ' + (type === 'income' ? 'Receita' : 'Despesa'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

