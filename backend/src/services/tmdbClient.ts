import axios from 'axios';
import { redisClient } from '../cache/redisClient';
import { config } from '../config';

// Sourced from the boot-validated config rather than raw process.env: the key
// is guaranteed present here, so the non-null assertion (and the silent
// "requests fail at runtime" it hid) is gone.
const TMDB_API_KEY = config.tmdbApiKey;
const TMDB_BASE = config.tmdbBase;
const CACHE_TTL = config.cacheTtlSeconds;
const IS_PROD = config.isProd;

type QueryParams = Record<string, any>;

// TMDB rejects page > 500; clamp untrusted input to a valid integer in [1, 500]
// before it reaches upstream (audit H1).
const TMDB_MIN_PAGE = 1;
const TMDB_MAX_PAGE = 500;

export function clampPage(raw: unknown): number {
    const n = Math.trunc(Number(raw));
    if (!Number.isFinite(n) || n < TMDB_MIN_PAGE) return TMDB_MIN_PAGE;
    if (n > TMDB_MAX_PAGE) return TMDB_MAX_PAGE;
    return n;
}

// Only these append_to_response sub-requests are allowed through to TMDB; any
// other value is dropped so a caller can't fan one request into many (audit H1).
const ALLOWED_APPEND = new Set([
    'videos',
    'images',
    'credits',
    'similar',
    'recommendations',
    'reviews',
    'keywords',
    'external_ids',
    'release_dates', // movie certifications (US -> PG-13 etc.)
    'content_ratings', // tv certifications (US -> TV-MA etc.)
]);

export function sanitizeAppendToResponse(raw: unknown): string {
    if (raw === undefined || raw === null) return '';
    return String(raw)
        .split(',')
        .map((s) => s.trim())
        .filter((s) => ALLOWED_APPEND.has(s))
        .join(',');
}

/**
 * Declarative route map for TMDB endpoints.
 * Use the functions to produce endpoint paths; they do not include the base URL or the api_key param.
 *
 * Add routes here as you need them. Functions produce encoded values when necessary.
 */
export const TMDB_ROUTES = {
    // Search
    search: {
        multi: () => '/search/multi',
        movie: () => '/search/movie',
        tv: () => '/search/tv',
        person: () => '/search/person',
    },

    // Movies
    movies: {
        root: '/movie',

        // for individual movie
        details: (id: number | string) => `/movie/${id}`,
        similar: (id: number | string) => `/movie/${id}/similar`,
        credits: (id: number | string) => `/movie/${id}/credits`,
        videos: (id: number | string) => `/movie/${id}/videos`,
        images: (id: number | string) => `/movie/${id}/images`,

        // for lists for a movie
        externalIds: (id: number | string) => `/movie/${id}/external_ids`,
        reviews: (id: number | string) => `/movie/${id}/reviews`,
        keywords: (id: number | string) => `/movie/${id}/keywords`,
        translations: (id: number | string) => `/movie/${id}/translations`,
        watchProviders: (id: number | string) => `/movie/${id}/watch/providers`,
        recommendations: (id: number | string) =>
            `/movie/${id}/recommendations`,
        trending: () => `/trending/movie/week`,

        // for lists
        popular: () => `/movie/popular`,
        topRated: () => `/movie/top_rated`,
        nowPlaying: () => `/movie/now_playing`,
        upcoming: () => `/movie/upcoming`,

        discover: () => `/discover/movie`,
        search: () => `/search/movie`,
    },

    // TV
    tv: {
        root: '/tv',

        // for individual TV show
        details: (id: number | string) => `/tv/${id}`,
        similar: (id: number | string) => `/tv/${id}/similar`,
        credits: (id: number | string) => `/tv/${id}/credits`,
        videos: (id: number | string) => `/tv/${id}/videos`,
        images: (id: number | string) => `/tv/${id}/images`,

        season: (tvId: number | string, seasonNumber: number | string) =>
            `/tv/${tvId}/season/${seasonNumber}`,
        episode: (
            tvId: number | string,
            seasonNumber: number | string,
            episodeNumber: number | string,
        ) => `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,

        // for lists for a TV show
        recommendations: (id: number | string) => `/tv/${id}/recommendations`,
        externalIds: (id: number | string) => `/tv/${id}/external_ids`,
        reviews: (id: number | string) => `/tv/${id}/reviews`,
        keywords: (id: number | string) => `/tv/${id}/keywords`,
        translations: (id: number | string) => `/tv/${id}/translations`,
        watchProviders: (id: number | string) => `/tv/${id}/watch/providers`,

        // for lists
        popular: () => `/tv/popular`,
        topRated: () => `/tv/top_rated`,
        onTheAir: () => `/tv/on_the_air`,
        airingToday: () => `/tv/airing_today`,
        trending: () => `/trending/tv/week`,

        discover: () => `/discover/tv`,
        search: () => `/search/tv`,
    },

    // People
    people: {
        details: (id: number | string) => `/person/${id}`,
        popular: () => `/person/popular`,
        combinedCredits: (id: number | string) =>
            `/person/${id}/combined_credits`,
        images: (id: number | string) => `/person/${id}/images`,
    },

    // Genres
    genres: {
        movie: () => `/genre/movie/list`,
        tv: () => `/genre/tv/list`,
    },

    // Trending
    trending: {
        all: (timeWindow: 'day' | 'week' = 'day') =>
            `/trending/all/${timeWindow}`,
        movie: (timeWindow: 'day' | 'week' = 'day') =>
            `/trending/movie/${timeWindow}`,
        tv: (timeWindow: 'day' | 'week' = 'day') =>
            `/trending/tv/${timeWindow}`,
    },

    companies: {
        details: (id: number | string) => `/company/${id}`,
        alternative_names: (id: number | string) =>
            `/company/${id}/alternative_names`,
        images: (id: number | string) => `/company/${id}/images`,
    },

    // Misc
    configuration: () => `/configuration`,
    find: (externalId: string, externalSource: string) =>
        `/find/${encodeURIComponent(
            externalId,
        )}?external_source=${encodeURIComponent(externalSource)}`,
} as const;

export class TMDBClient {
    private baseUrl: string;
    private apiKey: string;
    // Single-flight: concurrent cache misses for the SAME key share one upstream
    // fetch instead of dogpiling TMDB (audit H5).
    private inFlight = new Map<string, Promise<unknown>>();

    constructor(baseUrl = TMDB_BASE, apiKey = TMDB_API_KEY) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    private cacheKey(prefix: string) {
        return `tmdb:${prefix}`;
    }

    /**
     * Redis is a cache, not a dependency: a read that fails (server down,
     * still starting, connection dropped) must cost latency, not correctness.
     * Both helpers swallow their errors so a cold Redis degrades the request
     * to a direct TMDB fetch instead of turning it into a 500.
     */
    private async cacheGet(key: string): Promise<string | null> {
        try {
            return await redisClient.get(key);
        } catch (err: any) {
            console.error('Redis GET failed (serving uncached):', key, err?.message);
            return null;
        }
    }

    private async cacheSet(key: string, ttl: number, value: string) {
        try {
            await redisClient.setex(key, ttl, value);
        } catch (err: any) {
            console.error('Redis SETEX failed (result not cached):', key, err?.message);
        }
    }

    private async getCached<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds?: number, // for some cases we might want different TTL
    ): Promise<T> {
        const cached = await this.cacheGet(key);
        if (cached) {
            try {
                return JSON.parse(cached) as T;
            } catch {
                // Corrupt entry — treat it as a miss rather than a 500.
                console.error('Redis entry was not valid JSON, refetching:', key);
            }
        }

        // Coalesce concurrent misses for the same key onto one upstream fetch.
        const existing = this.inFlight.get(key);
        if (existing) return existing as Promise<T>;

        const promise = (async () => {
            const result = await fetcher();
            // setex requires seconds TTL,
            const ttl = ttlSeconds
                ? ttlSeconds < 60
                    ? 60
                    : ttlSeconds
                : CACHE_TTL;
            await this.cacheSet(key, ttl, JSON.stringify(result));
            return result;
        })();

        this.inFlight.set(key, promise);
        try {
            return await promise;
        } finally {
            this.inFlight.delete(key);
        }
    }

    /**
     * Connection-level failures only (reset, refused, DNS, timeout) — never a
     * response TMDB actually sent. Retrying a 4xx/5xx would just repeat it, but
     * a reset connection carried no answer at all, so trying again is safe even
     * for the same request. This matters in practice: some ISPs intermittently
     * reset connections to TMDB's CDN edges, and without a retry every such
     * reset surfaces as a 500 (or an empty rail) to the user.
     */
    private static isTransient(error: any): boolean {
        if (error?.response) return false;
        return ['ECONNRESET', 'ECONNREFUSED', 'EAI_AGAIN', 'ENOTFOUND',
                'ETIMEDOUT', 'ECONNABORTED'].includes(error?.code);
    }

    private async request(pathRoute: string, params: QueryParams = {}) {
        try {
            const fullParams = {
                ...params,
                api_key: this.apiKey,
                // TMDB's parameter is `include_adult` — a bare `adult` key is
                // silently ignored upstream, so this filter was a no-op before.
                include_adult: false,
            };

            const url = `${this.baseUrl}${pathRoute}`;
            if (!IS_PROD) console.log('TMDB Request URL: ', url, params);

            const MAX_ATTEMPTS = 3;
            let resp;
            for (let attempt = 1; ; attempt++) {
                try {
                    resp = await axios.get(url, {
                        params: fullParams,
                        timeout: 20000,
                    });
                    break;
                } catch (err: any) {
                    if (attempt >= MAX_ATTEMPTS || !TMDBClient.isTransient(err))
                        throw err;
                    console.warn(
                        `TMDB ${err.code} on ${pathRoute}, retry ${attempt}/${MAX_ATTEMPTS - 1}`
                    );
                    await new Promise((r) => setTimeout(r, 250 * attempt));
                }
            }

            return resp.data;
        } catch (error: any) {
            // Log the shape, not the object: an axios error carries `config`,
            // whose params include the TMDB api_key.
            console.error(
                'TMDB request failed:',
                pathRoute,
                error?.response?.status ?? error?.code ?? error?.message
            );
            throw error;
        }
    }

    async searchMulti(query: string, page = 1) {
        const key = this.cacheKey(`search:${query}:p:${page}`);
        return this.getCached(key, () =>
            this.request('/search/multi', { query, page }),
        );
    }

    async getDetails(
        mediaType: 'movie' | 'tv',
        id: string | number,
        append = 'credits,videos',
    ) {
        const safeAppend = sanitizeAppendToResponse(append);
        // Include the append set in the key so different append requests don't
        // collide / serve stale partial data from a leaner earlier fetch.
        const key = this.cacheKey(`${mediaType}:${id}:details:${safeAppend}`);
        return this.getCached(key, () =>
            this.request(`/${mediaType}/${id}`, {
                append_to_response: safeAppend,
            }),
        );
    }

    async getPopular(mediaType: 'movie' | 'tv', page = 1) {
        const key = this.cacheKey(`${mediaType}:popular:p:${page}`);
        return this.getCached(key, () =>
            this.request(`/${mediaType}/popular`, { page }),
        );
    }

    // Expose a direct request in case controller needs a specific endpoint
    async raw(path: string, params: QueryParams = {}, ttlSeconds?: number) {
        try {
            const key = this.cacheKey(`raw:${path}:${JSON.stringify(params)}`);

            return this.getCached(
                key,
                () => this.request(path, params),
                ttlSeconds,
            );
        } catch (error: any) {
            console.error(
                'TMDB raw request failed:',
                path,
                error?.response?.status ?? error?.code ?? error?.message
            );
            throw error;
        }
    }

    // Optional: a method to invalidate keys (useful when you cache derived data)
    async invalidateKey(keyPattern: string) {
        // naive pattern scan - in production prefer Redis SCAN with cursors and safer removal
        const keys = await redisClient.keys(keyPattern);
        if (keys.length) await redisClient.del(...keys);
    }
}

/**
 * One-shot credential check, run at boot.
 *
 * Config validation only proves TMDB_API_KEY is *present*. A wrong key still
 * boots cleanly and then fails every upstream call — and because the composite
 * endpoints degrade with Promise.allSettled, the symptom is a 200 with empty
 * rows. That looks like "the app is broken" with nothing in the logs pointing
 * at the cause, so name it explicitly here.
 *
 * Deliberately non-fatal: TMDB being unreachable for a moment at startup is not
 * a reason to refuse to serve cached data and the community endpoints.
 */
export async function verifyTmdbCredentials(): Promise<void> {
    try {
        await axios.get(`${TMDB_BASE}/configuration`, {
            params: { api_key: TMDB_API_KEY },
            timeout: 10_000,
        });
        console.log('TMDB API key accepted');
    } catch (err: any) {
        const status = err?.response?.status;
        if (status === 401) {
            console.error(
                '\n*** TMDB REJECTED THE API KEY (401) ***\n' +
                    '    Catalogue pages will render empty until this is fixed.\n' +
                    '    Set a valid TMDB_API_KEY (the v3 key from\n' +
                    '    https://www.themoviedb.org/settings/api) and restart.\n'
            );
        } else {
            console.warn(
                'TMDB reachability check failed (continuing anyway):',
                status ?? err?.code ?? err?.message
            );
        }
    }
}

// Export a singleton
export const tmdbClient = new TMDBClient();
