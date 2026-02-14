import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinance } from '../contexts/FinanceContext';
import { X, Target, DollarSign, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

const budgetSchema = z.object({
    categoryId: z.string().min(1, 'Selecione uma categoria'),
    amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
    period: z.enum(['monthly', 'yearly']),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose }) => {
    const { categories, addBudget } = useFinance();
    const expenseCategories = categories.filter(c => c.type === 'expense');

    const { register, handleSubmit, formState: { errors }, reset } = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
        defaultValues: {
            period: 'monthly',
        }
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                period: 'monthly',
                amount: 0,
                categoryId: ''
            });
        }
    }, [isOpen, reset]);

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const onSubmit = async (data: BudgetFormValues) => {
        try {
            setIsSubmitting(true);
            // Sanitize empty strings to null
            const sanitizedData = {
                ...data,
                categoryId: data.categoryId || null
            };
            await addBudget(sanitizedData as any);
            reset();
            onClose();
        } catch (err: any) {
            console.error('Failed to save budget:', err);
            alert('Não foi possível salvar o orçamento. Verifique sua conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <Target size={20} className="text-brand-600" /> Novo Orçamento
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold dark:text-slate-300">Categoria</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select {...register('categoryId')} className="input pl-10 appearance-none">
                                <option value="">Selecione a categoria...</option>
                                {expenseCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                        {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold dark:text-slate-300">Valor Limite</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="number"
                                step="0.01"
                                {...register('amount', { valueAsNumber: true })}
                                className="input pl-10 text-xl font-bold"
                                placeholder="0,00"
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold dark:text-slate-300">Período</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['monthly', 'yearly'].map(p => (
                                <label key={p} className="relative cursor-pointer group">
                                    <input
                                        type="radio"
                                        value={p}
                                        {...register('period')}
                                        className="peer sr-only"
                                    />
                                    <div className="p-3 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-center font-bold text-xs uppercase tracking-wider peer-checked:border-brand-600 peer-checked:bg-brand-50 dark:peer-checked:bg-brand-900/20 text-slate-400 peer-checked:text-brand-600 transition-all">
                                        {p === 'monthly' ? 'Mensal' : 'Anual'}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 grid grid-cols-2 gap-3">
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className={cn("btn btn-primary bg-brand-600 hover:bg-brand-700 font-bold uppercase tracking-wider text-xs",
                            isSubmitting && "opacity-50 cursor-not-allowed")}>
                            {isSubmitting ? 'Salvando...' : 'Salvar Orçamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
