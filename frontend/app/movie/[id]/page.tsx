import React, { Suspense } from 'react';
import { MovieDetailsSkeleton } from '@/components/movies/movie-details-skeleton';
import { MovieDetails } from '@/components/movies/movie-details';

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
