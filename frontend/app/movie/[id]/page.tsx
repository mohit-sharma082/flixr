import { notFound } from 'next/navigation';
import { MovieDetails } from '@/components/movies/movie-details';
import { serverApiBase } from '@/lib/api-base.server';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const movieId = Number.parseInt(id, 10);
    if (isNaN(movieId)) return { title: 'Movie Details | Flixr' };

    try {
        const apiUrl = serverApiBase();
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
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const movieId = Number.parseInt(id, 10);

    const fetchMovieDetails = async () => {
        try {
            if (isNaN(movieId)) {
                throw new Error('Invalid movie ID');
            }
            const apiUrl =
                serverApiBase();
            const response = await fetch(`${apiUrl}/api/movies/${movieId}`, {
                next: { revalidate: 3600 },
            });

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

    // A missing title is a 404, not a 200 with an apology paragraph — this gets
    // the right status code, the shared not-found page, and correct SEO.
    if (!movieData?.movie) notFound();

    return (
        <main>
            <MovieDetails
                movie={movieData.movie}
                reviews={movieData.reviews?.results ?? []}
            />
        </main>
    );
}
