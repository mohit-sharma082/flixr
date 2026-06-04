import { Movie, Genre } from '@/lib/interfaces';
import { DiscoverShell, TabDef } from '@/components/discover/discover-shell';

export const metadata = {
    title: 'Movies | Flixr',
    description: 'Discover trending, popular, and top-rated movies',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchInitial(
    path: string,
): Promise<{ results: Movie[]; total_pages: number }> {
    try {
        const res = await fetch(`${API_BASE}/api/movies${path}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return { results: [], total_pages: 1 };
        const data = await res.json();
        return { results: data.results ?? [], total_pages: data.total_pages ?? 1 };
    } catch {
        return { results: [], total_pages: 1 };
    }
}

async function fetchGenres(): Promise<Genre[]> {
    try {
        const res = await fetch(`${API_BASE}/api/movies/genres`, {
            next: { revalidate: 86400 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.genres ?? [];
    } catch {
        return [];
    }
}

const TABS: TabDef[] = [
    { key: 'trending', label: 'Trending', apiPath: '/trending/week' },
    { key: 'popular', label: 'Popular', apiPath: '/popular' },
    { key: 'top_rated', label: 'Top Rated', apiPath: '/top_rated' },
    { key: 'now_playing', label: 'Now Playing', apiPath: '/now_playing' },
    { key: 'upcoming', label: 'Upcoming', apiPath: '/upcoming' },
];

export default async function MovieDiscoverPage() {
    const [trending, genres] = await Promise.all([
        fetchInitial('/trending/week?page=1'),
        fetchGenres(),
    ]);

    const heroItem = trending.results[Math.floor(Math.random() * Math.min(6, trending.results.length))];

    return (
        <DiscoverShell
            mediaType='movie'
            title='Movies'
            subtitle='Explore trending blockbusters, critically acclaimed classics, and everything in between.'
            heroBackdrop={heroItem?.backdrop_path ?? null}
            tabs={TABS}
            genres={genres}
            initialData={trending}
        />
    );
}
