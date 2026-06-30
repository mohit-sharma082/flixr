'use client';

import Image from 'next/image';
import { ArrowLeft, Share2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Genre, Video } from '@/lib/interfaces';
import { cn, getRatingColor, tmdbImg } from '@/lib/utils';
import { TrailerButton } from './trailer-button';

export interface DetailHeroProps {
    title: string;
    backdropPath: string | null;
    posterPath: string | null;
    rating: number;
    voteCount: number;
    /** e.g. ['2021', '2h 17m', 'PG-13'] — joined with dots */
    metaItems: string[];
    genres?: Genre[];
    tagline?: string | null;
    trailer: Video | null;
}

export function DetailHero({
    title,
    backdropPath,
    posterPath,
    rating,
    voteCount,
    metaItems,
    genres,
    tagline,
    trailer,
}: DetailHeroProps) {
    const backdrop = tmdbImg(backdropPath, 'original');
    const poster = tmdbImg(posterPath, 'w500');

    const goBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1)
            window.history.back();
        else window.location.assign('/');
    };

    const handleShare = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (typeof navigator !== 'undefined' && navigator.share)
            navigator.share({ title, url }).catch(() => {});
        else if (typeof navigator !== 'undefined')
            navigator.clipboard?.writeText(url);
    };

    return (
        <section className='relative min-h-[78vh] w-full overflow-hidden'>
            {/* Backdrop + legibility overlays */}
            <div className='absolute inset-0 z-0'>
                {backdrop ? (
                    <Image
                        src={backdrop}
                        alt=''
                        fill
                        priority
                        sizes='100vw'
                        className='object-cover object-top'
                    />
                ) : (
                    <div className='h-full w-full bg-gradient-to-b from-muted to-background' />
                )}
                <div className='absolute inset-0 bg-black/40' />
                <div className='absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent' />
                <div className='absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent' />
            </div>

            {/* Back */}
            <div className='absolute left-4 top-4 z-10 sm:left-6 lg:left-8'>
                <Button
                    variant='outline'
                    size='icon'
                    className='size-11 rounded-full border-white/20 bg-black/40 backdrop-blur-sm'
                    onClick={goBack}
                    aria-label='Go back'>
                    <ArrowLeft className='h-5 w-5' />
                </Button>
            </div>

            {/* Content */}
            <div className='relative z-[1] mx-auto flex h-full min-h-[78vh] max-w-7xl flex-col justify-end gap-6 px-4 pb-10 pt-24 sm:px-6 sm:pb-14 lg:flex-row lg:items-end lg:px-8'>
                {/* Poster — smaller on mobile, never hidden (DESIGN.md §9) */}
                <div className='w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl sm:w-48 lg:w-60'>
                    <div className='relative aspect-2/3 bg-muted'>
                        {poster ? (
                            <Image
                                src={poster}
                                alt={title}
                                fill
                                priority
                                sizes='(max-width: 1024px) 12rem, 15rem'
                                className='object-cover'
                            />
                        ) : null}
                    </div>
                </div>

                {/* Text + actions */}
                <div className='min-w-0 flex-1 space-y-4'>
                    {genres && genres.length > 0 && (
                        <div className='flex flex-wrap gap-2'>
                            {genres.map((g) => (
                                <Badge
                                    key={g.id}
                                    variant='outline'
                                    className='border-white/20 bg-black/30 text-white backdrop-blur-sm'>
                                    {g.name}
                                </Badge>
                            ))}
                        </div>
                    )}

                    <h1 className='text-3xl font-bold tracking-tight drop-shadow md:text-5xl'>
                        {title}
                    </h1>

                    {tagline ? (
                        <p className='max-w-2xl text-base italic text-muted-foreground'>
                            “{tagline}”
                        </p>
                    ) : null}

                    <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/90'>
                        {rating > 0 && (
                            <span className='flex items-center gap-1 font-semibold'>
                                <Star
                                    className={cn(
                                        'h-4 w-4 fill-current',
                                        getRatingColor(rating)
                                    )}
                                    aria-hidden='true'
                                />
                                <span className={getRatingColor(rating)}>
                                    {rating.toFixed(1)}
                                </span>
                                {voteCount > 0 && (
                                    <span className='text-muted-foreground'>
                                        ({voteCount.toLocaleString()})
                                    </span>
                                )}
                            </span>
                        )}
                        {metaItems.filter(Boolean).map((m, i) => (
                            <span
                                key={`${m}-${i}`}
                                className='flex items-center gap-3'>
                                {(rating > 0 || i > 0) && (
                                    <span className='text-muted-foreground'>
                                        ·
                                    </span>
                                )}
                                {m}
                            </span>
                        ))}
                    </div>

                    <div className='flex flex-wrap items-center gap-3 pt-2'>
                        <TrailerButton video={trailer} title={title} />
                        <Button
                            variant='outline'
                            size='icon'
                            className='size-11 rounded-full border-white/20 bg-black/30 backdrop-blur-sm'
                            onClick={handleShare}
                            aria-label='Share'>
                            <Share2 className='h-5 w-5' />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
