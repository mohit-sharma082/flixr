// // components/tv/SeasonDetails.tsx
// import React from 'react';
// import Image from 'next/image';
// import { Season, Episode } from '@/lib/interfaces';
// import { Card } from '@/components/ui/card';

// interface SeasonDetailsProps {
//     season: Season;
// }

// const IMAGE_BASE =
//     process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p';

// export default function SeasonDetails({ season }: SeasonDetailsProps) {
//     const {
//         name,
//         overview,
//         poster_path,
//         season_number,
//         vote_average,
//         episodes,
//         air_date,
//         images,
//     } = season;

//     const backdrop = images?.backdrops?.[0]?.file_path || poster_path;

//     return (
//         <main className='relative min-h-screen bg-background text-foreground'>
//             {/* ================= HERO ================= */}
//             <section className='relative h-[70vh] w-full overflow-hidden'>
//                 {/* Background */}
//                 {backdrop && (
//                     <Image
//                         src={`${IMAGE_BASE}/original${backdrop}`}
//                         alt={name ?? 'Season Backdrop'}
//                         fill
//                         priority
//                         className='object-cover scale-105'
//                     />
//                 )}

//                 {/* Overlays */}
//                 <div className='absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent' />
//                 <div className='absolute inset-0' />

//                 {/* Content */}
//                 <div className='relative z-10 max-w-7xl mx-auto h-full px-6 flex items-end pb-12'>
//                     <div className='flex gap-8 items-end'>
//                         {/* Poster */}
//                         <div className='hidden sm:block w-56 shrink-0'>
//                             {poster_path ? (
//                                 <Image
//                                     src={`${IMAGE_BASE}/w500${poster_path}`}
//                                     alt={name || 'Season Poster'}
//                                     width={500}
//                                     height={750}
//                                     className='rounded-xl shadow-2xl'
//                                 />
//                             ) : (
//                                 <div className='aspect-2/3 rounded-xl bg-muted' />
//                             )}
//                         </div>

//                         {/* Meta */}
//                         <div className='space-y-4 max-w-2xl'>
//                             <h1 className='text-3xl sm:text-4xl font-semibold leading-tight'>
//                                 {name}
//                             </h1>

//                             <div className='flex flex-wrap gap-4 text-sm text-muted-foreground'>
//                                 <span>Season {season_number}</span>
//                                 {air_date && <span>{air_date}</span>}
//                                 {vote_average > 0 && (
//                                     <span className='text-yellow-400'>
//                                         ★ {vote_average.toFixed(1)}
//                                     </span>
//                                 )}
//                             </div>

//                             {overview && (
//                                 <p className='text-sm sm:text-base leading-relaxed text-foreground/90'>
//                                     {overview}
//                                 </p>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* ================= EPISODES ================= */}
//             <section className='max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-6'>
//                 <div className='flex items-center justify-between'>
//                     <h2 className='text-2xl font-semibold'>Episodes</h2>
//                     <span className='text-sm text-muted-foreground'>
//                         {episodes.length} episodes
//                     </span>
//                 </div>

//                 <div className='grid gap-4'>
//                     {episodes.map((episode) => (
//                         <EpisodeRow key={episode.id} episode={episode} />
//                     ))}
//                 </div>
//             </section>
//         </main>
//     );
// }

// function EpisodeRow({ episode }: { episode: Episode }) {
//     const guests = episode.guest_stars.slice(0, 8);
//     const extra = episode.guest_stars.length - guests.length;

//     return (
//         <Card className='p-4'>
//             <div className='grid grid-cols-[220px_1fr_180px] gap-4'>
//                 {/* Thumbnail */}
//                 <Image
//                     src={
//                         episode.still_path
//                             ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
//                             : '/placeholder.svg'
//                     }
//                     alt={episode.name}
//                     width={220}
//                     height={124}
//                     className='rounded-md object-cover'
//                 />

//                 {/* Main */}
//                 <div className='space-y-2'>
//                     <h3 className='font-medium'>
//                         {episode.episode_number}. {episode.name}
//                     </h3>

//                     <p className='text-sm text-muted-foreground leading-relaxed line-clamp-3'>
//                         {episode.overview}
//                     </p>

//                     <div className='text-xs text-muted-foreground flex gap-4'>
//                         {episode.runtime && <span>{episode.runtime} min</span>}
//                         {episode.air_date && (
//                             <span>
//                                 {new Date(episode.air_date).toDateString()}
//                             </span>
//                         )}
//                     </div>
//                 </div>

//                 {/* Guests */}
//                 <div className='flex flex-wrap gap-2 justify-end'>
//                     {guests.map((g) => (
//                         <div
//                             key={g.credit_id}
//                             title={`${g.name} as ${g.character}`}
//                             className='w-8 h-8 rounded-full overflow-hidden bg-muted'>
//                             {g.profile_path && (
//                                 <Image
//                                     src={`https://image.tmdb.org/t/p/w185${g.profile_path}`}
//                                     alt={g.name}
//                                     width={32}
//                                     height={32}
//                                     className='object-cover'
//                                 />
//                             )}
//                         </div>
//                     ))}
//                     {extra > 0 && (
//                         <span className='text-xs text-muted-foreground self-center'>
//                             +{extra}
//                         </span>
//                     )}
//                 </div>
//             </div>
//         </Card>
//     );
// }

'use client';

import React from 'react';
import Image from 'next/image';
import { Season, Episode } from '@/lib/interfaces';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SeasonDetailsProps {
    season: Season;
}

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export default function SeasonDetails({ season }: SeasonDetailsProps) {
    const {
        name,
        overview,
        poster_path,
        season_number,
        vote_average,
        episodes,
        air_date,
        images,
    } = season;

    const backdrop = images?.backdrops?.[0]?.file_path || poster_path;

    return (
        <main className='min-h-screen bg-background text-foreground'>
            {/* HERO SECTION */}
            <section className='relative h-[60vh] w-full overflow-hidden'>
                
                {/* Backdrop Image */}
                {backdrop && (
                    <Image
                        src={`${IMAGE_BASE}/original${backdrop}`}
                        alt={name ?? 'Season Backdrop'}
                        fill
                        priority
                        className='object-cover'
                    />
                )}

                {/* Gradient Overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent' />

                {/* Content */}
                <div className='relative z-10 h-full max-w-7xl mx-auto px-6 flex items-end pb-12'>
                    <div className='flex flex-col sm:flex-row gap-8 w-full items-end'>
                        {/* Poster */}
                        {poster_path && (
                            <div className='hidden sm:block flex-shrink-0'>
                                <Image
                                    src={`${IMAGE_BASE}/w500${poster_path}`}
                                    alt={name || 'Season Poster'}
                                    width={220}
                                    height={330}
                                    className='rounded-lg shadow-2xl'
                                />
                            </div>
                        )}

                        {/* Info */}
                        <div className='space-y-6 flex-1'>
                            <div>
                                <h1 className='text-4xl sm:text-5xl font-bold leading-tight mb-3'>
                                    {name}
                                </h1>
                                <div className='flex flex-wrap gap-3'>
                                    <Badge variant='secondary'>
                                        Season {season_number}
                                    </Badge>
                                    {air_date && (
                                        <Badge variant='secondary'>
                                            {new Date(air_date).getFullYear()}
                                        </Badge>
                                    )}
                                    {vote_average > 0 && (
                                        <Badge
                                            variant='outline'
                                            className='text-yellow-500'>
                                            ★ {vote_average.toFixed(1)}/10
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {overview && (
                                <p className='text-base leading-relaxed text-foreground/80 max-w-2xl'>
                                    {overview}
                                </p>
                            )}

                            <div className='text-sm text-muted-foreground'>
                                <p>
                                    {episodes.length}{' '}
                                    {episodes.length === 1
                                        ? 'episode'
                                        : 'episodes'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* EPISODES SECTION */}
            <section className='max-w-7xl mx-auto px-6 py-16'>
                <div className='mb-8'>
                    <h2 className='text-3xl font-bold'>Episodes</h2>
                </div>

                <div className='grid gap-4'>
                    {episodes.map((episode) => (
                        <EpisodeCard key={episode.id} episode={episode} />
                    ))}
                </div>
            </section>

            {/* CREW SECTION */}
            {season.credits && season.credits.cast.length > 0 && (
                <section className='max-w-7xl mx-auto px-6 py-16 border-t border-border'>
                    <div className='mb-8'>
                        <h2 className='text-3xl font-bold'>Cast</h2>
                    </div>

                    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                        {season.credits.cast.slice(0, 12).map((cast) => (
                            <CastCard key={cast.credit_id} cast={cast} />
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
}

function EpisodeCard({ episode }: { episode: Episode }) {
    const guests = episode.guest_stars.slice(0, 5);
    const moreGuests = episode.guest_stars.length - guests.length;

    return (
        <Card className='p-4 sm:p-6 hover:shadow-md transition-shadow'>
            
            <div className='grid grid-cols-1 sm:grid-cols-[180px_1fr_120px] gap-4'>
                {/* Thumbnail */}
                <div className='sm:col-span-1'>
                    <Image
                        src={
                            episode.still_path
                                ? `${IMAGE_BASE}/w300${episode.still_path}`
                                : '/placeholder.svg?height=100&width=180'
                        }
                        alt={episode.name}
                        width={180}
                        height={100}
                        className='rounded-md object-cover w-full'
                    />
                </div>

                {/* Episode Info */}
                <div className='space-y-3'>
                    <div>
                        <h3 className='font-semibold text-lg'>
                            {episode.episode_number}. {episode.name}
                        </h3>
                        <p className='text-xs text-muted-foreground mt-1'>
                            {episode.air_date &&
                                new Date(episode.air_date).toLocaleDateString()}
                            {episode.runtime && ` • ${episode.runtime} min`}
                        </p>
                    </div>

                    <p className='text-sm text-foreground/70 line-clamp-2'>
                        {episode.overview}
                    </p>

                    {/* Guest Stars */}
                    {guests.length > 0 && (
                        <div className='flex items-center gap-2 pt-2'>
                            <span className='text-xs text-muted-foreground'>
                                Guest stars:
                            </span>
                            <div className='flex gap-2'>
                                {guests.map((guest) => (
                                    <div
                                        key={guest.credit_id}
                                        title={`${guest.name} as ${guest.character}`}
                                        className='w-6 h-6 rounded-full overflow-hidden bg-muted'>
                                        {guest.profile_path && (
                                            <Image
                                                src={`${IMAGE_BASE}/w185${guest.profile_path}`}
                                                alt={guest.name}
                                                width={24}
                                                height={24}
                                                className='object-cover'
                                            />
                                        )}
                                    </div>
                                ))}
                                {moreGuests > 0 && (
                                    <span className='text-xs text-muted-foreground self-center pl-1'>
                                        +{moreGuests}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating */}
                {episode.vote_average > 0 && (
                    <div className='flex items-center justify-end'>
                        <div className='text-center'>
                            <div className='text-2xl font-bold text-yellow-500'>
                                {episode.vote_average.toFixed(1)}
                            </div>
                            <p className='text-xs text-muted-foreground'>★</p>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}

function CastCard({ cast }: { cast: any }) {
    return (
        <div className='text-center space-y-2'>
            <div className='aspect-square rounded-lg overflow-hidden bg-muted'>
                {cast.profile_path ? (
                    <Image
                        src={`${IMAGE_BASE}/w185${cast.profile_path}`}
                        alt={cast.name}
                        width={150}
                        height={150}
                        className='object-cover w-full h-full'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                        No image
                    </div>
                )}
            </div>
            <div>
                <p className='font-semibold text-sm truncate'>{cast.name}</p>
                <p className='text-xs text-muted-foreground truncate'>
                    {cast.character}
                </p>
            </div>
        </div>
    );
}
