'use client';

import React, { lazy, Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Heart,
    Star,
    Calendar,
    Globe,
    Tv,
    AlertTriangle,
    Share2,
    BookmarkPlus,
    Play,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review, TVShow } from '@/lib/interfaces';
import ReviewsGrid from '../reviews-grid';
import CastAndCrewTab, { CastAndCrewSkeleton } from '../cast-crew.tab';

const MediaTab = () => <div />;
const SimilarShowsSection = () => <div />;

interface TVDetailsProps {
    show: TVShow;
    reviews?: Review[];
}

export function TVDetails({ show, reviews }: TVDetailsProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const posterUrl = show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : '';
    const backdropUrl = show.backdrop_path
        ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
        : '';

    const firstAir = show.first_air_date
        ? new Date(show.first_air_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'Unknown';

    const firstYear = show.first_air_date
        ? new Date(show.first_air_date).getFullYear()
        : '';
    const lastAir = show.last_air_date
        ? new Date(show.last_air_date).toLocaleDateString()
        : '';

    const ratingPercentage = show.vote_average
        ? (show.vote_average / 10) * 100
        : 0;

    const getRatingColor = (rating: number) => {
        if (rating >= 7.5) return 'text-green-500';
        if (rating >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const goBack = () => {
        window.history.back();
    };

    const MediaTypeIcon = Tv;

    return (
        <div className='relative min-h-screen'>
            {/* Back button */}
            <div className='fixed top-4 left-4 z-30'>
                <Button
                    onClick={goBack}
                    variant='outline'
                    size='icon'
                    className='rounded-full bg-black/50 backdrop-blur-sm border-none text-white hover:bg-black/70'>
                    <ArrowLeft className='h-5 w-5' />
                    <span className='sr-only'>Back to shows</span>
                </Button>
            </div>

            {/* Hero backdrop */}
            <div className='fixed inset-x-0 top-0 h-[40vh] md:h-[70vh] -z-10'>
                <Image
                    src={backdropUrl || '/placeholder.svg'}
                    alt={show.name}
                    fill
                    priority
                    className='object-cover'
                />
                <div className='absolute inset-0 bg-black/40' />
            </div>

            <div className='relative z-20 pt-[28vh] md:pt-[44vh] pb-12 '>
                <div className='container mx-auto z-20  '>
                    <div className='flex flex-col md:flex-row gap-8 items-start md:items-end px-4'>
                        <div className=' relative h-[260px] w-[180px] xl:h-[360px] xl:w-[250px] rounded-lg overflow-hidden shadow-2xl flex-shrink-0 border-4 border-background'>
                            <Image
                                src={posterUrl || '/placeholder.svg'}
                                alt={show.name}
                                fill
                                className='object-cover'
                            />
                        </div>

                        <div className='flex-1 '>
                            <div className='flex items-center gap-2 mb-2'>
                                <Badge>
                                    <MediaTypeIcon className='mr-1 h-3 w-3' />
                                    <span className='capitalize'>tv</span>
                                </Badge>

                                {show?.tagline && (
                                    <Badge
                                        variant='outline'
                                        className='bg-black/30 backdrop-blur-sm text-white border-none'>
                                        {show.tagline}
                                    </Badge>
                                )}

                                {/** adult is uncommon for tv but check */}
                                {(show as any).adult && (
                                    <Badge
                                        variant='destructive'
                                        className='flex items-center gap-1'>
                                        <AlertTriangle className='h-3 w-3' />
                                        <span>18+</span>
                                    </Badge>
                                )}
                            </div>

                            <h1 className='text-3xl md:text-5xl font-bold text-white mb-2'>
                                {show.name}
                                {firstYear && (
                                    <span className='text-white/70 ml-2'>
                                        ({firstYear}
                                        {show.in_production ? ' –' : ''}
                                        {!show.in_production &&
                                        show.last_air_date
                                            ? ` ${new Date(
                                                  show.last_air_date
                                              ).getFullYear()}`
                                            : ''}
                                        )
                                    </span>
                                )}
                            </h1>

                            <div className='flex flex-wrap gap-2 mb-4'>
                                {show.genres?.map((g) => (
                                    <Badge
                                        key={g.id}
                                        variant='outline'
                                        className='bg-black/30 backdrop-blur-sm text-white border-none'>
                                        {g.name}
                                    </Badge>
                                ))}
                            </div>

                            <div className='flex items-center gap-6 mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='relative h-12 w-12'>
                                        <Progress
                                            value={ratingPercentage}
                                            className='h-12 w-12 rounded-full [&>div]:bg-transparent'
                                        />
                                        <div className='absolute inset-0 flex items-center justify-center'>
                                            <Star
                                                className={cn(
                                                    'h-5 w-5 fill-current',
                                                    getRatingColor(
                                                        show.vote_average
                                                    )
                                                )}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div
                                            className={cn(
                                                'text-xl font-bold',
                                                getRatingColor(
                                                    show.vote_average
                                                )
                                            )}>
                                            {show.vote_average?.toFixed(1) ??
                                                '—'}
                                        </div>
                                        <div className='text-xs text-muted-foreground'>
                                            {show.vote_count?.toLocaleString() ??
                                                0}{' '}
                                            votes
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center gap-1'>
                                    <Calendar className='h-5 w-5 text-muted-foreground' />
                                    <span className='text-sm text-muted-foreground'>
                                        {firstAir}
                                    </span>
                                </div>

                                <div className='flex items-center gap-1'>
                                    <Globe className='h-5 w-5 text-muted-foreground' />
                                    <span className='text-sm text-muted-foreground'>
                                        {show.original_language?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className='flex gap-2 mt-4'>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className={cn(
                                        'rounded-full',
                                        isFavorite &&
                                            'text-primary border-primary'
                                    )}
                                    onClick={() => setIsFavorite(!isFavorite)}>
                                    <Heart
                                        className={cn(
                                            'h-5 w-5',
                                            isFavorite && 'fill-primary'
                                        )}
                                    />
                                    <span className='sr-only'>
                                        {isFavorite
                                            ? 'Remove from favorites'
                                            : 'Add to favorites'}
                                    </span>
                                </Button>

                                <Button
                                    variant='outline'
                                    size='icon'
                                    className={cn(
                                        'rounded-full',
                                        isBookmarked &&
                                            'text-primary border-primary'
                                    )}
                                    onClick={() =>
                                        setIsBookmarked(!isBookmarked)
                                    }>
                                    <BookmarkPlus
                                        className={cn(
                                            'h-5 w-5',
                                            isBookmarked && 'fill-primary'
                                        )}
                                    />
                                    <span className='sr-only'>
                                        {isBookmarked
                                            ? 'Remove from watchlist'
                                            : 'Add to watchlist'}
                                    </span>
                                </Button>

                                <Button
                                    variant='outline'
                                    size='icon'
                                    className='rounded-full'>
                                    <Share2 className='h-5 w-5' />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-background px-4'>
                        <div className='md:col-span-2'>
                            <Tabs defaultValue='overview' className='w-full'>
                                <TabsList className='mb-6'>
                                    <TabsTrigger value='overview'>
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value='cast'>
                                        Cast & Crew
                                    </TabsTrigger>
                                    <TabsTrigger value='media'>
                                        Media
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent
                                    value='overview'
                                    className='space-y-6'>
                                    <div>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Synopsis
                                        </h2>
                                        <p className='text-muted-foreground leading-relaxed'>
                                            {show.overview ??
                                                'No overview available.'}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Details
                                        </h2>
                                        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                            <div>
                                                <dt className='text-sm font-medium text-muted-foreground'>
                                                    Original Name
                                                </dt>
                                                <dd className='text-base'>
                                                    {show.original_name}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className='text-sm font-medium text-muted-foreground'>
                                                    Status
                                                </dt>
                                                <dd className='text-base'>
                                                    {show.status}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className='text-sm font-medium text-muted-foreground'>
                                                    Episodes
                                                </dt>
                                                <dd className='text-base'>
                                                    {show.number_of_episodes}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className='text-sm font-medium text-muted-foreground'>
                                                    Seasons
                                                </dt>
                                                <dd className='text-base'>
                                                    {show.number_of_seasons}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className='text-sm font-medium text-muted-foreground'>
                                                    Origin Countries
                                                </dt>
                                                <dd className='text-base'>
                                                    {show.origin_country?.join(
                                                        ', '
                                                    )}
                                                </dd>
                                            </div>

                                            <div>
                                                <dt className='text-sm font-medium text-muted-foreground'>
                                                    Popularity
                                                </dt>
                                                <dd className='text-base'>
                                                    {show.popularity?.toFixed(
                                                        1
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <Separator />

                                    {/* Seasons */}
                                    <div>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Seasons
                                        </h2>
                                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                                            {show.seasons?.map((season) => (
                                                <Card
                                                    key={season.id}
                                                    className='p-0 overflow-hidden'>
                                                    <Link
                                                        href={`/tv/${show.id}/season/${season.season_number}`}
                                                        className='block'>
                                                        <div className='relative aspect-[2/3]'>
                                                            {season.poster_path ? (
                                                                <Image
                                                                    src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                                                                    alt={
                                                                        season.name
                                                                    }
                                                                    fill
                                                                    className='object-cover'
                                                                />
                                                            ) : (
                                                                <div className='flex items-center justify-center h-full bg-muted text-sm p-4'>
                                                                    {
                                                                        season.name
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className='p-3'>
                                                            <div className='text-sm font-medium line-clamp-1'>
                                                                {season.name}
                                                            </div>
                                                            <div className='text-xs text-muted-foreground'>
                                                                {
                                                                    season.episode_count
                                                                }{' '}
                                                                episodes
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value='cast'>
                                    <Suspense
                                        fallback={<CastAndCrewSkeleton />}>
                                        <CastAndCrewTab
                                            credits={{
                                                cast: show?.credits?.cast ?? [],
                                                crew: show?.credits?.crew ?? [],
                                            }}
                                        />{' '}
                                    </Suspense>
                                </TabsContent>

                                <TabsContent value='media'>
                                    <Suspense
                                        fallback={<div>Loading media…</div>}>
                                        <MediaTab />
                                    </Suspense>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <SimilarShowsSection />
                        </div>
                    </div>

                    <ReviewsGrid reviews={reviews || []} />
                </div>
            </div>
        </div>
    );
}
