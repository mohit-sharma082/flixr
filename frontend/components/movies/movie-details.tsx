'use client';

import { lazy, Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Heart,
    Star,
    Calendar,
    Globe,
    Film,
    Tv,
    AlertTriangle,
    Share2,
    BookmarkPlus,
    Play,
    ArrowLeft,
    AtSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Movie, Review } from '@/lib/interfaces';

import { CastAndCrewSkeleton } from '../cast-crew.tab';

const CastAndCrewTab = lazy(() => import('../cast-crew.tab'));
const MediaTab = lazy(() => import('../media.tab'));
import SimilarMoviesSection from './similar-movies';
import ReviewsGrid from '../reviews-grid';

interface MovieDetailsProps {
    movie: Movie;
    reviews?: Review[];
}

export function MovieDetails({ movie, reviews }: MovieDetailsProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    const releaseDate = movie.release_date
        ? new Date(movie.release_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : 'Unknown release date';

    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : '';

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '';

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : '';

    const ratingPercentage = (movie.vote_average / 10) * 100;

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

    const mediaType = movie.media_type || 'movie';
    const MediaTypeIcon = mediaType === 'tv' ? Tv : Film;

    return (
        <div className='relative  h-screen overflow-y-scroll'>
            {/* Back button */}
            <div className='fixed top-4 left-4 z-20'>
                <Button
                    onClick={goBack}
                    variant='outline'
                    size='icon'
                    className='rounded-full bg-black/50 backdrop-blur-sm border-none text-white hover:bg-black/70'>
                    <ArrowLeft className='h-5 w-5' />
                    <span className='sr-only'>Back to movies</span>
                </Button>
            </div>

            {/* Hero section with backdrop */}
            <div className='fixed top-0 left-0 w-screen h-[40vh] md:h-[90vh] -z-10'>
                <Image
                    src={backdropUrl || '/placeholder.svg'}
                    alt={movie.title}
                    fill
                    priority
                    className='object-cover fixed top-0 left-0 -z-10'
                />
            </div>
            <div className='relative h-[100vw]  sm:h-[70vh] w-full'>
                <div className='absolute inset-0 bg-black/40 z-10' />
                {/* <Image
                        src={backdropUrl || '/placeholder.svg'}
                        alt={movie.title}
                        fill
                        priority
                        className='object-cover sticky top-0 left-0'
                    /> */}

                <div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
                    <div className='container  mx-auto'>
                        <div className='absolute inset-0 bg-gradient-to-t from-background to-transparent z-0' />

                        <div className=' flex flex-col md:flex-row gap-8 items-start md:items-end z-10 '>
                            <div className='hidden md:block relative h-[200px] w-[132px] sm:h-[300px] sm:w-[200px] xl:h-[400px] xl:w-[266px] rounded-lg overflow-hidden shadow-2xl flex-shrink-0 border-4 border-background'>
                                <Image
                                    src={posterUrl || '/placeholder.svg'}
                                    alt={movie.title}
                                    fill
                                    className='object-cover'
                                />
                            </div>

                            <div className='flex-1 z-20'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <Badge>
                                        <MediaTypeIcon className='mr-1 h-3 w-3' />
                                        <span className='capitalize'>
                                            {mediaType}
                                        </span>
                                    </Badge>

                                    {movie.adult && (
                                        <Badge
                                            variant='destructive'
                                            className='flex items-center gap-1'>
                                            <AlertTriangle className='h-3 w-3' />
                                            <span>18+</span>
                                        </Badge>
                                    )}
                                </div>

                                <h1 className='text-3xl md:text-5xl font-bold text-white mb-2'>
                                    {movie.title}
                                    {releaseYear && (
                                        <span className='text-white/70 ml-2'>
                                            ({releaseYear})
                                        </span>
                                    )}
                                </h1>

                                <div className='flex flex-wrap gap-2 mb-4'>
                                    {movie?.genres?.map((genre, i) => (
                                        <Badge
                                            key={i}
                                            variant='outline'
                                            className='bg-black/30 backdrop-blur-sm text-white border-none'>
                                            {genre.name}
                                        </Badge>
                                    ))}
                                </div>

                                <div className='flex items-center gap-6 mb-4'>
                                    <div className='flex items-center gap-2 drop-shadow-lg '>
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
                                                            movie.vote_average
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
                                                        movie.vote_average
                                                    )
                                                )}>
                                                {movie.vote_average.toFixed(1)}
                                            </div>
                                            <div className='text-xs text-muted-foreground'>
                                                {movie.vote_count.toLocaleString()}{' '}
                                                votes
                                            </div>
                                        </div>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Calendar className='h-5 w-5 text-muted-foreground' />
                                        <span className='text-sm text-muted-foreground'>
                                            {releaseDate}
                                        </span>
                                    </div>

                                    <div className='flex items-center gap-1'>
                                        <Globe className='h-5 w-5 text-muted-foreground' />
                                        <span className='text-sm text-muted-foreground'>
                                            {getLanguageName(
                                                movie.original_language
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
                <div className='container mx-auto px-4 py-8 z-30 space-y-4 '>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        {/* Main content - 2/3 width on desktop */}
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
                                    <TabsTrigger value='video'>
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
                                            {movie.overview ||
                                                'No overview available.'}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div className='relative '>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Details
                                        </h2>
                                        <div className='z-10 flex justify-between items-start w-full'>
                                            <dl className='z-10 grid grid-cols-1 sm:grid-cols-2 gap-4  w-full'>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Original Title
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {movie.original_title}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Original Language
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {getLanguageName(
                                                            movie.original_language
                                                        )}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Origin Country
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {movie.origin_country}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Status
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {movie.status}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Release Date
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {releaseDate}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Popularity
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {movie.popularity.toFixed(
                                                            1
                                                        )}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Vote Count
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {movie.vote_count.toLocaleString()}
                                                    </dd>
                                                </div>
                                                <div>
                                                    <dt className='text-sm font-medium text-muted-foreground'>
                                                        Vote Average
                                                    </dt>
                                                    <dd className='text-base'>
                                                        {movie.vote_average.toFixed(
                                                            1
                                                        )}
                                                        /10
                                                    </dd>
                                                </div>
                                            </dl>
                                            {/* <div className='md:hidden relative h-[300px] w-[50%]  '>
                                                <Image
                                                    src={
                                                        posterUrl ||
                                                        '/placeholder.svg'
                                                    }
                                                    alt={movie.title}
                                                    fill
                                                    className='h-full object-contain self-end'
                                                />
                                            </div> */}
                                        </div>
                                        <div className='block lg:hidden absolute z-0 top-0 right-0 h-full w-[80%]'>
                                            <Image
                                                src={
                                                    posterUrl ||
                                                    '/placeholder.svg'
                                                }
                                                alt={movie.title}
                                                fill
                                                className='object-cover  '
                                            />
                                            <div className='absolute inset-0 h-full w-full bg-gradient-to-r from-background via-transparent to-background'></div>
                                            <div className='absolute inset-0 h-full w-full bg-gradient-to-b from-background via-transparent to-background'></div>
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className='text-2xl font-bold mb-4'>
                                            Production Companies
                                        </h2>
                                        <div className='grid  grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 '>
                                            {movie.production_companies.map(
                                                (pc, i) => (
                                                    <Link
                                                        key={i}
                                                        href={
                                                            '/company/' + pc.id
                                                        }>
                                                        <div className='relative  aspect-video border-2 bg-primary/5 rounded-2xl '>
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w500${pc.logo_path}`}
                                                                alt=''
                                                                fill
                                                                className='h-28 p-4'
                                                            />
                                                        </div>

                                                        <div className='p-2'>
                                                            {pc.name}
                                                        </div>
                                                    </Link>
                                                )
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value='cast'>
                                    <Suspense
                                        fallback={<CastAndCrewSkeleton />}>
                                        <CastAndCrewTab
                                            credits={{
                                                cast: movie.credits?.cast ?? [],
                                                crew: movie.credits?.crew ?? [],
                                            }}
                                        />
                                    </Suspense>
                                </TabsContent>

                                <TabsContent value='media'>
                                    <Suspense fallback={<div>Loading...</div>}>
                                        <MediaTab
                                            images={movie.images ?? { backdrops: [], logos: [], posters: [] }}
                                            videos={movie.videos?.results || []}
                                        />
                                    </Suspense>
                                </TabsContent>

                                <TabsContent value='video'>
                                    <div className='flex-1 border-2 rounded p-2'>
                                        <iframe
                                            src={`https://vidsrcme.ru/embed/movie?tmdb=${movie.id}`}
                                            style={{
                                                width: '100%',
                                                minHeight: '500px',
                                            }}
                                            // frameborder='0'
                                            // referrerpolicy='origin'
                                            // allowfullscreen
                                        ></iframe>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Sidebar - 1/3 width on desktop */}
                        <div>
                            <SimilarMoviesSection movie={movie} />
                        </div>
                    </div>
                    <ReviewsGrid reviews={reviews || []} />
                    <div className='h-20'></div>
                </div>
            </div>
        </div>
    );
}
