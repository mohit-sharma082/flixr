import { Request } from 'express';

/** Params valid for BOTH /discover/movie and /discover/tv */
const COMMON_KEYS = [
    'sort_by',
    'with_genres',
    'without_genres',
    'with_original_language',
    'with_keywords',
    'with_watch_providers',
    'watch_region',
    'vote_average.gte',
    'vote_average.lte',
    'vote_count.gte',
    'with_runtime.gte',
    'with_runtime.lte',
    'page',
];

/** Movie-only discover params */
const MOVIE_KEYS = [
    'primary_release_year',
    'primary_release_date.gte',
    'primary_release_date.lte',
    'year',
    'with_cast',
    'with_crew',
    'with_people',
    'region',
];

/** TV-only discover params */
const TV_KEYS = [
    'first_air_date_year',
    'first_air_date.gte',
    'first_air_date.lte',
    'with_status',          // 0 Returning,1 Planned,2 In Production,3 Ended,4 Canceled,5 Pilot
    'with_type',            // 0 Documentary,1 News,2 Miniseries,3 Reality,4 Scripted,5 Talk,6 Video
    'include_null_first_air_dates',
    'screened_theatrically',
];

export function buildDiscoverParams(
    req: Request,
    mediaType: 'movie' | 'tv',
): Record<string, any> {
    const allowed = [
        ...COMMON_KEYS,
        ...(mediaType === 'movie' ? MOVIE_KEYS : TV_KEYS),
    ];

    const params: Record<string, any> = {};
    for (const key of allowed) {
        const v = req.query[key];
        if (v !== undefined && v !== null && String(v).trim() !== '') {
            params[key] = v;
        }
    }

    // Sensible defaults
    const page = +(req.query.page || 1);
    params.page = Number.isFinite(page) && page > 0 ? page : 1;
    if (!params.sort_by) params.sort_by = 'popularity.desc';

    return params;
}
