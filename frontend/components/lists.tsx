import { Movie, TVShow } from '@/lib/interfaces';
import { cn, getRatingColor } from '@/lib/utils';
import { Star } from 'lucide-react';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { Card } from './ui/card';
import Image from 'next/image';

interface CompactItem {
    id: number;
    title: string;
    poster?: string | null;

    released_on?: string;
    original_language?: string;
    vote_average?: number;
    rating?: string;
    href: string;
}
export function CompactList({
    title,
    items,
}: {
    title: string;
    items: TVShow[] | Movie[] | CompactItem[];
}) {
    const getRatingColor = (rating: number) => {
        if (rating >= 7.5) return 'text-green-500';
        if (rating >= 6) return 'text-yellow-500';
        return 'text-red-500';
    };
    const ITEMS = useMemo(() => {
        return (
            items?.map((item) => {
                if ('name' in item) {
                    // TV Show
                    const tvShow = item as TVShow;
                    return {
                        id: tvShow.id,
                        title:
                            tvShow.name || tvShow.original_name || 'Untitled',
                        poster: tvShow.poster_path,
                        rating: tvShow.vote_average
                            ? tvShow.vote_average.toFixed(1)
                            : undefined,
                        href: `/tv/${tvShow.id}`,
                        released_on: tvShow.first_air_date,
                        original_language: tvShow.original_language,
                    };
                } else if ('title' in item) {
                    // Movie
                    const movie = item as Movie;
                    return {
                        id: movie.id,
                        title:
                            movie.title || movie.original_title || 'Untitled',
                        poster: movie.poster_path,
                        rating: movie.vote_average
                            ? movie.vote_average.toFixed(1)
                            : undefined,
                        href: `/movie/${movie.id}`,
                        released_on: movie.release_date,
                        original_language: movie.original_language,
                    };
                } else {
                    // CompactItem
                    return item as CompactItem;
                }
            }) || []
        );
    }, [items]);

    return (
        <div className='grid grid-cols-3  md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 p-4 md:px-8'>
            <h3 className='text-2xl font-semibold col-span-full'>{title}</h3>

            {ITEMS.map((item, idx) => (
                <Link
                    key={item.id + '-' + idx}
                    href={item?.href ?? '/'}
                    className='flex bg-background/30 flex-col md:flex-row group border-2 border-transparent rounded hover:border-primary/5 '>
                    <div className='md:w-20 md:h-30  group-hover:w-24 transition-all duration-200 shrink-0 bg-muted rounded group-hover:rounded-r-none overflow-hidden'>
                        {item.poster && (
                            <img
                                src={`https://image.tmdb.org/t/p/w185${item.poster}`}
                                alt={item?.title ?? 'poster'}
                                className='w-full h-full object-cover group-hover:scale-105 transition-all duration-300'
                                loading='lazy'
                            />
                        )}
                    </div>

                    <div className='relative flex flex-col flex-1  md:p-2 md:ps-4'>
                        <div className='absolute inset-0 z-0 opacity-50 overflow-hidden rounded-r-md'>
                            {item.poster && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w185${item.poster}`}
                                    alt={item?.title ?? 'poster'}
                                    className='w-full h-full object-cover  transition-all duration-300 opacity-0 group-hover:opacity-50'
                                    loading='lazy'
                                />
                            )}
                        </div>
                        <span className='text-sm  font-medium line-clamp-3 z-10'>
                            {item.title}
                        </span>
                        <p className='text-xs text-muted-foreground transition-all duration-300 group-hover:text-foreground z-10'>
                            {item.released_on}
                        </p>

                        <div className=' self-end flex w-full mt-auto items-center justify-between z-10'>
                            {item?.rating && (
                                <div className='flex items-center gap-1 ml-1'>
                                    <Star
                                        className={cn(
                                            'w-3 h-3 fill-current',
                                            getRatingColor(
                                                Number(item?.rating),
                                            ),
                                        )}
                                    />
                                    <span
                                        className={cn(
                                            'text-xs',
                                            getRatingColor(
                                                Number(item?.rating),
                                            ),
                                        )}>
                                        {item?.rating}
                                    </span>
                                </div>
                            )}
                            <p className='text-xs text-muted-foreground group-hover:text-foreground'>
                                {item?.original_language?.toUpperCase()}
                            </p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

export function NumberedList({
    title,
    items,
}: {
    title: string;
    items: TVShow[] | Movie[] | CompactItem[];
}) {
    const ITEMS = useMemo(() => {
        return items?.map((item, index) => {
            if ('name' in item) {
                // TV Show
                const tvShow = item as TVShow;
                return {
                    id: tvShow.id,
                    title: tvShow.name || tvShow.original_name || 'Untitled',
                    poster: tvShow.poster_path,
                    rating: tvShow.vote_average
                        ? tvShow.vote_average.toFixed(1)
                        : undefined,
                    href: `/tv/${tvShow.id}`,
                    released_on: tvShow.first_air_date,
                    original_language: tvShow.original_language,
                    vote_average: tvShow.vote_average,
                    number: index + 1,
                };
            } else if ('title' in item) {
                // Movie
                const movie = item as Movie;
                return {
                    id: movie.id,
                    title: movie.title || movie.original_title || 'Untitled',
                    poster: movie.poster_path,
                    rating: movie.vote_average
                        ? movie.vote_average.toFixed(1)
                        : undefined,
                    href: `/movie/${movie.id}`,
                    released_on: movie.release_date,
                    original_language: movie.original_language,
                    vote_average: movie.vote_average,
                    number: index + 1,
                };
            } else {
                return {
                    ...(item as CompactItem),
                    number: index + 1,
                };
            }
        }) ?? []
    }, [items]);
    return (
        <section className='px-4 sm:px-6 lg:px-8 py-6'>
            <h2 className='text-2xl font-semibold mb-4'>{title}</h2>

            <div className='flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory'>
                {ITEMS.map((item) => (
                    <Link key={item.id} href={item.href} className='snap-start'>
                        <Card
                            className={cn(
                                'flex flex-row group gap-0 min-w-44 md:min-w-60 bg-transparent border-none shadow-none aspect-[0.9] p-0',
                            )}>
                            {/* COLUMN */}
                            <div className='h-full p-0 max-w-1/3 flex flex-col justify-between items-end gap-4'>
                                <span className=' text-xl md:text-3xl font-extrabold text-muted-foreground group-hover:text-foreground transition-all duration-300 leading-none p-0 aspect-square flex items-center text-right'>
                                    # {item.number.toString().padStart(2, '0')}
                                </span>
                                {item?.vote_average && (
                                    <div className='flex flex-col items-center gap-1 w-fit pr-1 pb-3 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'>
                                        <Star
                                            className={cn(
                                                'w-3 h-3 fill-current',
                                                getRatingColor(
                                                    item?.vote_average,
                                                ),
                                            )}
                                        />
                                        <span
                                            className={cn(
                                                'text-xs font-medium',
                                                getRatingColor(
                                                    item?.vote_average,
                                                ),
                                            )}>
                                            {item?.vote_average?.toFixed(1)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className='relative w-full h-full overflow-hidden rounded-md'>
                                {item.poster && (
                                    <Image
                                        src={`https://image.tmdb.org/t/p/w342${item.poster}`}
                                        alt={item.title}
                                        fill
                                        className='object-cover group-hover:scale-105 transition-all duration-300'
                                        sizes='(max-width: 768px) 40vw, 200px'
                                        loading='lazy'
                                    />
                                )}
                                <div
                                    className={cn(
                                        'absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 bg-gradient-to-t from-black/80 to-black/20',
                                    )}>
                                    <p className='text-xs text-gray-200 line-clamp-6 w-2/3'>
                                        {item.released_on}
                                    </p>
                                    <p className='text-xs text-gray-200 line-clamp-6 w-2/3'>
                                        {item.title}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}

                <div className='w-8 shrink-0' />
            </div>
        </section>
    );
}
