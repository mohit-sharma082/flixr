import HeroCarousel from '@/components/hero-carousel';
import { MovieCard } from '@/components/movies/movie-card';
import { TvShowCard } from '@/components/tv/tv-show-card';
import { createServerApi } from '@/lib/api';
import { Genre, Movie, TVShow } from '@/lib/interfaces';

export const metadata = {
    title: 'Home | Flixr',
    description: 'Discover popular movies and read community reviews',
};

type ReponseData = {
    movies: {
        trending: Movie[];
        nowPlaying: Movie[];
        popular: Movie[];
        topRated: Movie[];
        upcoming: Movie[];
    };
    tv: {
        trending: TVShow[];
        airingToday: TVShow[];
        popular: TVShow[];
        topRated: TVShow[];
        onTheAir: TVShow[];
    };
    genres: {
        movie: Genre[];
        tv: Genre[];
    };
};

async function getTrendingItems(): Promise<ReponseData | null> {
    try {
        const api = createServerApi(process.env.NEXT_PUBLIC_API_URL);
        const resp = await api.get('/api/common/homepage');
        const data = resp.data?.data;
        return data;
    } catch (err) {
        console.error('Error fetching popular movies (server api):', err);
        return null;
    }
}

export default async function HomePage() {
    const response = await getTrendingItems();
    // console.log('GOT :', response);
    if (!response) {
        return <main className='min-h-screen '>Error loading data</main>;
    }

    const { movies, tv: shows, genres } = response;

    return (
        <main className='min-h-screen '>
            <div className='pt-4 bg-background'>
                {/* <HeroCarousel movies={movies.trending} shows={shows.trending} /> */}
            </div>

            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>Now Playing Movies</h1>
                    <p className=' mt-2'>
                        Discover what's currently playing in theaters near you.
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {movies?.nowPlaying?.map((movie, i) => (
                        <MovieCard
                            index={i}
                            key={i || movie.id}
                            movie={movie}
                        />
                    ))}
                </div>
            </div>

            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>Trending TV Shows</h1>
                    <p className=' mt-2'></p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {shows?.trending?.map((show, i) => (
                        <TvShowCard index={i} key={i || show.id} show={show} />
                    ))}
                </div>
            </div>

            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>Popular Movies</h1>
                    <p className=' mt-2'>
                        Discover the most popular movies loved by audiences
                        worldwide.
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {movies?.popular?.map((movie, i) => (
                        <MovieCard
                            index={i}
                            key={i || movie.id}
                            movie={movie}
                        />
                    ))}
                </div>
            </div>

            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>Top Rated Movies</h1>
                    <p className=' mt-2'>
                        Discover the highest rated movies by audiences
                        worldwide.
                    </p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {movies?.topRated?.map((movie, i) => (
                        <MovieCard
                            index={i}
                            key={i || movie.id}
                            movie={movie}
                        />
                    ))}
                </div>
            </div>

            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>Popular TV Shows</h1>
                    <p className=' mt-2'></p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {shows?.popular?.map((show, i) => (
                        <TvShowCard index={i} key={i || show.id} show={show} />
                    ))}
                </div>
            </div>
            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>
                        TV Shows Airing Today
                    </h1>
                    <p className=' mt-2'></p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {shows?.airingToday?.map((show, i) => (
                        <TvShowCard index={i} key={i || show.id} show={show} />
                    ))}
                </div>
            </div>
            <div className=' px-4 sm:px-6 lg:px-8 py-6'>
                <div className=''>
                    <h1 className='text-3xl font-bold '>On The Air TV Shows</h1>
                    <p className=' mt-2'></p>
                </div>

                <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))]'>
                    {shows?.onTheAir?.map((show, i) => (
                        <TvShowCard index={i} key={i || show.id} show={show} />
                    ))}
                </div>
            </div>
        </main>
    );
}
