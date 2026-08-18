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
    Tv,
    AlertTriangle,
    Share2,
    ArrowLeft,
    ExternalLink,
} from 'lucide-react';
import { cn, formatRuntime, getContentRating } from '@/lib/utils';
import type { Review, TVShow } from '@/lib/interfaces';

import { CastAndCrewSkeleton } from '../cast-crew.tab';
import { TvShowCard } from './tv-show-card';
import ReviewsGrid from '../reviews-grid';
import FlixrReviews from '../movies/flixr-reviews';
import WhereToWatch from '../movies/where-to-watch';

const CastAndCrewTab = lazy(() => import('../cast-crew.tab'));
const MediaTab = lazy(() => import('../media.tab'));

interface TVDetailsProps {
    show: TVShow;
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

export function TVDetails({ show, reviews }: TVDetailsProps) {
    const firstAirDate = show.first_air_date
        ? new Date(show.first_air_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '';
    const firstYear = show.first_air_date
        ? new Date(show.first_air_date).getFullYear()
        : '';
    const lastYear = show.last_air_date
        ? new Date(show.last_air_date).getFullYear()
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
    const contentRating = getContentRating(show.content_ratings);
    const keywords = show.keywords?.results ?? show.keywords?.keywords ?? [];
    const recommendations = show.recommendations?.results?.length
        ? show.recommendations.results
        : show.similar?.results ?? [];
    const creators = show.created_by ?? [];
    const seasons = [...(show.seasons ?? [])].sort(
        (a, b) => (a.season_number || Infinity) - (b.season_number || Infinity)
    );
    const externalIds = show.external_ids;

    const links: { label: string; href: string }[] = [];
    if (show.homepage)
        links.push({ label: 'Official site', href: show.homepage });
    if (externalIds?.imdb_id)
        links.push({
            label: 'IMDb',
            href: `https://www.imdb.com/title/${externalIds.imdb_id}`,
        });
    if (externalIds?.instagram_id)
        links.push({
            label: 'Instagram',
            href: `https://instagram.com/${externalIds.instagram_id}`,
        });
    if (externalIds?.twitter_id)
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
            navigator.share({ title: show.name ?? 'Flixr', url }).catch(() => {});
        else if (typeof navigator !== 'undefined')
            navigator.clipboard?.writeText(url);
    };

    return (
        <div className='relative'>
            {/* Back button */}
            <div className='fixed top-4 left-4 z-30'>
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
                                    {contentRating && (
                                        <Badge
                                            variant='outline'
                                            className='bg-black/30 backdrop-blur-sm text-white border-white/30'>
                                            {contentRating}
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
                                            {show.in_production
                                                ? '–present'
                                                : lastYear &&
                                                    lastYear !== firstYear
                                                  ? `–${lastYear}`
                                                  : ''}
                                            )
                                        </span>
                                    )}
                                </h1>

                                {show.tagline && (
                                    <p className='text-white/80 italic mb-3'>
                                        “{show.tagline}”
                                    </p>
                                )}

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
                                                {show.vote_count?.toLocaleString()}{' '}
                                                votes
                                            </div>
                                        </div>
                                    </div>

                                    {firstAirDate && (
                                        <div className='flex items-center gap-1'>
                                            <Calendar className='h-5 w-5 text-muted-foreground' />
                                            <span className='text-sm text-muted-foreground'>
                                                {firstAirDate}
                                            </span>
                                        </div>
                                    )}

                                    <span className='text-sm text-muted-foreground'>
                                        {show.number_of_seasons} Season
                                        {show.number_of_seasons === 1 ? '' : 's'}
                                    </span>

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
                                    {show.overview || 'No overview available.'}
                                </p>
                            </div>

                            {/* Seasons — now in the main view, not a tab */}
                            {seasons.length > 0 && (
                                <div>
                                    <h2 className='text-2xl font-bold mb-4'>
                                        Seasons
                                    </h2>
                                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
                                        {seasons.map((season) => {
                                            const sp = season.poster_path
                                                ? `https://image.tmdb.org/t/p/w342${season.poster_path}`
                                                : null;
                                            const sYear = season.air_date
                                                ? new Date(
                                                      season.air_date
                                                  ).getFullYear()
                                                : null;
                                            return (
                                                <Link
                                                    key={season.id}
                                                    href={`/tv/${show.id}/season/${season.season_number}`}
                                                    className='group relative block overflow-hidden rounded-xl border border-white/10 bg-card shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'>
                                                    <div className='relative aspect-[2/3] overflow-hidden'>
                                                        {sp ? (
                                                            <Image
                                                                src={sp}
                                                                alt={season.name}
                                                                fill
                                                                sizes='(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw'
                                                                className='object-cover transition-transform duration-500 group-hover:scale-110'
                                                            />
                                                        ) : (
                                                            <div className='flex h-full items-center justify-center bg-muted p-4 text-center text-sm text-muted-foreground'>
                                                                {season.name}
                                                            </div>
                                                        )}

                                                        {/* legibility gradient */}
                                                        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent' />

                                                        {/* season chip */}
                                                        <span className='absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow'>
                                                            {season.season_number ===
                                                            0
                                                                ? 'Specials'
                                                                : `S${season.season_number}`}
                                                        </span>

                                                        {/* rating pill */}
                                                        {season?.vote_average !=
                                                            null &&
                                                            season.vote_average >
                                                                0 && (
                                                                <span className='absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm'>
                                                                    <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                                                                    <span className='text-xs font-semibold text-white'>
                                                                        {season.vote_average.toFixed(
                                                                            1
                                                                        )}
                                                                    </span>
                                                                </span>
                                                            )}

                                                        {/* title + meta overlay */}
                                                        <div className='absolute inset-x-0 bottom-0 p-3'>
                                                            <h3 className='line-clamp-1 text-sm font-semibold text-white'>
                                                                {season.name}
                                                            </h3>
                                                            <p className='mt-0.5 text-xs text-white/70'>
                                                                {
                                                                    season.episode_count
                                                                }{' '}
                                                                episodes
                                                                {sYear
                                                                    ? ` · ${sYear}`
                                                                    : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <div className='relative'>
                                <h2 className='relative z-10 text-2xl font-bold mb-4'>
                                    Details
                                </h2>
                                <dl className='relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    <DetailRow
                                        label='Original Name'
                                        value={show.original_name}
                                    />
                                    <DetailRow
                                        label='Status'
                                        value={show.status}
                                    />
                                    <DetailRow label='Type' value={show.type} />
                                    <DetailRow
                                        label='First Air Date'
                                        value={firstAirDate}
                                    />
                                    <DetailRow
                                        label='Seasons'
                                        value={String(
                                            show.number_of_seasons ?? ''
                                        )}
                                    />
                                    <DetailRow
                                        label='Episodes'
                                        value={String(
                                            show.number_of_episodes ?? ''
                                        )}
                                    />
                                    <DetailRow
                                        label='Episode Runtime'
                                        value={formatRuntime(
                                            show.episode_run_time?.[0]
                                        )}
                                    />
                                    <DetailRow
                                        label='Content Rating'
                                        value={contentRating}
                                    />
                                    <DetailRow
                                        label='Network'
                                        value={show.networks
                                            ?.map((n) => n.name)
                                            .join(', ')}
                                    />
                                    <DetailRow
                                        label='Created By'
                                        value={creators
                                            .map((c) => c.name)
                                            .join(', ')}
                                    />
                                    <DetailRow
                                        label='Original Language'
                                        value={getLanguageName(
                                            show.original_language
                                        )}
                                    />
                                </dl>
                                {/* On phones/tablets the hero poster is hidden, so
                                    surface it as a faded backdrop behind the details. */}
                                {show.poster_path && (
                                    <div className='pointer-events-none absolute right-0 top-0 z-0 block h-full w-[80%] lg:hidden'>
                                        <Image
                                            src={posterUrl || '/placeholder.svg'}
                                            alt={show.name}
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

                            {keywords.length > 0 && (
                                <div>
                                    <h3 className='text-sm font-medium text-muted-foreground mb-2'>
                                        Keywords
                                    </h3>
                                    <div className='flex flex-wrap gap-2'>
                                        {keywords.map((k) => (
                                            <Link
                                                key={k.id}
                                                href={`/tv?with_keywords=${k.id}`}
                                                className='rounded-full border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'>
                                                {k.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {show.production_companies?.length ? (
                                <div>
                                    <h2 className='text-2xl font-bold mb-4'>
                                        Production Companies
                                    </h2>
                                    <div className='grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4'>
                                        {show.production_companies.map(
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
                                                    <div className='p-2 text-xs font-medium truncate'>
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
                                        cast: show.credits?.cast ?? [],
                                        crew: show.credits?.crew ?? [],
                                    }}
                                />
                            </Suspense>
                        </TabsContent>

                        <TabsContent value='media'>
                            <Suspense fallback={<div>Loading media...</div>}>
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
                            <WhereToWatch mediaType='tv' id={show.id} />
                        </TabsContent>
                    </Tabs>

                    {/* More like this — horizontal rail */}
                    {recommendations.length > 0 && (
                        <section>
                            <h2 className='text-2xl font-bold mb-4'>
                                More Like This
                            </h2>
                            <div className='flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2'>
                                {recommendations.slice(0, 18).map((s, i) => (
                                    <TvShowCard key={s.id} show={s} index={i} />
                                ))}
                                <div className='w-8 shrink-0' />
                            </div>
                        </section>
                    )}

                    {/* Flixr community reviews */}
                    <FlixrReviews tmdbId={show.id} mediaType='tv' />

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
