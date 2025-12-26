'use client';
import { Movie } from '@/lib/interfaces';
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { createApi } from '@/lib/api';

interface MovieDetailsProps {
    movie: Movie;
}

const SimilarMoviesSection = ({ movie }: MovieDetailsProps) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [error, setError] = useState<any | null>(null);

    console.log('Movie Details:', movie);
    const getSimilar = async () => {
        try {
            if (!movie.id) return [];
            const api = createApi();
            const res = await api.get('/api/movies/' + movie.id + '/similar');
            console.log({ res });
            return res?.data?.results ?? [];
        } catch (error: any) {
            console.log(
                'Error fetching similar movies:',
                error?.message ?? error
            );
            setError(error ?? 'An error occurred');
            return [];
        }
    };

    useEffect(() => {
        getSimilar().then((data) => setMovies(data));
    }, [movie]);

    if (error)
        return (
            <div className='relative border border-destructive max-w-full p-2 text-wrap rounded text-sm'>
                <pre className='text-pretty break-all'>
                    Error: {JSON.stringify({ error }, null, 4)}
                </pre>
            </div>
        );

    if (!movies?.length) return <div>no similar movies found</div>;

    return (
        <Card className='p-0'>
            <CardContent className='p-6'>
                <h3 className='text-xl font-bold mb-4'>Similar Movies</h3>
                <div className='flex flex-col gap-6'>
                    {movies?.slice(0, 5).map((movie, i) => {
                        let releaseYear = movie.release_date
                            ? new Date(movie.release_date).getFullYear()
                            : 'Unknown';
                        return (
                            <Link href={`/movie/${movie.id}`} key={i}>
                                <div className='flex gap-3 relative cursor-pointer'>
                                    <div className='relative w-30 aspect-[9/13] rounded overflow-hidden flex-shrink-0 z-10'>
                                        {movie?.poster_path ? (
                                            <Image
                                                src={
                                                    'https://image.tmdb.org/t/p/w500' +
                                                    movie.poster_path
                                                }
                                                alt={movie.title}
                                                fill
                                                className='object-cover transition-transform duration-500 group-hover:scale-105 bg-primary/20'
                                                sizes='(max-width: 640px) 42vw, (max-width: 768px) 180px, (max-width: 1024px) 210px, 260px'
                                            />
                                        ) : (
                                            <div className='absolute inset-0 bg-primary/20 animate-pulse' />
                                        )}
                                    </div>
                                    <div className='flex flex-col gap-2 justify-between flex-1 z-10 '>
                                        <h4 className='font-medium line-clamp-3'>
                                            {movie.title}
                                        </h4>
                                        <p className='text-sm text-muted-foreground line-clamp-3 '>
                                            {movie.overview}
                                        </p>
                                        <p className='text-sm text-muted-foreground'>
                                            {movie.genres?.map((g, j) => (
                                                <Badge key={j}>{g.name}</Badge>
                                            ))}
                                        </p>
                                        <div className='flex justify-between bottom-0'>
                                            <div className='flex items-center mt-1'>
                                                <Star className='h-3 w-3 text-yellow-500 fill-yellow-500 mr-1' />
                                                <span className='text-xs text-muted-foreground'>
                                                    {movie.vote_average}
                                                </span>
                                            </div>

                                            <p className='text-sm text-muted-foreground'>
                                                {releaseYear}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {/* <Button variant='outline' className='w-full'>
                        View More Similar Movies
                    </Button> */}
                </div>
            </CardContent>
        </Card>
    );
};

export default SimilarMoviesSection;
