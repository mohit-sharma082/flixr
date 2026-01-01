import HeroCarousel from '@/components/hero-carousel';
import { MovieGrid } from '@/components/movies/movie-grid';
import { TvShowCard } from '@/components/tv/tv-show-card';
import { createServerApi } from '@/lib/api';
import { Movie, TVShow } from '@/lib/interfaces';

export const metadata = {
    title: 'Home | Flixr',
    description: 'Discover popular movies and read community reviews',
};

async function getTrendingItems(): Promise<[Movie[], TVShow[]]> {
    try {
        const api = createServerApi(process.env.NEXT_PUBLIC_API_URL);
        const resp = await api.get('/api/common/trending');

        const data = resp.data?.data;
        const movies = data?.movies?.results ?? [];
        const shows = data?.tvs?.results ?? [];
        return [movies, shows];
    } catch (err) {
        console.error('Error fetching popular movies (server api):', err);
        return [[], []];
    }
}

export default async function HomePage() {
    const [movies, shows] = await getTrendingItems();
    // console.log('GOT :', { movies, shows });

    return (
        <main className='min-h-screen '>
            <HeroCarousel movies={movies} shows={shows} />

            <div className=' px-4 sm:px-6 lg:px-8 py-12'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold '>Popular Movies</h1>
                    <p className=' mt-2'>
                        Discover what's popular in the Flixr community
                    </p>
                </div>

                <MovieGrid movies={movies} />
            </div>

            <div className=' px-4 sm:px-6 lg:px-8 py-12'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold '>Popular TV Shows</h1>
                    <p className=' mt-2'></p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))]'>
                    {shows?.map((show, i) => (
                        <TvShowCard index={i} key={i || show.id} show={show} />
                    ))}
                </div>
            </div>
        </main>
    );
}
