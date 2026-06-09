'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X } from 'lucide-react';
import { Genre } from '@/lib/interfaces';

interface Props {
    mediaType: 'movie' | 'tv';
    genres: Genre[];
    searchParams: URLSearchParams;
    onApply: (next: URLSearchParams) => void;
    isPending: boolean;
}

function setParam(searchParams: URLSearchParams, key: string, value?: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value || value === 'none') next.delete(key);
    else next.set(key, value);
    return next;
}

function toggleGenre(searchParams: URLSearchParams, id: number) {
    const current = (searchParams.get('with_genres') ?? '').split(',').filter(Boolean);
    const exists = current.includes(String(id));
    const updated = exists ? current.filter((g) => g !== String(id)) : [...current, String(id)];
    return setParam(searchParams, 'with_genres', updated.length ? updated.join(',') : undefined);
}

export function DiscoverFilters({ mediaType, genres, searchParams, onApply, isPending }: Props) {
    const sort = searchParams.get('sort_by') || 'popularity.desc';
    const rating = searchParams.get('vote_average.gte') || 'none';
    const yearKey = mediaType === 'movie' ? 'primary_release_year' : 'first_air_date_year';
    const year = searchParams.get(yearKey) || 'none';
    
    const selectedGenres = useMemo(() => {
        return (searchParams.get('with_genres') ?? '').split(',').filter(Boolean).map(Number);
    }, [searchParams]);

    const hasFilters = searchParams.toString() !== '';

    return (
        <div className='sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-3 px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col gap-3'>
                <div className='flex items-center gap-2 overflow-x-auto scrollbar-none pb-1'>
                    <Select value={sort} onValueChange={(v) => onApply(setParam(searchParams, 'sort_by', v))} disabled={isPending}>
                        <SelectTrigger className='w-[140px] shrink-0 h-9 bg-foreground/5 border-border'>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popularity.desc">Popularity</SelectItem>
                            <SelectItem value="vote_average.desc">Rating</SelectItem>
                            <SelectItem value={mediaType === 'movie' ? "primary_release_date.desc" : "first_air_date.desc"}>Release Date</SelectItem>
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant='outline' className='h-9 shrink-0 bg-foreground/5 border-border'>
                                Genres
                                {selectedGenres.length > 0 && (
                                    <Badge variant='secondary' className='ml-2 px-1'>{selectedGenres.length}</Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-64 p-4'>
                            <div className='flex flex-wrap gap-2'>
                                {genres.map(g => (
                                    <Badge 
                                        key={g.id} 
                                        variant={selectedGenres.includes(g.id) ? 'default' : 'outline'}
                                        className='cursor-pointer'
                                        onClick={() => onApply(toggleGenre(searchParams, g.id))}
                                    >
                                        {g.name}
                                    </Badge>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Select value={rating} onValueChange={(v) => {
                        let next = setParam(searchParams, 'vote_average.gte', v);
                        if (v && v !== 'none') next = setParam(next, 'vote_count.gte', '100');
                        else next.delete('vote_count.gte');
                        onApply(next);
                    }} disabled={isPending}>
                        <SelectTrigger className='w-[100px] shrink-0 h-9 bg-foreground/5 border-border'>
                            <SelectValue placeholder="Rating" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Any Rating</SelectItem>
                            <SelectItem value="6">6+ Rating</SelectItem>
                            <SelectItem value="7">7+ Rating</SelectItem>
                            <SelectItem value="8">8+ Rating</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={year} onValueChange={(v) => onApply(setParam(searchParams, yearKey, v))} disabled={isPending}>
                        <SelectTrigger className='w-[100px] shrink-0 h-9 bg-foreground/5 border-border'>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Any Year</SelectItem>
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2023">2023</SelectItem>
                            <SelectItem value="2022">2022</SelectItem>
                            <SelectItem value="2021">2021</SelectItem>
                        </SelectContent>
                    </Select>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant='outline' className='h-9 shrink-0 bg-foreground/5 border-border'>
                                <SlidersHorizontal className='w-4 h-4 mr-2' />
                                More
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Advanced Filters</SheetTitle>
                            </SheetHeader>
                            <div className='py-6 space-y-4'>
                                <p className='text-sm text-muted-foreground'>Language and runtime filters coming soon.</p>
                            </div>
                        </SheetContent>
                    </Sheet>

                    {hasFilters && (
                        <Button variant='ghost' size='sm' onClick={() => onApply(new URLSearchParams())} className='h-9 text-muted-foreground hover:text-foreground shrink-0'>
                            <X className='w-4 h-4 mr-1' /> Clear
                        </Button>
                    )}
                </div>

                {selectedGenres.length > 0 && (
                    <div className='flex gap-2 overflow-x-auto scrollbar-none'>
                        {selectedGenres.map(id => {
                            const g = genres.find(x => x.id === id);
                            if (!g) return null;
                            return (
                                <Badge key={id} variant='secondary' className='flex items-center gap-1 shrink-0'>
                                    {g.name}
                                    <X className='w-3 h-3 cursor-pointer ml-1' onClick={() => onApply(toggleGenre(searchParams, id))} />
                                </Badge>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
