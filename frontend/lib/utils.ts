import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Video, ReleaseDates, ContentRatings } from './interfaces';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Rating colors per docs/DESIGN.md (cinematic dark uses the -400 shades).
export const getRatingColor = (rating: number) => {
    if (rating >= 7.5) return 'text-green-400';
    if (rating >= 6) return 'text-yellow-400';
    return 'text-red-400';
};

export const TMDB_IMG = 'https://image.tmdb.org/t/p';

type TmdbSize =
    | 'w92'
    | 'w154'
    | 'w185'
    | 'w300'
    | 'w342'
    | 'w500'
    | 'w780'
    | 'w1280'
    | 'original';

/** Build a TMDB image URL, or null when there's no path (caller renders a fallback). */
export function tmdbImg(
    path: string | null | undefined,
    size: TmdbSize = 'w500'
): string | null {
    return path ? `${TMDB_IMG}/${size}${path}` : null;
}

/** 137 -> "2h 17m"; 45 -> "45m"; null/0 -> "". */
export function formatRuntime(minutes?: number | null): string {
    if (!minutes || minutes <= 0) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m ? ` ${m}m` : ''}` : `${m}m`;
}

/** 160000000 -> "$160M"; 1500000 -> "$1.5M"; 0/undefined -> "". */
export function formatMoney(value?: number | null): string {
    if (!value || value <= 0) return '';
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000)
        return `$${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
}

/** ISO date -> "Oct 1, 2021"; empty/invalid -> "". */
export function formatDate(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/** Theatrical certification for a region, e.g. "PG-13". */
export function getCertification(
    releaseDates?: ReleaseDates,
    region = 'US'
): string {
    const entry = releaseDates?.results?.find((r) => r.iso_3166_1 === region);
    const cert = entry?.release_dates?.find((d) => d.certification)?.certification;
    return cert || '';
}

/** TV content rating for a region, e.g. "TV-MA". */
export function getContentRating(
    contentRatings?: ContentRatings,
    region = 'US'
): string {
    return (
        contentRatings?.results?.find((r) => r.iso_3166_1 === region)?.rating ||
        ''
    );
}

/** Best official YouTube trailer (falls back to any YouTube Trailer/Teaser/clip). */
export function getBestTrailer(videos?: { results: Video[] }): Video | null {
    const vids = videos?.results?.filter((v) => v.site === 'YouTube') ?? [];
    if (!vids.length) return null;
    const rank = (v: Video) =>
        (v.type === 'Trailer' ? 0 : v.type === 'Teaser' ? 1 : 2) +
        (v.official ? 0 : 0.5);
    return [...vids].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}
