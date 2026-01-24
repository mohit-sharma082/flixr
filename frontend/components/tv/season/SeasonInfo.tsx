'use client';

import Image from 'next/image';
import { Season } from '@/lib/interfaces';
import { Star, Calendar } from 'lucide-react';
import { cn, getRatingColor } from '@/lib/utils';

interface SeasonInfoProps {
    season: Season;
}

export function SeasonInfo({ season }: SeasonInfoProps) {
    return (
        <div className='overflow-y-auto h-full scrollbar-hide'>
            <div className='space-y-6 p-6'>
                {/* Poster */}
                {season.poster_path && (
                    <div className='relative w-full aspect-[2/3] max-h-[50vh] rounded-lg overflow-hidden'>
                        <Image
                            src={`https://image.tmdb.org/t/p/w342${season.poster_path}`}
                            alt={season.name ?? 'Season Poster'}
                            fill
                            className='object-cover'
                        />
                        <div className='absolute bottom-0 w-full h-full left-0 bg-gradient-to-t from-background to-transparent flex items-end '>
                            <div className='space-y-2 p-4 backdrop-blur-sm'>
                                <h2 className='text-xl font-bold text-foreground'>
                                    {season.name}
                                </h2>
                                <p className='text-xs text-muted-foreground uppercase tracking-widest font-semibold'>
                                    {season.episodes?.length} Episodes
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {/* Air Date */}
                {season.air_date && (
                    <div className='flex items-center gap-3 text-sm'>
                        <Calendar className='w-10 h-10 p-2 text-primary/80 bg-primary/5 rounded' />
                        <div>
                            <p className='text-xs text-muted-foreground uppercase tracking-widest'>
                                Air Date
                            </p>
                            <p className='text-foreground font-medium'>
                                {new Date(season.air_date).toLocaleDateString(
                                    'en-US',
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    },
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {/* Overview */}
                {season.overview && (
                    <div className='space-y-2'>
                        <h3 className='text-xs font-semibold text-foreground uppercase tracking-widest'>
                            About
                        </h3>
                        <p className='text-sm text-muted-foreground leading-relaxed'>
                            {season.overview}
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div className='space-y-3 pt-4 border-t border-border'>
                    <h3 className='text-xs font-semibold text-foreground uppercase tracking-widest'>
                        Season Stats
                    </h3>
                    <div
                        className={cn(
                            'flex items-center gap-3',
                            getRatingColor(season.vote_average),
                        )}>
                        <Star className='w-6 h-6 p-1 rounded' />

                        <p className=' font-medium'>
                            {season.vote_average?.toFixed(1) || 'N/A'}/10
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
