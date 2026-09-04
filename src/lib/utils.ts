import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const getLocalDateString = (d: Date = new Date()): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const getLocalMonthTag = (d: Date = new Date()): string => {
    return getLocalDateString(d).substring(0, 7);
};

export const formatDate = (date: string) => {
    if (!date) return '';
    const dateOnly = date.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts;
        if (year.length === 4 && month.length === 2 && day.length === 2) {
            return `${day}/${month}/${year}`;
        }
    }
    return new Date(date).toLocaleDateString('pt-BR');
};

export const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
