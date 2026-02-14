import React, { useState } from 'react';
import { useFinance, type Category } from '../contexts/FinanceContext';
import { Plus, Tag, Trash2, Home, Utensils, Briefcase, GraduationCap, Car, Heart, ShoppingBag, Smartphone, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

const iconList = [
    { name: 'Home', icon: <Home size={20} /> },
    { name: 'Utensils', icon: <Utensils size={20} /> },
    { name: 'Briefcase', icon: <Briefcase size={20} /> },
    { name: 'GraduationCap', icon: <GraduationCap size={20} /> },
    { name: 'Car', icon: <Car size={20} /> },
    { name: 'Heart', icon: <Heart size={20} /> },
    { name: 'ShoppingBag', icon: <ShoppingBag size={20} /> },
    { name: 'Smartphone', icon: <Smartphone size={20} /> },
    { name: 'Layers', icon: <Layers size={20} /> },
];

export const CategoriesPage: React.FC = () => {
    const { categories, addCategory, deleteCategory } = useFinance();
    const [isAdding, setIsAdding] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [filterType, setFilterType] = useState<'income' | 'expense'>('expense');

    const [formData, setFormData] = useState<Omit<Category, 'id'>>({
        name: '',
        type: 'expense',
        icon: 'Tag',
        color: '#3b82f6',
        isActive: true
    });

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            await addCategory(formData);
            setFormData({ name: '', type: filterType, icon: 'Tag', color: '#3b82f6', isActive: true });
            setIsAdding(false);
        } catch (err: any) {
            console.error('Failed to add category:', err);
            alert('Não foi possível adicionar a categoria. Verifique sua conexão.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayCategories = categories.filter(c => c.type === filterType);

    const getIcon = (iconName: string) => {
        const item = iconList.find(i => i.name === iconName);
        return item ? item.icon : <Tag size={20} />;
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold dark:text-white">Categorias</h2>
                    <p className="text-slate-500 dark:text-slate-400">Classifique suas receitas e despesas.</p>
                </div>
                <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => setFilterType('expense')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            filterType === 'expense' ? "bg-white dark:bg-slate-700 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Despesas
                    </button>
                    <button
                        onClick={() => setFilterType('income')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all",
                            filterType === 'income' ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                    >
                        Receitas
                    </button>
                </div>
            </header>

            {!isAdding ? (
                <button
                    onClick={() => {
                        setFormData({ ...formData, type: filterType });
                        setIsAdding(true);
                    }}
                    className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all font-medium"
                >
                    <Plus size={20} /> Adicionar Nova Categoria
                </button>
            ) : (
                <div className="card animate-slide-up border-brand-500/30">
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold dark:text-slate-300">Nome da Categoria</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="input"
                                    placeholder="Ex: Alimentação, Lazer..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold dark:text-slate-300">Cor</label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="w-10 h-10 rounded-lg overflow-hidden border-none p-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="input flex-1 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold dark:text-slate-300">Ícone</label>
                            <div className="flex flex-wrap gap-2">
                                {iconList.map(item => (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: item.name })}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all",
                                            formData.icon === item.name
                                                ? "bg-brand-50 border-brand-500 text-brand-600 dark:bg-brand-900/20"
                                                : "border-slate-100 dark:border-slate-800 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {item.icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-secondary">Cancelar</button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSubmitting ? 'Criando...' : 'Criar Categoria'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {displayCategories.map(cat => (
                    <div key={cat.id} className="card group relative flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-all border-slate-100 border-none">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-white shadow-lg"
                            style={{ backgroundColor: cat.color }}
                        >
                            {getIcon(cat.icon)}
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-white text-sm truncate w-full">{cat.name}</h3>

                        <button
                            onClick={async () => {
                                if (confirm('Excluir esta categoria?')) {
                                    try {
                                        await deleteCategory(cat.id);
                                    } catch (err) {
                                        alert('Não foi possível excluir a categoria.');
                                    }
                                }
                            }}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
