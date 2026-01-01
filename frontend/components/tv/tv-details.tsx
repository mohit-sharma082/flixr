'use client';

import { lazy, Suspense, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import {
    Heart,
    Star,
    Calendar,
    Globe,
    Tv,
    AlertTriangle,
    Share2,
    BookmarkPlus,
    ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Review, TVShow } from '@/lib/interfaces';

import { CastAndCrewSkeleton } from '../cast-crew.tab';

const CastAndCrewTab = lazy(() => import('../cast-crew.tab'));
const MediaTab = lazy(() => import('../media.tab'));
// const SimilarShowsSection = lazy(() => import('./similar-shows'));
import ReviewsGrid from '../reviews-grid';

interface TVDetailsProps {
    show: TVShow;
    reviews?: Review[];
}

export function TVDetails({ show, reviews }: TVDetailsProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const firstAirDate = show.first_air_date
        ? new Date(show.first_air_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'Unknown release date';

    const firstYear = show.first_air_date
        ? new Date(show.first_air_date).getFullYear()
        : '';

    const posterUrl = show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : '';

    const backdropUrl = show.backdrop_path
        ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
        : '';

    const ratingPercentage = show.vote_average
        ? (show.vote_average / 10) * 100
        : 0;

    const getRatingColor = (rating: number) => {
        if (rating >= 7.5) return 'text-green-500';
        if (rating >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getLanguageName = (code: string) => {
        const languages: Record<string, string> = {
            en: 'English',
            es: 'Spanish',
            fr: 'French',
            de: 'German',
            it: 'Italian',
            ja: 'Japanese',
            ko: 'Korean',
            zh: 'Chinese',
            ru: 'Russian',
        };

        return languages[code] || code.toUpperCase();
    };

    const goBack = () => {
        window.history.back();
    };

    return (
        <div className='relative h-screen overflow-y-scroll'>
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

            {/* Hero section with backdrop (Parallax-like sticky behavior from movie-details) */}
            <div className='fixed top-0 left-0 w-screen h-[40vh] md:h-[90vh] -z-10'>
                <Image
                    src={backdropUrl || '/placeholder.svg'}
                    alt={show.name}
                    fill
                    priority
                    className='object-cover fixed top-0 left-0 -z-10'
                />
            </div>

            <div className='relative h-[100vw] sm:h-[70vh] w-full'>
                <div className='absolute inset-0 bg-black/40 z-10' />

                <div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
                    <div className='container mx-auto'>
                        <div className='absolute inset-0 bg-gradient-to-t from-background to-transparent z-0' />

                        <div className='flex flex-col md:flex-row gap-8 items-start md:items-end z-10'>
                            <div className='hidden md:block relative h-[200px] w-[132px] sm:h-[300px] sm:w-[200px] xl:h-[400px] xl:w-[266px] rounded-lg overflow-hidden shadow-2xl flex-shrink-0 border-4 border-background'>
                                <Image
                                    src={posterUrl || '/placeholder.svg'}
                                    alt={show.name}
                                    fill
                                    className='object-cover'
                                />
                            </div>

                            <div className='flex-1 z-20'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <Badge>
                                        <Tv className='mr-1 h-3 w-3' />
                                        <span className='capitalize'>tv</span>
                                    </Badge>

                                    {show.tagline && (
                                        <Badge
                                            variant='outline'
                                            className='bg-black/30 backdrop-blur-sm text-white border-none'>
                                            {show.tagline}
                                        </Badge>
                                    )}

                                    {show.adult && (
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
                                    {show.genres?.map((genre, i) => (
                                        <Badge
                                            key={i}
                                            variant='outline'
                                            className='bg-black/30 backdrop-blur-sm text-white border-none'>
                                            {genre.name}
                                        </Badge>
                                    ))}
                                </div>

                                <div className='flex items-center gap-6 mb-4'>
                                    <div className='flex items-center gap-2 drop-shadow-lg'>
                                        <div className='relative h-12 w-12 flex items-center justify-center'>
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
                                                {show.vote_average?.toFixed(
                                                    1
                                                ) ?? '—'}
                                            </div>
                                            <div className='text-xs text-muted-foreground'>
                                                {show.vote_count?.toLocaleString()}{' '}
                                                votes
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Calendar className='h-5 w-5 text-muted-foreground' />
                                        <span className='text-sm text-muted-foreground'>
                                            {firstAirDate}
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Globe className='h-5 w-5 text-muted-foreground' />
                                        <span className='text-sm text-muted-foreground'>
                                            {getLanguageName(
                                                show.original_language
                                            )}
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
                                        onClick={() =>
                                            setIsFavorite(!isFavorite)
                                        }>
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
                                        <span className='sr-only'>Share</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content section */}
            <div className='bg-background'>
                <div className='container mx-auto px-4 py-8 z-30 space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {/* Main content - 2/3 width on desktop */}
                        <div className='md:col-span-2'>
                            <Tabs defaultValue='overview' className='w-full'>
                                <TabsList className='mb-6'>
                                    <TabsTrigger value='overview'>
                                        Overview
                                    </TabsTrigger>
                                    <TabsTrigger value='seasons'>
                                        Seasons
                                    </TabsTrigger>
                                    <TabsTrigger value='cast'>
                                        Cast & Crew
                                    </TabsTrigger>
                                    <TabsTrigger value='media'>
                                        Media
                                    </TabsTrigger>
                                    <TabsTrigger value='watch'>
                                        Watch
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
                                            {show.overview ||
                                                'No overview available.'}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className='relative '>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Details
                                        </h2>
                                        <div className=' z-10 flex justify-between items-start'>
                                            <dl className='z-10  w-full grid grid-cols-1 sm:grid-cols-2 gap-4'>
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
                                                        Seasons
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {show.number_of_seasons}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Episodes
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {
                                                            show.number_of_episodes
                                                        }
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Original Language
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {getLanguageName(
                                                            show.original_language
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
                                        {/* Stylized background poster (from movie-details) */}
                                        <div className='block  lg:hidden absolute z-0 top-0 right-0 h-full w-[80%]'>
                                            <Image
                                                src={
                                                    posterUrl ||
                                                    '/placeholder.svg'
                                                }
                                                alt={show.name}
                                                fill
                                                className='object-cover opacity-50'
                                            />
                                            <div className='absolute inset-0 h-full w-full bg-gradient-to-r from-background via-transparent to-background'></div>
                                            <div className='absolute inset-0 h-full w-full bg-gradient-to-b from-background via-transparent to-background'></div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Production Companies
                                        </h2>
                                        <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4'>
                                            {show.production_companies?.map(
                                                (pc, i) => (
                                                    <Link
                                                        key={i}
                                                        href={
                                                            '/company/' + pc.id
                                                        }>
                                                        <div className='relative aspect-video border-2 bg-primary/5 rounded-2xl flex items-center justify-center p-4'>
                                                            {pc.logo_path ? (
                                                                <Image
                                                                    src={`https://image.tmdb.org/t/p/w500${pc.logo_path}`}
                                                                    alt={
                                                                        pc.name
                                                                    }
                                                                    fill
                                                                    className='object-contain p-2'
                                                                />
                                                            ) : (
                                                                <span className='text-xs font-medium text-center'>
                                                                    {pc.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className='p-2 text-xs font-medium truncate'>
                                                            {pc.name}
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent
                                    value='seasons'
                                    className='space-y-6'>
                                    <h2 className='text-2xl font-bold mb-4'>
                                        Seasons
                                    </h2>
                                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                                        {show.seasons?.map((season) => (
                                            <Card
                                                key={season.id}
                                                className='p-0 overflow-hidden hover:ring-2 ring-primary transition-all'>
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
                                                            <div className='flex items-center justify-center h-full bg-muted text-xs p-4 text-center'>
                                                                {season.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='p-3'>
                                                        <div className='text-sm font-bold truncate'>
                                                            {season.name}
                                                        </div>
                                                        <div className='text-xs text-muted-foreground'>
                                                            {
                                                                season.episode_count
                                                            }{' '}
                                                            Episodes •{' '}
                                                            {season.air_date
                                                                ? new Date(
                                                                      season.air_date
                                                                  ).getFullYear()
                                                                : 'N/A'}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>

                                <TabsContent value='cast'>
                                    <Suspense
                                        fallback={<CastAndCrewSkeleton />}>
                                        <CastAndCrewTab
                                            credits={{
                                                cast: show.credits?.cast ?? [],
                                                crew: show.credits?.crew ?? [],
                                            }}
                                        />
                                    </Suspense>
                                </TabsContent>

                                <TabsContent value='media'>
                                    <Suspense
                                        fallback={<div>Loading media...</div>}>
                                        <MediaTab
                                            images={
                                                show?.images ?? {
                                                    backdrops: [],
                                                    posters: [],
                                                    logos: [],
                                                }
                                            }
                                            videos={show?.videos?.results ?? []}
                                        />
                                    </Suspense>
                                </TabsContent>

                                <TabsContent value='watch'>
                                    <div className='flex-1 border-2 rounded-xl overflow-hidden'>
                                        <iframe
                                            src={`https://vidsrcme.ru/embed/tv?tmdb=${show.id}`}
                                            className='w-full min-h-[500px]'
                                            allowFullScreen></iframe>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <Suspense
                                fallback={<div>Loading suggestions...</div>}>
                                {/* <SimilarShowsSection show={show} /> */}
                            </Suspense>
                        </div>
                    </div>

                    <ReviewsGrid reviews={reviews || []} />
                    <div className='h-20'></div>
                </div>
            </div>
        </div>
    );
}
