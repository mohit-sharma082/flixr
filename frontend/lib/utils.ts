import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    return 'text-red-500';
};
