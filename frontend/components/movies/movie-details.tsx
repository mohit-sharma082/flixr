import Image from 'next/image';
import Link from 'next/link';
import { Movie, Review } from '@/lib/interfaces';
import { DetailHero } from '@/components/details/detail-hero';
import { StatBar } from '@/components/details/stat-bar';
import { Section, Rail } from '@/components/details/section';
import { CastRail } from '@/components/details/cast-rail';
import { MediaRail } from '@/components/details/media-rail';
import { KeywordChips } from '@/components/details/keyword-chips';
import { ExternalLinks } from '@/components/details/external-links';
import { MovieCard } from '@/components/movies/movie-card';
import WhereToWatch from '@/components/movies/where-to-watch';
import FlixrReviews from '@/components/movies/flixr-reviews';
import ReviewsGrid from '@/components/reviews-grid';
import {
    formatDate,
    formatMoney,
    formatRuntime,
    getBestTrailer,
    getCertification,
    tmdbImg,
} from '@/lib/utils';

interface MovieDetailsProps {
    movie: Movie;
    reviews?: Review[];
}

/**
 * Spotlight + rails movie detail page. Renders essentially everything TMDB
 * returns. Server component — interactivity lives in the child client rails.
 */
export function MovieDetails({ movie, reviews = [] }: MovieDetailsProps) {
    const year = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : '';
    const trailer = getBestTrailer(movie.videos);
    const keywords = movie.keywords?.keywords ?? movie.keywords?.results ?? [];
    const recommendations = movie.recommendations?.results?.length
        ? movie.recommendations.results
        : movie.similar?.results ?? [];
    const director = movie.credits?.crew?.find((c) => c.job === 'Director');
    const writers =
        movie.credits?.crew
            ?.filter((c) => c.department === 'Writing')
            .slice(0, 3) ?? [];
    const collection = movie.belongs_to_collection;
    const collectionBackdrop = tmdbImg(collection?.backdrop_path, 'w780');

    const heroMeta = [
        year ? String(year) : '',
        formatRuntime(movie.runtime),
        getCertification(movie.release_dates),
    ].filter(Boolean);

    const hasDetails =
        (movie.production_companies?.length ?? 0) > 0 ||
        (movie.production_countries?.length ?? 0) > 0 ||
        (movie.spoken_languages?.length ?? 0) > 0 ||
        keywords.length > 0 ||
        !!movie.homepage ||
        !!movie.imdb_id;

    const stats = [
        { label: 'Status', value: movie.status ?? '' },
        { label: 'Runtime', value: formatRuntime(movie.runtime) },
        { label: 'Budget', value: formatMoney(movie.budget) },
        { label: 'Revenue', value: formatMoney(movie.revenue) },
        { label: 'Release', value: formatDate(movie.release_date) },
        {
            label: 'Language',
            value: movie.spoken_languages?.[0]?.english_name ?? '',
        },
    ];

    return (
        <div className='min-h-screen bg-background pb-20 text-foreground'>
            <DetailHero
                title={movie.title}
                backdropPath={movie.backdrop_path}
                posterPath={movie.poster_path}
                rating={movie.vote_average}
                voteCount={movie.vote_count}
                metaItems={heroMeta}
                genres={movie.genres}
                tagline={movie.tagline}
                trailer={trailer}
            />

            <div className='mx-auto max-w-7xl'>
                <div className='py-6'>
                    <StatBar items={stats} />
                </div>

                {(movie.overview || director || writers.length > 0) && (
                    <Section id='overview' title='Overview'>
                        {movie.overview && (
                            <p className='max-w-3xl leading-relaxed text-muted-foreground'>
                                {movie.overview}
                            </p>
                        )}
                        {(director || writers.length > 0) && (
                            <div className='mt-6 flex flex-wrap gap-x-10 gap-y-4'>
                                {director && (
                                    <div>
                                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Director
                                        </p>
                                        <Link
                                            href={`/person/${director.id}`}
                                            className='font-medium hover:underline'>
                                            {director.name}
                                        </Link>
                                    </div>
                                )}
                                {writers.length > 0 && (
                                    <div>
                                        <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                            Writing
                                        </p>
                                        <p className='font-medium'>
                                            {writers
                                                .map((w) => w.name)
                                                .join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Section>
                )}

                {collection && (
                    <Section title='Part of a Collection'>
                        <div className='group relative block overflow-hidden rounded-xl border border-white/10'>
                            <div className='relative h-40 w-full bg-muted'>
                                {collectionBackdrop && (
                                    <Image
                                        src={collectionBackdrop}
                                        alt={collection.name}
                                        fill
                                        sizes='100vw'
                                        className='object-cover'
                                    />
                                )}
                                <div className='absolute inset-0 bg-black/50' />
                                <div className='absolute inset-0 flex items-center px-6'>
                                    <p className='text-xl font-semibold'>
                                        {collection.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Section>
                )}

                <CastRail credits={movie.credits} />

                <MediaRail
                    videos={movie.videos?.results}
                    backdrops={movie.images?.backdrops}
                />

                <Section id='watch'>
                    <WhereToWatch mediaType='movie' id={movie.id} />
                </Section>

                {recommendations.length > 0 && (
                    <Rail title='More Like This'>
                        {recommendations.slice(0, 18).map((m, i) => (
                            <MovieCard key={m.id} movie={m} index={i} />
                        ))}
                    </Rail>
                )}

                {hasDetails && (
                <Section id='facts' title='Details'>
                    <div className='grid gap-8 md:grid-cols-2'>
                        <div className='space-y-6'>
                            {movie.production_companies?.length ? (
                                <div>
                                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                        Production
                                    </p>
                                    <p className='text-sm'>
                                        {movie.production_companies
                                            .map((c) => c.name)
                                            .join(' · ')}
                                    </p>
                                </div>
                            ) : null}
                            {movie.production_countries?.length ? (
                                <div>
                                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                        Countries
                                    </p>
                                    <p className='text-sm'>
                                        {movie.production_countries
                                            .map((c) => c.name)
                                            .join(', ')}
                                    </p>
                                </div>
                            ) : null}
                            {movie.spoken_languages?.length ? (
                                <div>
                                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                        Languages
                                    </p>
                                    <p className='text-sm'>
                                        {movie.spoken_languages
                                            .map((l) => l.english_name)
                                            .join(', ')}
                                    </p>
                                </div>
                            ) : null}
                            <ExternalLinks
                                externalIds={{
                                    imdb_id: movie.imdb_id,
                                    ...movie.external_ids,
                                }}
                                homepage={movie.homepage}
                            />
                        </div>
                        {keywords.length > 0 && (
                            <div>
                                <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                    Keywords
                                </p>
                                <KeywordChips
                                    keywords={keywords}
                                    basePath='/movie'
                                />
                            </div>
                        )}
                    </div>
                </Section>
                )}

                <Section id='reviews'>
                    <FlixrReviews tmdbId={movie.id} mediaType='movie' />
                    {reviews.length > 0 && (
                        <div className='mt-10'>
                            <h3 className='mb-4 text-xl font-semibold'>
                                From TMDB
                            </h3>
                            <ReviewsGrid reviews={reviews} />
                        </div>
                    )}
                </Section>
            </div>
        </div>
    );
}
