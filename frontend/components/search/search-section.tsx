'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';
import { Search, X } from 'lucide-react';

export const SearchSection = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState('');

    useEffect(() => {
        setQuery(searchParams?.get('q') || '');
    }, [searchParams]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        }
    };

    const handleClear = () => {
        setQuery('');
        router.push('/search');
    };

    return (
        <form onSubmit={handleSubmit} className='w-full max-w-lg flex items-center gap-2 relative pl-2 md:pl-4'>
            <div className="relative flex-grow">
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
                <Input
                    type='search'
                    aria-label='Search movies, TV shows, and people'
                    placeholder='Search movies, TV shows, people...'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className='pl-10 pr-9 h-11 bg-foreground/5 border-border w-full rounded-md'
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center'
                        aria-label="Clear search"
                    >
                        <X className='h-4 w-4' />
                    </button>
                )}
            </div>
            <Button
                type='submit'
                className='h-11 px-5 font-semibold shrink-0 rounded-md min-h-[44px]'
            >
                Search
            </Button>
        </form>
    );
};

