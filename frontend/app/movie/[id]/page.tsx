import React, { Suspense } from 'react';
import { MovieDetailsSkeleton } from '@/components/movies/movie-details-skeleton';
import { MovieDetails } from '@/components/movies/movie-details';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movieId = Number.parseInt(id, 10);
    if (isNaN(movieId)) return { title: 'Movie Details | Flixr' };

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${apiUrl}/api/movies/${movieId}`);
        if (!response.ok) return { title: 'Movie Details | Flixr' };
        const data = await response.json();
        const movie = data?.movie;
        if (!movie) return { title: 'Movie Not Found | Flixr' };

        return {
            title: `${movie.title} | Flixr`,
            description: movie.overview?.slice(0, 160) || 'Movie details on Flixr',
            openGraph: {
                title: `${movie.title} | Flixr`,
                description: movie.overview,
                images: movie.backdrop_path
                    ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`]
                    : [],
            },
        };
    } catch {
        return { title: 'Movie Details | Flixr' };
    }
}

export default async function MovieDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const id = (await params).id;
    const movieId = Number.parseInt(id as string, 10);

    const fetchMovieDetails = async () => {
        try {
            if (isNaN(movieId)) {
                throw new Error('Invalid movie ID');
            }
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiUrl}/api/movies/${movieId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch movie details');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching movie details:', error);
            return null;
        }
    };

    const movieData = await fetchMovieDetails();

    if (!movieData || !movieData?.movie) {
        return (
            <main>
                <p className='text-center mt-20'>Movie not found.</p>
            </main>
        );
    }

    return (
        <main>
            <Suspense fallback={<MovieDetailsSkeleton />}>
                <MovieDetails
                    movie={movieData?.movie}
                    reviews={movieData?.reviews?.results ?? []}
                />
            </Suspense>
        </main>
    );
}
