'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { AlertTriangle, Film, Heart, Star, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card } from '../ui/card';
import { Movie } from '@/lib/interfaces';

interface MovieCardProps {
    movie: Movie;
    index: number;
}

export function MovieCard({ movie, index }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [imageError, setImageError] = useState(false);

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

    // Calculate rating color based on vote_average
    const getRatingColor = (rating: number) => {
        if (rating >= 7.5) return 'text-green-500';
        if (rating >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };

    // Handle favorite toggle
    const handleFavoriteToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState);
    };

    // Determine media type icon
    const MediaTypeIcon = movie.media_type === 'tv' ? Tv : Film;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.06 }}
            className='h-full '>
            <Link href={`/movie/${movie.id}`} className='block h-full'>
                <Card
                    className='shadow-none cursor-pointer relative overflow-hidden transition-all duration-300 bg-transparent border-0 rounded-lg group  h-full flex flex-col'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <div className='relative aspect-[2/3] overflow-hidden rounded-lg flex-shrink-0'>
                        {posterUrl && !imageError ? (
                            <Image
                                src={posterUrl || '/placeholder.svg'}
                                alt={movie.title ?? 'image'}
                                fill
                                className='object-cover transition-transform duration-500 group-hover:scale-105 bg-primary/20'
                                sizes='(max-width: 640px) 42vw, (max-width: 768px) 180px, (max-width: 1024px) 210px, 260px'
                                onError={() => setImageError(true)}
                                priority={index < 4}
                            />
                        ) : backdropUrl ? (
                            <Image
                                src={backdropUrl || '/placeholder.svg'}
                                alt={movie.title ?? 'image'}
                                fill
                                className='object-cover transition-transform duration-500 group-hover:scale-105 bg-primary/20'
                                sizes='(max-width: 640px) 42vw, (max-width: 768px) 180px, (max-width: 1024px) 210px, 260px'
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
                                'absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300',
                                isHovered ? 'opacity-100' : 'opacity-0'
                            )}></div>

                        {/* Adult content badge */}
                        {movie.adult && (
                            <div className='absolute top-2 left-2 z-10'>
                                <Badge
                                    variant='destructive'
                                    className='flex items-center gap-1'>
                                    <AlertTriangle className='w-3 h-3' />
                                    <span className='text-xs'>18+</span>
                                </Badge>
                            </div>
                        )}

                        {/* Media type badge */}
                        <div
                            className={cn(
                                'absolute top-2 left-2 z-10 transition-opacity duration-300',
                                movie.adult ? 'left-14' : '',
                                isHovered ? 'opacity-100' : 'opacity-0'
                            )}>
                            <Badge
                                variant='outline'
                                className='bg-black/50 backdrop-blur-sm text-white border-none flex items-center gap-1'>
                                <MediaTypeIcon className='w-3 h-3' />
                                <span className='text-xs capitalize'>
                                    {movie.media_type || 'movie'}
                                </span>
                            </Badge>
                        </div>

                        {/* Favorite button */}
                        <button
                            className={cn(
                                'absolute top-2 right-2 p-1.5 rounded-full bg-black/50 backdrop-blur-sm transition-all duration-300',
                                isHovered ? 'opacity-100' : 'opacity-0'
                            )}
                            onClick={handleFavoriteToggle}
                            aria-label={
                                isFavorite
                                    ? 'Remove from favorites'
                                    : 'Add to favorites'
                            }>
                            <Heart
                                className={cn(
                                    'w-4 h-4',
                                    isFavorite
                                        ? 'fill-primary text-primary'
                                        : 'text-white'
                                )}
                            />
                        </button>

                        {/* Rating */}
                        {movie?.vote_average && (
                            <div
                                className={cn(
                                    'absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300',
                                    isHovered ? 'opacity-100' : 'opacity-0'
                                )}>
                                <Star
                                    className={cn(
                                        'w-3 h-3 fill-current',
                                        getRatingColor(movie.vote_average)
                                    )}
                                />
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        getRatingColor(movie.vote_average)
                                    )}>
                                    {movie.vote_average.toFixed(1)}
                                </span>
                            </div>
                        )}

                        {/* Overview on hover */}
                        <div
                            className={cn(
                                'absolute bottom-0 left-0 right-0 p-3 transition-all duration-300',
                                isHovered
                                    ? 'translate-y-0 opacity-100'
                                    : 'translate-y-4 opacity-0'
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
                            {!isHovered && movie?.vote_average && (
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
                        <div className='flex items-center justify-between mt-1'>
                            <p className='text-xs text-muted-foreground'>
                                {releaseYear}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                                {movie?.original_language?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}
