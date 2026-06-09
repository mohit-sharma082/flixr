import { Movie, Genre } from '@/lib/interfaces';
import { DiscoverExplorer } from '@/components/discover/discover-explorer';

export const metadata = {
    title: 'Discover Movies | Flixr',
    description: 'Filter and explore movies by genre, rating, year, and more',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const FORWARD_KEYS = [
    'sort_by', 'with_genres', 'without_genres', 'with_original_language',
    'vote_average.gte', 'vote_average.lte', 'vote_count.gte',
    'with_runtime.gte', 'with_runtime.lte',
    'primary_release_year', 'primary_release_date.gte', 'primary_release_date.lte',
    'page',
];

function toQuery(sp: Record<string, string | string[] | undefined>) {
    const qs = new URLSearchParams();
    for (const key of FORWARD_KEYS) {
        const v = sp[key];
        if (typeof v === 'string' && v.trim() !== '') qs.set(key, v);
    }
    return qs.toString();
}

async function fetchDiscover(query: string) {
    try {
        const res = await fetch(`${API_BASE}/api/movies/discover?${query}`, {
            next: { revalidate: 1800 },
        });
        if (!res.ok) return { results: [], total_pages: 1, page: 1 };
        return await res.json();
    } catch {
        return { results: [], total_pages: 1, page: 1 };
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

export default async function MovieDiscoverPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const sp = await searchParams;
    const query = toQuery(sp);
    const [initial, genres] = await Promise.all([
        fetchDiscover(query),
        fetchGenres(),
    ]);

    return (
        <DiscoverExplorer
            mediaType='movie'
            genres={genres}
            initialResults={(initial.results ?? []) as Movie[]}
            initialPage={initial.page ?? 1}
            initialTotalPages={initial.total_pages ?? 1}
        />
    );
}
