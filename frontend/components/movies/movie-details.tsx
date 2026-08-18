'use client';

import { lazy, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Star,
    Calendar,
    Globe,
    Film,
    Tv,
    AlertTriangle,
    Share2,
    ArrowLeft,
    ExternalLink,
} from 'lucide-react';
import {
    cn,
    formatMoney,
    formatRuntime,
    getCertification,
} from '@/lib/utils';
import { Movie, Review } from '@/lib/interfaces';

import { CastAndCrewSkeleton } from '../cast-crew.tab';
import { MovieCard } from './movie-card';
import ReviewsGrid from '../reviews-grid';
import FlixrReviews from './flixr-reviews';
import WhereToWatch from './where-to-watch';

const CastAndCrewTab = lazy(() => import('../cast-crew.tab'));
const MediaTab = lazy(() => import('../media.tab'));

interface MovieDetailsProps {
    movie: Movie;
    reviews?: Review[];
}

const LANGS: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    hi: 'Hindi',
};
const getLanguageName = (code: string) => LANGS[code] || code?.toUpperCase();

const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return 'text-green-500';
    if (rating >= 6) return 'text-yellow-500';
    return 'text-red-500';
};

function DetailRow({ label, value }: { label: string; value?: string }) {
    if (!value) return null;
    return (
        <div>
            <dt className='text-sm font-medium text-muted-foreground'>
                {label}
            </dt>
            <dd className='text-base'>{value}</dd>
        </div>
    );
}

export function MovieDetails({ movie, reviews }: MovieDetailsProps) {
    const releaseDate = movie.release_date
        ? new Date(movie.release_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';
    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : '';

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '';
    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : '';

    const ratingPercentage = movie.vote_average
        ? (movie.vote_average / 10) * 100
        : 0;
    const certification = getCertification(movie.release_dates);
    const keywords =
        movie.keywords?.keywords ?? movie.keywords?.results ?? [];
    const recommendations = movie.recommendations?.results?.length
        ? movie.recommendations.results
        : movie.similar?.results ?? [];
    const collection = movie.belongs_to_collection;
    const externalIds = { imdb_id: movie.imdb_id, ...movie.external_ids };

    const links: { label: string; href: string }[] = [];
    if (movie.homepage)
        links.push({ label: 'Official site', href: movie.homepage });
    if (externalIds.imdb_id)
        links.push({
            label: 'IMDb',
            href: `https://www.imdb.com/title/${externalIds.imdb_id}`,
        });
    if (externalIds.instagram_id)
        links.push({
            label: 'Instagram',
            href: `https://instagram.com/${externalIds.instagram_id}`,
        });
    if (externalIds.twitter_id)
        links.push({
            label: 'X / Twitter',
            href: `https://twitter.com/${externalIds.twitter_id}`,
        });

    const goBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1)
            window.history.back();
        else window.location.assign('/');
    };
    const handleShare = () => {
        const url = typeof window !== 'undefined' ? window.location.href : '';
        if (typeof navigator !== 'undefined' && navigator.share)
            navigator.share({ title: movie.title ?? 'Flixr', url }).catch(() => {});
        else if (typeof navigator !== 'undefined')
            navigator.clipboard?.writeText(url);
    };

    return (
        <div className='relative'>
            {/* Back button */}
            <div className='fixed top-4 left-4 z-20'>
                <Button
                    onClick={goBack}
                    variant='outline'
                    size='icon'
                    className='rounded-full bg-black/50 backdrop-blur-sm border-none text-white hover:bg-black/70'>
                    <ArrowLeft className='h-5 w-5' />
                    <span className='sr-only'>Back</span>
                </Button>
            </div>

            {/* Hero backdrop */}
            <div className='fixed top-0 left-0 w-screen h-[35vh] md:h-[90vh] -z-10'>
                <Image
                    src={backdropUrl || '/placeholder.svg'}
                    alt={movie.title}
                    fill
                    priority
                    className='object-cover fixed top-0 left-0 -z-10'
                />
            </div>
            <div className='relative h-[80vw] md:h-[70vh] w-full'>
                <div className='absolute inset-0 bg-black/40 z-10' />
                <div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
                    <div className='container mx-auto'>
                        <div className='absolute inset-0 bg-gradient-to-t from-background via-background md:via-background/50 to-transparent z-0' />
                        <div className='flex flex-col md:flex-row gap-8 items-start md:items-end z-10'>
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
                                        <Film className='mr-1 h-3 w-3' />
                                        <span className='capitalize'>movie</span>
                                    </Badge>
                                    {certification && (
                                        <Badge
                                            variant='outline'
                                            className='bg-black/30 backdrop-blur-sm text-white border-white/30'>
                                            {certification}
                                        </Badge>
                                    )}
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

                                {movie.tagline && (
                                    <p className='text-white/80 italic mb-3'>
                                        “{movie.tagline}”
                                    </p>
                                )}

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

                                <div className='flex flex-wrap items-center gap-6 mb-4'>
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
                                                {movie.vote_average?.toFixed(
                                                    1
                                                ) ?? '—'}
                                            </div>
                                            <div className='text-xs text-muted-foreground'>
                                                {movie.vote_count?.toLocaleString() ??
                                                    0}{' '}
                                                votes
                                            </div>
                                        </div>
                                    </div>

                                    {releaseDate && (
                                        <div className='flex items-center gap-1'>
                                            <Calendar className='h-5 w-5 text-muted-foreground' />
                                            <span className='text-sm text-muted-foreground'>
                                                {releaseDate}
                                            </span>
                                        </div>
                                    )}

                                    {movie.runtime ? (
                                        <span className='text-sm text-muted-foreground'>
                                            {formatRuntime(movie.runtime)}
                                        </span>
                                    ) : null}

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
                                        className='rounded-full'
                                        onClick={handleShare}>
                                        <Share2 className='h-5 w-5' />
                                        <span className='sr-only'>Share</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='bg-background'>
                <div className='container mx-auto px-4 py-8 z-30 space-y-8'>
                    <Tabs defaultValue='overview' className='w-full'>
                        <TabsList className='mb-6 flex w-full justify-start overflow-x-auto'>
                            <TabsTrigger value='overview'>Overview</TabsTrigger>
                            <TabsTrigger value='cast'>Cast & Crew</TabsTrigger>
                            <TabsTrigger value='media'>Media</TabsTrigger>
                            <TabsTrigger value='watch'>
                                Where to Watch
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='overview' className='space-y-8'>
                            <div>
                                <h2 className='text-2xl font-bold mb-4'>
                                    Synopsis
                                </h2>
                                <p className='text-muted-foreground leading-relaxed max-w-3xl'>
                                    {movie.overview || 'No overview available.'}
                                </p>
                            </div>

                            <Separator />

                            <div className='relative'>
                                <h2 className='relative z-10 text-2xl font-bold mb-4'>
                                    Details
                                </h2>
                                <dl className='relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    <DetailRow
                                        label='Original Title'
                                        value={movie.original_title}
                                    />
                                    <DetailRow
                                        label='Status'
                                        value={movie.status}
                                    />
                                    <DetailRow
                                        label='Release Date'
                                        value={releaseDate}
                                    />
                                    <DetailRow
                                        label='Runtime'
                                        value={formatRuntime(movie.runtime)}
                                    />
                                    <DetailRow
                                        label='Rated'
                                        value={certification}
                                    />
                                    <DetailRow
                                        label='Budget'
                                        value={formatMoney(movie.budget)}
                                    />
                                    <DetailRow
                                        label='Revenue'
                                        value={formatMoney(movie.revenue)}
                                    />
                                    <DetailRow
                                        label='Original Language'
                                        value={getLanguageName(
                                            movie.original_language
                                        )}
                                    />
                                    <DetailRow
                                        label='Spoken Languages'
                                        value={movie.spoken_languages
                                            ?.map((l) => l.english_name)
                                            .join(', ')}
                                    />
                                    <DetailRow
                                        label='Countries'
                                        value={movie.production_countries
                                            ?.map((c) => c.name)
                                            .join(', ')}
                                    />
                                </dl>
                                {/* On phones/tablets the hero poster is hidden, so
                                    surface it as a faded backdrop behind the details. */}
                                {movie.poster_path && (
                                    <div className='pointer-events-none absolute right-0 top-0 z-0 block h-full w-[80%] lg:hidden'>
                                        <Image
                                            src={posterUrl || '/placeholder.svg'}
                                            alt={movie.title}
                                            fill
                                            className='object-cover'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-r from-background via-transparent to-background' />
                                        <div className='absolute inset-0 bg-gradient-to-b from-background via-transparent to-background' />
                                    </div>
                                )}
                            </div>

                            {links.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                    {links.map((l) => (
                                        <a
                                            key={l.label}
                                            href={l.href}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-2 text-sm transition-colors hover:bg-muted'>
                                            {l.label}
                                            <ExternalLink className='h-3.5 w-3.5' />
                                        </a>
                                    ))}
                                </div>
                            )}

                            {collection && (
                                // Not a link: TMDB collections have no route or
                                // backend endpoint here yet, and `collection` is
                                // not a discover param — a link would just drop
                                // the user on unfiltered Discover.
                                <div className='relative block overflow-hidden rounded-2xl border'>
                                    <div className='relative h-40 w-full bg-muted'>
                                        {collection.backdrop_path && (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w780${collection.backdrop_path}`}
                                                alt={collection.name}
                                                fill
                                                className='object-cover'
                                            />
                                        )}
                                        <div className='absolute inset-0 bg-black/50' />
                                        <div className='absolute inset-0 flex flex-col justify-center px-6'>
                                            <span className='text-xs uppercase tracking-wide text-white/60'>
                                                Part of
                                            </span>
                                            <span className='text-xl font-semibold text-white'>
                                                {collection.name}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {keywords.length > 0 && (
                                <div>
                                    <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                                        Keywords
                                    </h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {keywords.map((k) => (
                                            <Link
                                                key={k.id}
                                                href={`/movie?with_keywords=${k.id}`}
                                                className='rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
                                                {k.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {movie.production_companies?.length ? (
                                <div>
                                    <h2 className='text-2xl font-bold mb-4'>
                                        Production Companies
                                    </h2>
                                    <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4'>
                                        {movie.production_companies.map(
                                            (pc, i) => (
                                                <Link
                                                    key={i}
                                                    href={'/company/' + pc.id}>
                                                    <div className='relative aspect-video border-2 bg-primary/5 rounded-2xl flex items-center justify-center p-4'>
                                                        {pc.logo_path ? (
                                                            <Image
                                                                src={`https://image.tmdb.org/t/p/w500${pc.logo_path}`}
                                                                alt={pc.name}
                                                                fill
                                                                className='object-contain p-2'
                                                            />
                                                        ) : (
                                                            <span className='text-xs font-medium text-center'>
                                                                {pc.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className='p-2 text-sm'>
                                                        {pc.name}
                                                    </div>
                                                </Link>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </TabsContent>

                        <TabsContent value='cast'>
                            <Suspense fallback={<CastAndCrewSkeleton />}>
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
                                    images={
                                        movie.images ?? {
                                            backdrops: [],
                                            logos: [],
                                            posters: [],
                                        }
                                    }
                                    videos={movie.videos?.results || []}
                                />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value='watch'>
                            <WhereToWatch mediaType='movie' id={movie.id} />
                        </TabsContent>
                    </Tabs>

                    {/* More like this — horizontal rail (was a vertical sidebar list) */}
                    {recommendations.length > 0 && (
                        <section>
                            <h2 className='text-2xl font-bold mb-4'>
                                More Like This
                            </h2>
                            <div className='flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2'>
                                {recommendations.slice(0, 18).map((m, i) => (
                                    <MovieCard key={m.id} movie={m} index={i} />
                                ))}
                                <div className='w-8 shrink-0' />
                            </div>
                        </section>
                    )}

                    {/* Flixr community reviews */}
                    <FlixrReviews tmdbId={movie.id} mediaType='movie' />

                    {reviews && reviews.length > 0 && (
                        <section aria-labelledby='tmdb-reviews-heading'>
                            <Separator className='my-8' />
                            <h2
                                id='tmdb-reviews-heading'
                                className='text-2xl font-bold mb-2'>
                                Reviews from TMDB
                            </h2>
                            <ReviewsGrid reviews={reviews} />
                        </section>
                    )}
                    <div className='h-20' />
                </div>
            </div>
        </div>
    );
}
