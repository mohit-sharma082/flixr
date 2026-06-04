'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    X,
    ChevronDown,
    Loader2,
    SlidersHorizontal,
    Flame,
    Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie, TVShow, Genre } from '@/lib/interfaces';

type MediaItem = Movie | TVShow;

export interface TabDef {
    key: string;
    label: string;
    /** Path segment after /api/movies or /api/tv, e.g. "/popular" */
    apiPath: string;
}

interface DiscoverShellProps {
    mediaType: 'movie' | 'tv';
    title: string;
    subtitle: string;
    heroBackdrop?: string | null;
    tabs: TabDef[];
    genres: Genre[];
    initialData: { results: MediaItem[]; total_pages: number };
}

// ── Utility ───────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function getRatingColor(r: number) {
    if (r >= 7.5) return 'text-green-400';
    if (r >= 6) return 'text-yellow-400';
    return 'text-red-400';
}

async function fetchSection(
    mediaType: 'movie' | 'tv',
    apiPath: string,
    page: number,
): Promise<{ results: MediaItem[]; total_pages: number }> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const segment = mediaType === 'movie' ? 'movies' : 'tv';
    const sep = apiPath.includes('?') ? '&' : '?';
    const url = `${base}/api/${segment}${apiPath}${sep}page=${page}`;
    try {
        const r = await fetch(url);
        if (!r.ok) return { results: [], total_pages: 1 };
        const data = await r.json();
        return { results: data.results ?? [], total_pages: data.total_pages ?? 1 };
    } catch {
        return { results: [], total_pages: 1 };
    }
}

async function fetchSearch(
    mediaType: 'movie' | 'tv',
    q: string,
    page: number,
): Promise<{ results: MediaItem[]; total_pages: number }> {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const segment = mediaType === 'movie' ? 'movies' : 'tv';
    const url = `${base}/api/${segment}/search?q=${encodeURIComponent(q)}&page=${page}`;
    try {
        const r = await fetch(url);
        if (!r.ok) return { results: [], total_pages: 1 };
        const data = await r.json();
        return { results: data.results ?? [], total_pages: data.total_pages ?? 1 };
    } catch {
        return { results: [], total_pages: 1 };
    }
}

// ── Grid card ─────────────────────────────────────────────────────────────────
// Purpose-built for CSS grid — no carousel min-widths, no flex-1/h-full.

function MediaGridCard({
    item,
    mediaType,
}: {
    item: MediaItem;
    mediaType: 'movie' | 'tv';
}) {
    const isMovie = mediaType === 'movie';
    const movie = item as Movie;
    const show = item as TVShow;

    const title = isMovie
        ? movie.title || movie.original_title || 'Untitled'
        : show.name || show.original_name || 'Untitled';

    const year = isMovie
        ? movie.release_date?.substring(0, 4)
        : show.first_air_date?.substring(0, 4);

    const rating = item.vote_average ?? 0;
    const poster = item.poster_path;
    const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`;

    return (
        <Link href={href} className='group block w-full'>
            {/* Poster */}
            <div className='relative w-full aspect-[2/3] overflow-hidden rounded-xl bg-white/5 mb-2.5'>
                {poster ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w342${poster}`}
                        alt={title}
                        fill
                        className='object-cover transition-transform duration-300 group-hover:scale-105'
                        sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw'
                        loading='lazy'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center p-3'>
                        <p className='text-center text-xs text-white/25 line-clamp-3'>
                            {title}
                        </p>
                    </div>
                )}

                {/* Gradient + rating on hover */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                {rating > 0 && (
                    <div className='absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300'>
                        <Star
                            className={cn(
                                'h-2.5 w-2.5 fill-current',
                                getRatingColor(rating),
                            )}
                        />
                        <span
                            className={cn(
                                'text-xs font-semibold',
                                getRatingColor(rating),
                            )}>
                            {rating.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Text below */}
            <p className='text-xs font-medium text-white/80 group-hover:text-white transition-colors line-clamp-2 leading-snug'>
                {title}
            </p>
            {year && (
                <p className='text-xs text-white/30 mt-0.5'>{year}</p>
            )}
        </Link>
    );
}

// ── Skeleton grid ─────────────────────────────────────────────────────────────

function SkeletonGrid() {
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
            {[...Array(18)].map((_, i) => (
                <div key={i} className='w-full space-y-2'>
                    <div className='aspect-[2/3] w-full rounded-xl bg-white/5 animate-pulse' />
                    <div className='h-3 w-3/4 rounded bg-white/5 animate-pulse' />
                    <div className='h-2.5 w-1/3 rounded bg-white/5 animate-pulse' />
                </div>
            ))}
        </div>
    );
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export function DiscoverShell({
    mediaType,
    title,
    subtitle,
    heroBackdrop,
    tabs,
    genres,
    initialData,
}: DiscoverShellProps) {
    const firstTab = tabs[0]?.key ?? '';

    // Tab data cache
    const [activeTab, setActiveTab] = useState(firstTab);
    const [tabData, setTabData] = useState<Record<string, MediaItem[]>>({
        [firstTab]: initialData.results,
    });
    const [tabPages, setTabPages] = useState<Record<string, number>>({
        [firstTab]: 1,
    });
    const [tabTotalPages, setTabTotalPages] = useState<Record<string, number>>({
        [firstTab]: initialData.total_pages,
    });
    const [tabLoading, setTabLoading] = useState(false);

    // Search
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 380);
    const [searchItems, setSearchItems] = useState<MediaItem[]>([]);
    const [searchPage, setSearchPage] = useState(1);
    const [searchTotalPages, setSearchTotalPages] = useState(1);
    const [searchLoading, setSearchLoading] = useState(false);

    // Genre filter + load-more
    const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);

    const isSearching = debouncedQuery.trim().length >= 2;

    // ── Search ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isSearching) {
            setSearchItems([]);
            setSearchPage(1);
            return;
        }
        let cancelled = false;
        setSearchLoading(true);
        fetchSearch(mediaType, debouncedQuery, 1).then((result) => {
            if (cancelled) return;
            setSearchItems(result.results);
            setSearchTotalPages(result.total_pages);
            setSearchPage(1);
            setSearchLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [debouncedQuery, mediaType]);

    // ── Tab switch ────────────────────────────────────────────────────
    const switchTab = useCallback(
        async (tabKey: string) => {
            setActiveTab(tabKey);
            if (tabData[tabKey]) return; // already cached
            const tab = tabs.find((t) => t.key === tabKey);
            if (!tab) return;
            setTabLoading(true);
            const result = await fetchSection(mediaType, tab.apiPath, 1);
            setTabData((p) => ({ ...p, [tabKey]: result.results }));
            setTabTotalPages((p) => ({ ...p, [tabKey]: result.total_pages }));
            setTabPages((p) => ({ ...p, [tabKey]: 1 }));
            setTabLoading(false);
        },
        [tabData, tabs, mediaType],
    );

    // ── Load more ─────────────────────────────────────────────────────
    const loadMore = useCallback(async () => {
        if (isSearching) {
            const next = searchPage + 1;
            if (next > searchTotalPages) return;
            setLoadingMore(true);
            const result = await fetchSearch(mediaType, debouncedQuery, next);
            setSearchItems((p) => [...p, ...result.results]);
            setSearchPage(next);
            setLoadingMore(false);
            return;
        }
        const currentPage = tabPages[activeTab] ?? 1;
        const maxPages = tabTotalPages[activeTab] ?? 1;
        if (currentPage >= maxPages) return;
        const tab = tabs.find((t) => t.key === activeTab);
        if (!tab) return;
        setLoadingMore(true);
        const next = currentPage + 1;
        const result = await fetchSection(mediaType, tab.apiPath, next);
        setTabData((p) => ({
            ...p,
            [activeTab]: [...(p[activeTab] ?? []), ...result.results],
        }));
        setTabPages((p) => ({ ...p, [activeTab]: next }));
        setTabTotalPages((p) => ({ ...p, [activeTab]: result.total_pages }));
        setLoadingMore(false);
    }, [
        isSearching,
        searchPage,
        searchTotalPages,
        debouncedQuery,
        mediaType,
        activeTab,
        tabPages,
        tabTotalPages,
        tabs,
    ]);

    // ── Genre filter ──────────────────────────────────────────────────
    const toggleGenre = (id: number) =>
        setSelectedGenres((p) =>
            p.includes(id) ? p.filter((g) => g !== id) : [...p, id],
        );

    const rawItems = isSearching ? searchItems : (tabData[activeTab] ?? []);
    const displayItems =
        selectedGenres.length === 0
            ? rawItems
            : rawItems.filter((item) => {
                  const gids: number[] =
                      (item as any).genre_ids ??
                      ((item as any).genres ?? []).map((g: Genre) => g.id);
                  return selectedGenres.every((gid) => gids.includes(gid));
              });

    const currentPage = isSearching
        ? searchPage
        : (tabPages[activeTab] ?? 1);
    const maxPages = isSearching
        ? searchTotalPages
        : (tabTotalPages[activeTab] ?? 1);
    const canLoadMore = currentPage < maxPages;

    const showSkeleton =
        tabLoading ||
        (isSearching && searchLoading && searchItems.length === 0);

    return (
        <div className='min-h-screen bg-black text-white'>
            {/* ── Hero ──────────────────────────────────────────────── */}
            <div className='relative h-[38vh] md:h-[48vh] overflow-hidden'>
                {heroBackdrop && (
                    <Image
                        src={`https://image.tmdb.org/t/p/original${heroBackdrop}`}
                        alt={title}
                        fill
                        priority
                        className='object-cover'
                        sizes='100vw'
                    />
                )}
                <div className='absolute inset-0 bg-gradient-to-b from-black/10 via-black/55 to-black' />
                <div className='absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent' />

                <div className='relative z-10 h-full flex flex-col justify-end px-4 sm:px-6 lg:px-8 pb-8'>
                    <div className='max-w-xl'>
                        <div className='flex items-center gap-2 mb-2'>
                            <Flame className='h-4 w-4 text-orange-400' />
                            <span className='text-xs text-white/40 font-semibold uppercase tracking-widest'>
                                Discover
                            </span>
                        </div>
                        <h1 className='text-4xl md:text-5xl font-extrabold tracking-tight mb-2'>
                            {title}
                        </h1>
                        <p className='text-white/45 text-sm md:text-base'>
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Sticky toolbar ────────────────────────────────────── */}
            <div className='sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/8'>
                <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-2.5'>
                    {/* Search bar */}
                    <div className='relative w-full max-w-sm'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/35 pointer-events-none' />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Search ${title.toLowerCase()}…`}
                            className='pl-9 pr-9 bg-white/8 border-white/10 text-white placeholder:text-white/25 focus-visible:ring-white/20 rounded-full h-9 text-sm'
                        />
                        {query ? (
                            <button
                                onClick={() => setQuery('')}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white transition-colors'>
                                <X className='h-3.5 w-3.5' />
                            </button>
                        ) : searchLoading ? (
                            <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-white/30' />
                        ) : null}
                    </div>

                    {/* Tabs — hidden while searching */}
                    {!isSearching && (
                        <div className='flex items-center gap-1.5 overflow-x-auto scrollbar-none'>
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => switchTab(tab.key)}
                                    className={cn(
                                        'shrink-0 px-3.5 py-1 rounded-full text-xs font-semibold transition-all border whitespace-nowrap',
                                        activeTab === tab.key
                                            ? 'bg-white text-black border-white'
                                            : 'bg-transparent text-white/45 border-white/10 hover:bg-white/8 hover:text-white/80 hover:border-white/25',
                                    )}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────── */}
            <div className='max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-28 space-y-5'>
                {/* Genre chips */}
                {genres.length > 0 && (
                    <div className='flex items-center gap-2 flex-wrap'>
                        <SlidersHorizontal className='h-3 w-3 text-white/20 shrink-0' />
                        {genres.slice(0, 14).map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => toggleGenre(genre.id)}
                                className={cn(
                                    'px-3 py-0.5 rounded-full text-xs border transition-colors',
                                    selectedGenres.includes(genre.id)
                                        ? 'bg-white text-black border-white font-medium'
                                        : 'text-white/40 border-white/10 hover:border-white/25 hover:text-white/70',
                                )}>
                                {genre.name}
                            </button>
                        ))}
                        {selectedGenres.length > 0 && (
                            <button
                                onClick={() => setSelectedGenres([])}
                                className='flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border border-white/12 text-white/30 hover:text-white/60 transition-colors'>
                                <X className='h-3 w-3' /> Clear
                            </button>
                        )}
                    </div>
                )}

                {/* Row header */}
                <div className='flex items-center justify-between'>
                    <h2 className='text-xs font-semibold text-white/35 uppercase tracking-widest'>
                        {isSearching
                            ? `Results for "${debouncedQuery}"`
                            : (tabs.find((t) => t.key === activeTab)?.label ??
                              '')}
                    </h2>
                    {displayItems.length > 0 && (
                        <span className='text-xs text-white/20'>
                            {displayItems.length}
                        </span>
                    )}
                </div>

                {/* Grid / skeleton / empty */}
                {showSkeleton ? (
                    <SkeletonGrid />
                ) : displayItems.length === 0 ? (
                    <div className='flex flex-col items-center justify-center py-32 gap-4'>
                        <Search className='h-10 w-10 text-white/12' />
                        <p className='text-white/30 text-sm'>
                            {isSearching
                                ? `No results for "${debouncedQuery}"`
                                : 'Nothing here yet'}
                        </p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7'>
                        {displayItems.map((item, idx) => (
                            <MediaGridCard
                                key={item.id + '-' + idx}
                                item={item}
                                mediaType={mediaType}
                            />
                        ))}
                    </div>
                )}

                {/* Load more */}
                {canLoadMore && !showSkeleton && displayItems.length > 0 && (
                    <div className='flex justify-center pt-8'>
                        <Button
                            variant='outline'
                            onClick={loadMore}
                            disabled={loadingMore}
                            className='rounded-full border-white/15 text-white/60 bg-white/4 hover:bg-white/10 hover:text-white gap-2 px-8 transition-all'>
                            {loadingMore ? (
                                <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                                <ChevronDown className='h-4 w-4' />
                            )}
                            Load more
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
