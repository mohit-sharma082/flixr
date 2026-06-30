'use client';

import { useMemo, useState, useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Props {
    mediaType: 'movie' | 'tv';
    genres: Genre[];
    searchParams: URLSearchParams;
    onApply: (next: URLSearchParams) => void;
    isPending: boolean;
}

const LANGUAGES = [
    { value: 'none', label: 'Any Language' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'hi', label: 'Hindi' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ar', label: 'Arabic' },
    { value: 'ru', label: 'Russian' },
    { value: 'pt', label: 'Portuguese' },
];

const VOTES = [
    { value: 'none', label: 'Any' },
    { value: '100', label: '100+ votes' },
    { value: '500', label: '500+ votes' },
    { value: '1000', label: '1,000+ votes' },
    { value: '5000', label: '5,000+ votes' },
];

const TV_STATUSES = [
    { value: 'none', label: 'Any Status' },
    { value: '0', label: 'Returning Series' },
    { value: '1', label: 'Planned' },
    { value: '2', label: 'In Production' },
    { value: '3', label: 'Ended' },
    { value: '4', label: 'Canceled' },
    { value: '5', label: 'Pilot' },
];

const TV_TYPES = [
    { value: 'none', label: 'Any Type' },
    { value: '0', label: 'Documentary' },
    { value: '1', label: 'News' },
    { value: '2', label: 'Miniseries' },
    { value: '3', label: 'Reality' },
    { value: '4', label: 'Scripted' },
    { value: '5', label: 'Talk Show' },
    { value: '6', label: 'Video' },
];

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
    const lteKey = mediaType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte';
    
    const isOlder = searchParams.get(lteKey) === '1999-12-31';
    const year = isOlder ? 'older' : (searchParams.get(yearKey) || 'none');
    
    const selectedGenres = useMemo(() => {
        return (searchParams.get('with_genres') ?? '').split(',').filter(Boolean).map(Number);
    }, [searchParams]);

    // Generate years dynamically from current year down to 2000
    const currentYear = new Date().getFullYear();
    const years = useMemo(() => {
        const list = [];
        for (let y = currentYear; y >= 2000; y--) {
            list.push(String(y));
        }
        return list;
    }, [currentYear]);

    // Advanced filters values from URL
    const lang = searchParams.get('with_original_language') || 'none';
    const minVotes = searchParams.get('vote_count.gte') || 'none';
    const tvStatus = searchParams.get('with_status') || 'none';
    const tvType = searchParams.get('with_type') || 'none';

    // Local state for runtime slider to prevent lag
    const [runtimeGte, setRuntimeGte] = useState(0);
    const [runtimeLte, setRuntimeLte] = useState(360);

    // Sync runtime state from searchParams
    useEffect(() => {
        const gteVal = searchParams.get('with_runtime.gte');
        const lteVal = searchParams.get('with_runtime.lte');
        setRuntimeGte(gteVal ? parseInt(gteVal, 10) : 0);
        setRuntimeLte(lteVal ? parseInt(lteVal, 10) : 360);
    }, [searchParams]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (selectedGenres.length > 0) count += selectedGenres.length;
        if (searchParams.get('vote_average.gte') && searchParams.get('vote_average.gte') !== 'none') count++;
        if (searchParams.get(yearKey) && searchParams.get(yearKey) !== 'none') count++;
        if (searchParams.get(lteKey) === '1999-12-31') count++;
        if (searchParams.get('with_original_language') && searchParams.get('with_original_language') !== 'none') count++;
        if (searchParams.get('with_runtime.gte') || searchParams.get('with_runtime.lte')) {
            const hasGte = searchParams.get('with_runtime.gte') && searchParams.get('with_runtime.gte') !== '0';
            const hasLte = searchParams.get('with_runtime.lte') && searchParams.get('with_runtime.lte') !== '360';
            if (hasGte || hasLte) count++;
        }
        if (searchParams.get('vote_count.gte') && searchParams.get('vote_count.gte') !== 'none') {
            // Only count if it's not the auto-set 100 votes from rating filter
            const ratingVal = searchParams.get('vote_average.gte');
            const votesVal = searchParams.get('vote_count.gte');
            if (ratingVal && ratingVal !== 'none') {
                if (votesVal !== '100') count++;
            } else {
                count++;
            }
        }
        if (mediaType === 'tv') {
            if (searchParams.get('with_status') && searchParams.get('with_status') !== 'none') count++;
            if (searchParams.get('with_type') && searchParams.get('with_type') !== 'none') count++;
        }
        return count;
    }, [searchParams, selectedGenres, yearKey, lteKey, mediaType]);

    const hasFilters = searchParams.toString() !== '';

    const handleYearChange = (val: string) => {
        let next = new URLSearchParams(searchParams.toString());
        next.delete(yearKey);
        next.delete(lteKey);

        if (val === 'older') {
            next.set(lteKey, '1999-12-31');
        } else if (val !== 'none') {
            next.set(yearKey, val);
        }
        onApply(next);
    };

    const handleRuntimeCommit = (values: number[]) => {
        let next = new URLSearchParams(searchParams.toString());
        const [minVal, maxVal] = values;
        
        if (minVal > 0) next.set('with_runtime.gte', String(minVal));
        else next.delete('with_runtime.gte');

        if (maxVal < 360) next.set('with_runtime.lte', String(maxVal));
        else next.delete('with_runtime.lte');

        onApply(next);
    };

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

                    <Select value={year} onValueChange={handleYearChange} disabled={isPending}>
                        <SelectTrigger className='w-[110px] shrink-0 h-9 bg-foreground/5 border-border'>
                            <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Any Year</SelectItem>
                            {years.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                            <SelectItem value="older">Older</SelectItem>
                        </SelectContent>
                    </Select>

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant='outline' className='h-9 shrink-0 bg-foreground/5 border-border relative'>
                                <SlidersHorizontal className='w-4 h-4 mr-2' />
                                More
                                {activeFiltersCount > 0 && (
                                    <Badge variant='secondary' className='ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground'>
                                        {activeFiltersCount}
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                            <SheetHeader className="pb-4 border-b border-border">
                                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                                    Advanced Filters
                                </SheetTitle>
                            </SheetHeader>

                            <div className='py-6 space-y-6'>
                                {/* Language filter */}
                                <div className='space-y-2'>
                                    <Label className="text-sm font-semibold text-foreground">Original Language</Label>
                                    <Select 
                                        value={lang} 
                                        onValueChange={(v) => onApply(setParam(searchParams, 'with_original_language', v))}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className='w-full h-11 bg-foreground/5 border-border'>
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {LANGUAGES.map(l => (
                                                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Runtime Filter */}
                                <div className='space-y-4'>
                                    <div className='flex justify-between items-center'>
                                        <Label className="text-sm font-semibold text-foreground">Runtime (Minutes)</Label>
                                        <span className='text-xs text-muted-foreground font-mono'>
                                            {runtimeGte} - {runtimeLte === 360 ? '360+' : `${runtimeLte}m`}
                                        </span>
                                    </div>
                                    <div className="pt-2 px-2">
                                        <Slider
                                            value={[runtimeGte, runtimeLte]}
                                            min={0}
                                            max={360}
                                            step={10}
                                            onValueChange={(values) => {
                                                setRuntimeGte(values[0]);
                                                setRuntimeLte(values[1]);
                                            }}
                                            onValueCommit={handleRuntimeCommit}
                                            disabled={isPending}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Min Votes Filter */}
                                <div className='space-y-2'>
                                    <Label className="text-sm font-semibold text-foreground">Minimum Vote Count</Label>
                                    <Select 
                                        value={minVotes} 
                                        onValueChange={(v) => onApply(setParam(searchParams, 'vote_count.gte', v))}
                                        disabled={isPending}
                                    >
                                        <SelectTrigger className='w-full h-11 bg-foreground/5 border-border'>
                                            <SelectValue placeholder="Minimum Votes" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VOTES.map(v => (
                                                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {mediaType === 'tv' && (
                                    <>
                                        {/* TV Status Filter */}
                                        <div className='space-y-2'>
                                            <Label className="text-sm font-semibold text-foreground">TV Show Status</Label>
                                            <Select 
                                                value={tvStatus} 
                                                onValueChange={(v) => onApply(setParam(searchParams, 'with_status', v))}
                                                disabled={isPending}
                                            >
                                                <SelectTrigger className='w-full h-11 bg-foreground/5 border-border'>
                                                    <SelectValue placeholder="TV Show Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TV_STATUSES.map(s => (
                                                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* TV Type Filter */}
                                        <div className='space-y-2'>
                                            <Label className="text-sm font-semibold text-foreground">TV Show Type</Label>
                                            <Select 
                                                value={tvType} 
                                                onValueChange={(v) => onApply(setParam(searchParams, 'with_type', v))}
                                                disabled={isPending}
                                            >
                                                <SelectTrigger className='w-full h-11 bg-foreground/5 border-border'>
                                                    <SelectValue placeholder="TV Show Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TV_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}
                            </div>

                            {hasFilters && (
                                <div className="pt-6 border-t border-border mt-6">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => {
                                            onApply(new URLSearchParams());
                                        }}
                                        className="w-full h-11 border-dashed hover:border-destructive hover:text-destructive transition-colors"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Clear All Filters
                                    </Button>
                                </div>
                            )}
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

