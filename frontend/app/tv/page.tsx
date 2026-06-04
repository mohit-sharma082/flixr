import { TVShow, Genre } from '@/lib/interfaces';
import { DiscoverShell, TabDef } from '@/components/discover/discover-shell';

export const metadata = {
    title: 'TV Shows | Flixr',
    description: 'Discover popular, top-rated, and currently airing TV shows',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchInitial(
    path: string,
): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
        const res = await fetch(`${API_BASE}/api/tv${path}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return { results: [], total_pages: 1 };
        const data = await res.json();
        return { results: data.results ?? [], total_pages: data.total_pages ?? 1 };
    } catch {
        return { results: [], total_pages: 1 };
    }
}

async function fetchTVGenres(): Promise<Genre[]> {
    try {
        const res = await fetch(`${API_BASE}/api/common/genres`, {
            next: { revalidate: 86400 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.data?.genres?.tv ?? [];
    } catch {
        return [];
    }
}

const TABS: TabDef[] = [
    { key: 'popular', label: 'Popular', apiPath: '/popular' },
    { key: 'top_rated', label: 'Top Rated', apiPath: '/top_rated' },
    { key: 'on_the_air', label: 'On The Air', apiPath: '/on_the_air' },
    { key: 'airing_today', label: 'Airing Today', apiPath: '/airing_today' },
];

export default async function TVDiscoverPage() {
    const [popular, genres] = await Promise.all([
        fetchInitial('/popular?page=1'),
        fetchTVGenres(),
    ]);

    const heroItem = popular.results[Math.floor(Math.random() * Math.min(6, popular.results.length))];

    return (
        <DiscoverShell
            mediaType='tv'
            title='TV Shows'
            subtitle="Stream the latest episodes, binge top-rated series, and never miss what's on air."
            heroBackdrop={heroItem?.backdrop_path ?? null}
            tabs={TABS}
            genres={genres}
            initialData={popular}
        />
    );
}
