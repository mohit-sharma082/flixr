import { Movie } from '@/lib/interfaces';
import { MovieCard } from './movie-card';

interface MovieGridProps {
    movies: Movie[];
}

export function MovieGrid({ movies }: MovieGridProps) {
    try {
        if (movies?.length === 0) {
            return <div className='text-center py-12 '>No movies found</div>;
        }

        return (
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]'>
                {movies?.map((movie, i) => (
                    <MovieCard
                        index={i}
                        key={i || movie.id}
                        movie={movie}
                    />
                ))}
            </div>
        );
    } catch (error) {
        console.log(
            'Error in MovieGrid:',
            JSON.stringify({ error, movies }, null, 4)
        );
        return (
            <div className='text-center py-12 text-red-500'>
                Error loading movies
            </div>
        );
    }
}
