'use client';

import Image from 'next/image';
import { Episode } from '@/lib/interfaces';
import { Star } from 'lucide-react';
import { cn, getRatingColor } from '@/lib/utils';

interface EpisodesListProps {
    episodes: Episode[];
    selectedEpisode: Episode | null;
    onSelectEpisode: (episode: Episode) => void;
}

export function EpisodesList({
    episodes,
    selectedEpisode,
    onSelectEpisode,
}: EpisodesListProps) {
    return (
        <div className='overflow-y-auto h-full scrollbar-hide'>
            <div className='space-y-4 p-4'>
                {episodes.map((episode) => (
                    <button
                        key={episode.id}
                        onClick={() => {
                            onSelectEpisode(episode);
                            // go to the element 'episode-details' in the right column
                            document
                                .getElementById('episode-details')
                                ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={cn(
                            'cursor-pointer w-full text-left rounded-lg overflow-hidden transition-all duration-200',
                            'hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50',
                            selectedEpisode?.id === episode.id
                                ? 'bg-primary/20 border-l-8 border-primary/60 focus:ring-primary/60'
                                : 'bg-secondary/40 border-l-4 border-transparent',
                        )}>
                        <div className='flex gap-3 p-3'>
                            {/* Thumbnail */}
                            {episode.still_path && (
                                <div className='relative w-48 h-28 rounded flex-shrink-0 overflow-hidden'>
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                                        alt={`Episode ${episode.episode_number}`}
                                        fill
                                        className='object-cover'
                                    />
                                </div>
                            )}

                            {/* Info */}
                            <div className='flex-1 min-w-0 px-2'>
                                {/* <div className='flex items-baseline gap-2 mb-1'> */}
                                <span className='text-sm font-semibold text-muted-foreground'>
                                    EP {episode.episode_number}
                                </span>
                                <h4 className='text-sm font-medium text-foreground truncate'>
                                    {episode.name}
                                </h4>
                                {/* </div> */}

                                <p className='text-sm text-muted-foreground line-clamp-1 mb-4'>
                                    {episode.overview ||
                                        'No description available'}
                                </p>

                                <div className='flex items-center justify-between'>
                                    <div
                                        className={cn(
                                            'flex items-center gap-1',
                                            getRatingColor(
                                                episode.vote_average,
                                            ),
                                        )}>
                                        <Star className='w-3 h-3 ' />
                                        <span className='text-sm font-medium'>
                                            {episode.vote_average?.toFixed(1) ||
                                                'N/A'}
                                        </span>
                                    </div>
                                    {episode.air_date && (
                                        <span className='text-sm text-muted-foreground'>
                                            {new Date(
                                                episode.air_date,
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
