import Image from 'next/image';
import Link from 'next/link';
import { TVShow, Review } from '@/lib/interfaces';
import { DetailHero } from '@/components/details/detail-hero';
import { StatBar } from '@/components/details/stat-bar';
import { Section, Rail } from '@/components/details/section';
import { CastRail } from '@/components/details/cast-rail';
import { MediaRail } from '@/components/details/media-rail';
import { KeywordChips } from '@/components/details/keyword-chips';
import { ExternalLinks } from '@/components/details/external-links';
import { TvShowCard } from '@/components/tv/tv-show-card';
import WhereToWatch from '@/components/movies/where-to-watch';
import FlixrReviews from '@/components/movies/flixr-reviews';
import ReviewsGrid from '@/components/reviews-grid';
import {
    formatDate,
    formatRuntime,
    getBestTrailer,
    getContentRating,
    tmdbImg,
} from '@/lib/utils';

interface TVDetailsProps {
    show: TVShow;
    reviews?: Review[];
}

type EpisodeLike = TVShow['last_episode_to_air'];

function EpisodeCard({
    label,
    ep,
}: {
    label: string;
    ep: EpisodeLike | null;
}) {
    if (!ep) return null;
    const still = tmdbImg(ep.still_path, 'w300');
    return (
        <div className='w-80 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10 bg-background/30 backdrop-blur-sm'>
            <div className='relative aspect-video bg-muted'>
                {still && (
                    <Image
                        src={still}
                        alt={ep.name}
                        fill
                        sizes='20rem'
                        className='object-cover'
                    />
                )}
                <span className='absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium text-white'>
                    {label}
                </span>
            </div>
            <div className='space-y-1 p-3'>
                <p className='text-xs text-muted-foreground'>
                    S{ep.season_number} · E{ep.episode_number}
                    {ep.air_date ? ` · ${ep.air_date}` : ''}
                </p>
                <p className='line-clamp-1 font-medium'>{ep.name}</p>
                {ep.overview && (
                    <p className='line-clamp-2 text-sm text-muted-foreground'>
                        {ep.overview}
                    </p>
                )}
            </div>
        </div>
    );
}

/**
 * Spotlight + rails TV detail page. Mirrors the movie page and adds the
 * TV-specific data: seasons, latest/upcoming episodes, creators, networks.
 */
export function TVDetails({ show, reviews = [] }: TVDetailsProps) {
    const firstYear = show.first_air_date
        ? new Date(show.first_air_date).getFullYear()
        : '';
    const lastYear = show.last_air_date
        ? new Date(show.last_air_date).getFullYear()
        : '';
    const yearRange = firstYear
        ? show.in_production
            ? `${firstYear}–present`
            : lastYear && lastYear !== firstYear
              ? `${firstYear}–${lastYear}`
              : `${firstYear}`
        : '';

    const trailer = getBestTrailer(show.videos);
    const keywords = show.keywords?.results ?? show.keywords?.keywords ?? [];
    const recommendations = show.recommendations?.results?.length
        ? show.recommendations.results
        : show.similar?.results ?? [];
    const creators = show.created_by ?? [];
    // Sort by season number, but push Specials (season 0) to the end.
    const seasons = [...(show.seasons ?? [])].sort(
        (a, b) =>
            (a.season_number || Infinity) - (b.season_number || Infinity)
    );

    const hasDetails =
        (show.networks?.length ?? 0) > 0 ||
        (show.production_companies?.length ?? 0) > 0 ||
        (show.spoken_languages?.length ?? 0) > 0 ||
        keywords.length > 0 ||
        !!show.homepage ||
        !!show.external_ids?.imdb_id;

    const heroMeta = [
        yearRange,
        show.number_of_seasons
            ? `${show.number_of_seasons} Season${
                  show.number_of_seasons === 1 ? '' : 's'
              }`
            : '',
        formatRuntime(show.episode_run_time?.[0]),
        getContentRating(show.content_ratings),
    ].filter(Boolean);

    const stats = [
        { label: 'Seasons', value: String(show.number_of_seasons ?? '') },
        { label: 'Episodes', value: String(show.number_of_episodes ?? '') },
        { label: 'Status', value: show.status ?? '' },
        { label: 'Network', value: show.networks?.[0]?.name ?? '' },
        { label: 'First air', value: formatDate(show.first_air_date) },
        { label: 'Type', value: show.type ?? '' },
    ];

    return (
        <div className='min-h-screen bg-background pb-20 text-foreground'>
            <DetailHero
                title={show.name}
                backdropPath={show.backdrop_path}
                posterPath={show.poster_path}
                rating={show.vote_average}
                voteCount={show.vote_count}
                metaItems={heroMeta}
                genres={show.genres}
                tagline={show.tagline}
                trailer={trailer}
            />

            <div className='mx-auto max-w-7xl'>
                <div className='py-6'>
                    <StatBar items={stats} />
                </div>

                {(show.overview || creators.length > 0) && (
                    <Section id='overview' title='Overview'>
                        {show.overview && (
                            <p className='max-w-3xl leading-relaxed text-muted-foreground'>
                                {show.overview}
                            </p>
                        )}
                        {creators.length > 0 && (
                            <div className='mt-6'>
                                <p className='text-xs uppercase tracking-wide text-muted-foreground'>
                                    Created by
                                </p>
                                <p className='font-medium'>
                                    {creators.map((c, i) => (
                                        <span key={c.id}>
                                            <Link
                                                href={`/person/${c.id}`}
                                                className='hover:underline'>
                                                {c.name}
                                            </Link>
                                            {i < creators.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        )}
                    </Section>
                )}

                {(show.last_episode_to_air || show.next_episode_to_air) && (
                    <Rail title='Latest & Upcoming'>
                        <EpisodeCard
                            label='Latest'
                            ep={show.last_episode_to_air}
                        />
                        <EpisodeCard
                            label='Next'
                            ep={show.next_episode_to_air}
                        />
                    </Rail>
                )}

                {seasons.length > 0 && (
                    <Rail title='Seasons'>
                        {seasons.map((s) => {
                            const poster = tmdbImg(s.poster_path, 'w342');
                            return (
                                <Link
                                    key={s.id}
                                    href={`/tv/${show.id}/season/${s.season_number}`}
                                    className='w-40 shrink-0 snap-start'>
                                    <div className='overflow-hidden rounded-xl border border-white/10 bg-background/30 backdrop-blur-sm transition-all duration-200 hover:border-white/20'>
                                        <div className='relative aspect-2/3 bg-muted'>
                                            {poster && (
                                                <Image
                                                    src={poster}
                                                    alt={s.name}
                                                    fill
                                                    sizes='10rem'
                                                    className='object-cover'
                                                />
                                            )}
                                        </div>
                                        <div className='p-2'>
                                            <p className='line-clamp-1 text-sm font-medium'>
                                                {s.name}
                                            </p>
                                            <p className='text-xs text-muted-foreground'>
                                                {s.episode_count} episodes
                                                {s.air_date
                                                    ? ` · ${new Date(
                                                          s.air_date
                                                      ).getFullYear()}`
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </Rail>
                )}

                <CastRail credits={show.credits} />

                <MediaRail
                    videos={show.videos?.results}
                    backdrops={show.images?.backdrops}
                />

                <Section id='watch'>
                    <WhereToWatch mediaType='tv' id={show.id} />
                </Section>

                {recommendations.length > 0 && (
                    <Rail title='More Like This'>
                        {recommendations.slice(0, 18).map((s, i) => (
                            <TvShowCard key={s.id} show={s} index={i} />
                        ))}
                    </Rail>
                )}

                {hasDetails && (
                <Section id='facts' title='Details'>
                    <div className='grid gap-8 md:grid-cols-2'>
                        <div className='space-y-6'>
                            {show.networks?.length ? (
                                <div>
                                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                        Networks
                                    </p>
                                    <p className='text-sm'>
                                        {show.networks
                                            .map((n) => n.name)
                                            .join(' · ')}
                                    </p>
                                </div>
                            ) : null}
                            {show.production_companies?.length ? (
                                <div>
                                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                        Production
                                    </p>
                                    <p className='text-sm'>
                                        {show.production_companies
                                            .map((c) => c.name)
                                            .join(' · ')}
                                    </p>
                                </div>
                            ) : null}
                            {show.spoken_languages?.length ? (
                                <div>
                                    <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                        Languages
                                    </p>
                                    <p className='text-sm'>
                                        {show.spoken_languages
                                            .map((l) => l.english_name)
                                            .join(', ')}
                                    </p>
                                </div>
                            ) : null}
                            <ExternalLinks
                                externalIds={show.external_ids}
                                homepage={show.homepage}
                            />
                        </div>
                        {keywords.length > 0 && (
                            <div>
                                <p className='mb-2 text-xs uppercase tracking-wide text-muted-foreground'>
                                    Keywords
                                </p>
                                <KeywordChips
                                    keywords={keywords}
                                    basePath='/tv'
                                />
                            </div>
                        )}
                    </div>
                </Section>
                )}

                <Section id='reviews'>
                    <FlixrReviews tmdbId={show.id} mediaType='tv' />
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
