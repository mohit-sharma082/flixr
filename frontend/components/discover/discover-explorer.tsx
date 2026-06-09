'use client';

import { useState, useCallback, useTransition, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Movie, TVShow, Genre } from '@/lib/interfaces';
import { MovieCard } from '@/components/movies/movie-card';
import { TvShowCard } from '@/components/tv/tv-show-card';
import { DiscoverFilters } from './discover-filters';
import { SkeletonGrid } from './skeleton-grid';
import { Search, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';

type MediaItem = Movie | TVShow;

interface Props {
    mediaType: 'movie' | 'tv';
    genres: Genre[];
    initialResults: MediaItem[];
    initialPage: number;
    initialTotalPages: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function useDebounce<T>(value: T, delay: number) {
    const [d, setD] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setD(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return d;
}

interface SearchResult {
    id: number;
    media_type: 'movie' | 'tv' | 'person';
    title?: string;
    name?: string;
    poster_path?: string | null;
    profile_path?: string | null;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    overview?: string;
}

export function DiscoverExplorer({
    mediaType, genres, initialResults, initialPage, initialTotalPages,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParamsRaw = useSearchParams();

    // Convert ReadOnlyURLSearchParams to URLSearchParams
    const searchParams = new URLSearchParams(searchParamsRaw.toString());
    const [isPending, startTransition] = useTransition();

    const [extraItems, setExtraItems] = useState<MediaItem[]>([]);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [loadingMore, setLoadingMore] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 400);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Infinite scroll ref
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Update local state when initialResults props change
    useEffect(() => {
        setExtraItems([]);
        setPage(initialPage);
        setTotalPages(initialTotalPages);
    }, [initialResults, initialPage, initialTotalPages]);

    const items = [...initialResults, ...extraItems];

    // Apply a filter change → write to URL → server refetches page 1
    const applyFilters = useCallback(
        (next: URLSearchParams) => {
            next.delete('page');
            setExtraItems([]);
            setPage(1);
            startTransition(() => {
                router.replace(`${pathname}?${next.toString()}`, { scroll: false });
            });
        },
        [router, pathname],
    );

    const loadMore = useCallback(async () => {
        if (page >= totalPages || loadingMore) return;
        const next = page + 1;
        setLoadingMore(true);
        const qs = new URLSearchParams(searchParams.toString());
        qs.set('page', String(next));
        const segment = mediaType === 'movie' ? 'movies' : 'tv';
        try {
            const r = await fetch(`${API_BASE}/api/${segment}/discover?${qs}`);
            const data = await r.json();
            setExtraItems((prev) => [...prev, ...(data.results ?? [])]);
            setPage(next);
            setTotalPages(data.total_pages ?? totalPages);
        } finally {
            setLoadingMore(false);
        }
    }, [page, totalPages, searchParams, mediaType, loadingMore]);

    // Infinite scroll with IntersectionObserver
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && page < totalPages && !loadingMore && !isPending) {
                    loadMore();
                }
            },
            { rootMargin: '400px' }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [page, totalPages, loadingMore, isPending, loadMore]);

    // Search — fetch results when debounced query changes
    useEffect(() => {
        const q = debouncedSearch.trim();
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        let cancelled = false;
        setSearchLoading(true);
        const segment = mediaType === 'movie' ? 'movies' : 'tv';
        fetch(`${API_BASE}/api/${segment}/search?q=${encodeURIComponent(q)}`)
            .then((r) => r.json())
            .then((data) => {
                if (cancelled) return;
                setSearchResults(data.results ?? []);
            })
            .finally(() => !cancelled && setSearchLoading(false));
        return () => { cancelled = true; };
    }, [debouncedSearch, mediaType]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className='min-h-screen bg-background text-foreground'>
            {/* Search bar */}
            <div className='px-4 sm:px-6 lg:px-8 pt-6 pb-2'>
                <div className='relative w-full sm:max-w-md'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none' />
                    <Input
                        type='text'
                        placeholder={`Search ${mediaType === 'movie' ? 'movies' : 'TV shows'}…`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='pl-10 pr-9 h-11 bg-foreground/5 border-border'
                    />
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                        >
                            <X className='h-4 w-4' />
                        </button>
                    )}
                </div>
            </div>

            {/* Inline search results */}
            {debouncedSearch.trim().length >= 2 && (
                <div className='px-4 sm:px-6 lg:px-8 pb-4'>
                    <div className='border border-border rounded-lg bg-background/60 backdrop-blur-sm overflow-hidden'>
                        <div className='px-4 py-3 border-b border-border flex items-center justify-between'>
                            <h3 className='text-sm font-semibold text-foreground'>
                                Search results for &ldquo;{debouncedSearch.trim()}&rdquo;
                            </h3>
                            <button onClick={clearSearch} className='text-xs text-muted-foreground hover:text-foreground transition-colors'>
                                Clear
                            </button>
                        </div>
                        {searchLoading ? (
                            <div className='p-6 flex items-center gap-2 text-sm text-muted-foreground'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                Searching…
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className='p-6 text-sm text-muted-foreground'>
                                No {mediaType === 'movie' ? 'movies' : 'TV shows'} found for &ldquo;{debouncedSearch.trim()}&rdquo;.
                            </div>
                        ) : (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 p-4'>
                                {searchResults.slice(0, 12).map((item, idx) =>
                                    mediaType === 'movie' ? (
                                        <MovieCard key={`search-${item.id}-${idx}`} movie={item as unknown as Movie} index={idx} />
                                    ) : (
                                        <TvShowCard key={`search-${item.id}-${idx}`} show={item as unknown as TVShow} index={idx} />
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <DiscoverFilters
                mediaType={mediaType}
                genres={genres}
                searchParams={searchParams}
                onApply={applyFilters}
                isPending={isPending}
            />

            <div className='px-4 sm:px-6 lg:px-8 pt-5 pb-28'>
                {isPending ? (
                    <SkeletonGrid />
                ) : items.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-20 sm:py-28 gap-6'>
                        <div className='w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center'>
                            <Search className='h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground' />
                        </div>
                        <div className='text-center space-y-2 max-w-sm px-4'>
                            <h3 className='text-lg sm:text-xl font-bold text-foreground'>
                                No results found
                            </h3>
                            <p className='text-muted-foreground text-sm leading-relaxed'>
                                Try adjusting your filters.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 auto-rows-max'>
                        {items.map((item, idx) =>
                            mediaType === 'movie' ? (
                                <MovieCard key={`${item.id}-${idx}`} movie={item as Movie} index={idx} />
                            ) : (
                                <TvShowCard key={`${item.id}-${idx}`} show={item as TVShow} index={idx} />
                            ),
                        )}
                    </div>
                )}

                {/* Infinite scroll sentinel */}
                {page < totalPages && items.length > 0 && !isPending && (
                    <div ref={sentinelRef} className='flex justify-center pt-12 sm:pt-16'>
                        {loadingMore && (
                            <div className='flex items-center gap-2.5 text-sm text-muted-foreground'>
                                <Loader2 className='h-5 w-5 animate-spin' />
                                <span>Loading more…</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
