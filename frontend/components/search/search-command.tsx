'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Film, Tv, User, ArrowRight } from 'lucide-react';
import {
    CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function useDebounce<T>(value: T, delay: number) {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
}

interface Result {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title?: string;            // movie
    name?: string;             // tv / person
    poster_path?: string | null;
    profile_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
}

export function SearchCommand({
    open, onOpenChange,
}: { open: boolean; onOpenChange: (o: boolean) => void }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const debounced = useDebounce(query, 350);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const q = debounced.trim();
        if (q.length < 2) { setResults([]); return; }
        let cancelled = false;
        setLoading(true);
        fetch(`${API_BASE}/api/common/search?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then((data) => {
                if (cancelled) return;
                setResults((data.results ?? []).filter(
                    (r: Result) => ['movie', 'tv', 'person'].includes(r.media_type),
                ));
            })
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [debounced]);

    const grouped = useMemo(() => ({
        movie: results.filter((r) => r.media_type === 'movie'),
        tv: results.filter((r) => r.media_type === 'tv'),
        person: results.filter((r) => r.media_type === 'person'),
    }), [results]);

    function go(r: Result) {
        const path =
            r.media_type === 'movie' ? `/movie/${r.id}`
            : r.media_type === 'tv' ? `/tv/${r.id}`
            : `/person/${r.id}`;
        onOpenChange(false);
        setQuery('');
        router.push(path);
    }

    const handleSubmit = useCallback(() => {
        const q = query.trim();
        if (!q) return;
        onOpenChange(false);
        setQuery('');
        router.push(`/search?q=${encodeURIComponent(q)}`);
    }, [query, onOpenChange, router]);

    // Handle Enter key to submit to search page
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Enter' && query.trim()) {
                e.preventDefault();
                handleSubmit();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, query, handleSubmit]);

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}
            title='Search' description='Find movies, TV shows, and people'>
            <CommandInput
                placeholder='Search movies, TV, people…'
                value={query}
                onValueChange={setQuery}
            />

            {/* Submit button */}
            {query.trim().length > 0 && (
                <div className='px-3 pb-2 pt-1 border-b border-border'>
                    <Button
                        variant='ghost'
                        className='w-full justify-between text-sm text-muted-foreground hover:text-foreground h-10'
                        onClick={handleSubmit}
                    >
                        <span>Search for &ldquo;{query.trim()}&rdquo;</span>
                        <ArrowRight className='h-4 w-4' />
                    </Button>
                </div>
            )}

            <CommandList>
                {loading && <div className='p-4 text-sm text-muted-foreground'>Searching…</div>}
                {!loading && debounced.trim().length >= 2 && results.length === 0 && (
                    <CommandEmpty>No results for &ldquo;{debounced}&rdquo;.</CommandEmpty>
                )}

                {grouped.movie.length > 0 && (
                    <CommandGroup heading='Movies'>
                        {grouped.movie.map((r) => (
                            <CommandItem key={`m-${r.id}`} value={`movie-${r.id}`} onSelect={() => go(r)}>
                                <ResultRow r={r} icon={<Film className='h-4 w-4' />} />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
                {grouped.tv.length > 0 && (
                    <CommandGroup heading='TV Shows'>
                        {grouped.tv.map((r) => (
                            <CommandItem key={`t-${r.id}`} value={`tv-${r.id}`} onSelect={() => go(r)}>
                                <ResultRow r={r} icon={<Tv className='h-4 w-4' />} />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
                {grouped.person.length > 0 && (
                    <CommandGroup heading='People'>
                        {grouped.person.map((r) => (
                            <CommandItem key={`p-${r.id}`} value={`person-${r.id}`} onSelect={() => go(r)}>
                                <ResultRow r={r} icon={<User className='h-4 w-4' />} />
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}

function ResultRow({ r, icon }: { r: Result; icon: React.ReactNode }) {
    const title = r.title || r.name || 'Untitled';
    const year = (r.release_date || r.first_air_date || '').slice(0, 4);
    const img = r.poster_path
        ? `https://image.tmdb.org/t/p/w92${r.poster_path}`
        : r.profile_path
        ? `https://image.tmdb.org/t/p/w92${r.profile_path}`
        : null;
    return (
        <div className='flex items-center gap-3'>
            <div className='relative h-12 w-8 shrink-0 overflow-hidden rounded bg-muted'>
                {img && <Image src={img} alt={title} fill className='object-cover' sizes='32px' />}
            </div>
            <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-medium'>{title}</p>
                {year && <p className='text-xs text-muted-foreground'>{year}</p>}
            </div>
            <span className='text-muted-foreground'>{icon}</span>
        </div>
    );
}
