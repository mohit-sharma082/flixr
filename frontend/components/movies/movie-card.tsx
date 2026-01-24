'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Film, Heart, Star, Tv } from 'lucide-react';
import { cn, getRatingColor } from '@/lib/utils';
import { Card } from '../ui/card';
import { Movie } from '@/lib/interfaces';
import React from 'react';

interface MovieCardProps {
    movie: Movie;
    index: number;
}

function MovieCardImpl({ movie, index }: MovieCardProps) {
    // const [isHovered, setIsHovered] = useState(false);

    // Extract year from release_date
    const releaseYear = movie.release_date
        ? new Date(movie.release_date).getFullYear()
        : 'Unknown';

    // Format poster path
    const posterUrl = movie?.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : '';

    // Format backdrop path for fallback
    const backdropUrl = movie?.backdrop_path
        ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}`
        : '';

    return (
        <Link
            href={`/movie/${movie.id}`}
            className='block flex-1 h-full min-w-2/5 md:min-w-70 snap-start'>
            <Card className='shadow-none cursor-pointer relative overflow-hidden transition-all duration-300 bg-transparent border-0 rounded-lg group  h-full flex flex-col'>
                <div className='relative aspect-2/3 overflow-hidden rounded-lg '>
                    {posterUrl ? (
                        <Image
                            src={posterUrl || '/placeholder.svg'}
                            alt={movie.title ?? 'image'}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-105 bg-primary/20'
                            sizes='(max-width: 640px) 42vw, (max-width: 768px) 180px, (max-width: 1024px) 210px, 260px'
                            loading='lazy'
                        />
                    ) : backdropUrl ? (
                        <Image
                            src={backdropUrl || '/placeholder.svg'}
                            alt={movie.title ?? 'image'}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-105 bg-primary/20'
                            sizes='(max-width: 640px) 42vw, (max-width: 768px) 180px, (max-width: 1024px) 210px, 260px'
                            loading='lazy'
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 p-4'>
                            <p className='text-center font-medium'>
                                {movie.title}
                            </p>
                        </div>
                    )}

                    {/* Overlay gradient */}
                    <div
                        className={cn(
                            'absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100'
                        )}></div>

                    {/* Adult content badge */}
                    {movie.adult && (
                        <div className='absolute top-2 left-2 z-10 group-hover:top-8 transition-all'>
                            <Badge
                                variant='destructive'
                                className='flex items-center gap-1'>
                                <AlertTriangle className='w-3 h-3' />
                                <span className='text-xs'>18+</span>
                            </Badge>
                        </div>
                    )}
                    <div
                        className={cn(
                            'absolute top-2 left-2 z-10 transition-opacity duration-300  opacity-0 group-hover:opacity-100',
                            movie.adult ? 'left-14' : ''
                        )}>
                        <Badge
                            variant='outline'
                            className='bg-black/50 backdrop-blur-sm text-white border-none flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            <span className='text-xs capitalize'>
                                {releaseYear}
                            </span>
                        </Badge>
                    </div>

                    {movie?.original_language && (
                        <div
                            className={cn(
                                'absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300  opacity-0 group-hover:opacity-100'
                            )}>
                            <p className='text-xs text-foreground/90'>
                                {movie?.original_language?.toUpperCase()}
                            </p>
                        </div>
                    )}

                    {/* Overview on hover */}
                    <div
                        className={cn(
                            'absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
                        )}>
                        <p className='text-xs text-gray-200 line-clamp-6 w-2/3'>
                            {movie.overview || 'No description available.'}
                        </p>
                    </div>
                </div>

                <div className='mt-2 flex-grow'>
                    <div className='flex items-start justify-between'>
                        <h3 className='font-medium line-clamp-1 text-sm sm:text-base'>
                            {movie.title}
                        </h3>
                    </div>
                    <div className='flex items-center justify-between mt-1'>
                        {movie?.vote_average && (
                            <div className='flex items-center gap-1 ml-1'>
                                <Star
                                    className={cn(
                                        'w-3 h-3 fill-current',
                                        getRatingColor(movie?.vote_average)
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-xs',
                                        getRatingColor(movie?.vote_average)
                                    )}>
                                    {movie?.vote_average?.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}

export const MovieCard = React.memo(MovieCardImpl);
