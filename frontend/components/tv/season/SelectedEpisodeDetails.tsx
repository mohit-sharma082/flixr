'use client';

import Image from 'next/image';
import { Episode } from '@/lib/interfaces';
import { Star, Play } from 'lucide-react';
import { cn, getRatingColor } from '@/lib/utils';

interface SelectedEpisodeDetailsProps {
    episode: Episode | null;
}

export function SelectedEpisodeDetails({
    episode,
}: SelectedEpisodeDetailsProps) {
    if (!episode) {
        return (
            <div className='flex items-center justify-center h-full text-muted-foreground'>
                <div className='text-center'>
                    <p className='text-lg'>Select an episode to view details</p>
                </div>
            </div>
        );
    }

    return (
        <div className='relative overflow-y-auto h-full scrollbar-hide'>
            <div className='space-y-8 p-6'>
                <div id='episode-details'></div>
                {/* Episode Poster */}
                {episode.still_path && (
                    <div className='relative w-full aspect-video rounded-lg overflow-hidden '>
                        <Image
                            src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
                            alt={episode.name}
                            fill
                            className='object-cover z-0'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent' />
                    </div>
                )}

                {/* Episode Info */}
                <div className='space-y-3 z-20 '>
                    <h2 className='text-2xl font-bold text-foreground'>
                        {episode.name}
                    </h2>

                    <div className='flex items-center justify-between gap-4 text-sm'>
                        <div
                            className={cn(
                                'flex items-center gap-2',
                                getRatingColor(episode.vote_average),
                            )}>
                            <Star className='w-4 h-4 ' />
                            <span className=' font-bold'>
                                {episode.vote_average?.toFixed(1) || 'N/A'}/10
                            </span>
                        </div>
                        {episode.air_date && (
                            <span className='text-muted-foreground text-sm font-bold'>
                                Aired{' '}
                                {new Date(
                                    episode.air_date,
                                ).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Overview */}
                {episode.overview && (
                    <div className='space-y-2 z-20'>
                        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
                            Overview
                        </h3>
                        <p className='text-sm text-muted-foreground leading-relaxed'>
                            {episode.overview}
                        </p>
                    </div>
                )}

                {/* Guest Stars */}
                {episode.guest_stars && episode.guest_stars.length > 0 && (
                    <div className='space-y-3 z-20'>
                        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
                            Guest Stars
                        </h3>
                        <div className='grid xl:grid-cols-2 gap-4'>
                            {episode.guest_stars.map((star) => (
                                <div
                                    key={star.id}
                                    className='flex gap-3 items-start'>
                                    <div className='relative w-14 h-14 bg-foreground/30 rounded overflow-hidden flex-shrink-0'>
                                        {star.profile_path ? (
                                            <Image
                                                src={`https://image.tmdb.org/t/p/w185${star.profile_path}`}
                                                alt={star.name}
                                                fill
                                                className='object-cover'
                                            />
                                        ) : (
                                            <div className='flex items-center justify-center h-full font-bold text-sm'>
                                                {star.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                        <p className='text-sm font-medium text-foreground truncate'>
                                            {star.name}
                                        </p>
                                        {star.character && (
                                            <p className='text-xs text-muted-foreground truncate'>
                                                as {star.character}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Crew */}
                {episode.crew && episode.crew.length > 0 && (
                    <div className='space-y-3'>
                        <h3 className='text-sm font-semibold text-foreground uppercase tracking-wide'>
                            Crew
                        </h3>
                        <div className='space-y-2'>
                            {episode.crew.slice(0, 5).map((member, midx) => (
                                <div
                                    key={member.id + '_' + midx}
                                    className='text-sm'>
                                    <p className='font-medium text-foreground'>
                                        {member.name}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {member.job}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
