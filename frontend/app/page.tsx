import HeroCarousel from '@/components/hero-carousel';
import { MovieCard } from '@/components/movies/movie-card';
import dynamic from 'next/dynamic';
import { createServerApi } from '@/lib/api';
import { Genre, Movie, TVShow } from '@/lib/interfaces';

const CompactList = dynamic(
    () => import('@/components/lists').then((mod) => mod.CompactList),
    {
        loading: () => (
            <div className='h-20 w-full animate-pulse'>Loading...</div>
        ),
    }
);
const NumberedList = dynamic(
    () => import('@/components/lists').then((mod) => mod.NumberedList),
    {
        loading: () => (
            <div className='h-20 w-full animate-pulse'>Loading...</div>
        ),
    }
);

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
    // return <main className='min-h-screen p-4 '>Temp return</main>;
    const response = await getTrendingItems();
    // console.log('GOT :', response);
    if (!response) {
        return <main className='min-h-screen '>Error loading data</main>;
    }

    const { movies, tv: shows, genres } = response;

    return (
        <main className='min-h-screen bg-background'>
            {/* HERO */}
            <div className='pt-4'>
                <HeroCarousel
                    movies={movies.trending}
                    shows={shows.trending}
                    maxItems={12}
                />
            </div>

            <section className='px-4 sm:px-6 lg:px-8 pt-6'>
                <h2 className='text-xl font-semibold'>Movies - Now Playing</h2>

                <div className='flex items-stretch gap-4 overflow-x-scroll snap-x snap-mandatory'>
                    {movies.nowPlaying.map((item) => (
                        <MovieCard key={item.id} movie={item} index={0} />
                    ))}
                    <div className='w-20 p-8 bg-transparent h-full min-h-1/2'></div>
                </div>
            </section>

            <NumberedList title='Most Popular TV Shows' items={shows.popular} />
            <NumberedList title='Most Popular Movies' items={movies.popular} />

            <CompactList title='Shows - On The Air' items={shows.onTheAir} />
            <CompactList title='Top Rated Movies' items={movies.topRated} />

            <NumberedList title='Upcoming Movies' items={movies.upcoming} />
            <NumberedList
                title='Shows Airing Today'
                items={shows.airingToday}
            />
            <CompactList title='Top Rated Shows' items={shows.topRated} />

            <CompactList title='Shows | Trending' items={shows.trending} />
            <CompactList title='Movies | Trending' items={movies.trending} />

            <div className='h-20 py-8 w-1'></div>
        </main>
    );
}
