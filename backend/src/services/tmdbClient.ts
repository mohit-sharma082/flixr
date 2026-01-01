import axios from 'axios';
import { redisClient } from '../cache/redisClient';

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE = process.env.TMDB_BASE || 'https://api.themoviedb.org/3';
const CACHE_TTL = +(process.env.CACHE_TTL_SECONDS || 3600); // default 1 hour

type QueryParams = Record<string, any>;

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
            episodeNumber: number | string
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
        movieList: () => `/genre/movie/list`,
        tvList: () => `/genre/tv/list`,
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
            externalId
        )}?external_source=${encodeURIComponent(externalSource)}`,
} as const;

export class TMDBClient {
    private baseUrl: string;
    private apiKey: string;

    constructor(baseUrl = TMDB_BASE, apiKey = TMDB_API_KEY) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    private cacheKey(prefix: string) {
        return `tmdb:${prefix}`;
    }

    private async getCached<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds?: number // for some cases we might want different TTL
    ): Promise<T> {
        const cached = await redisClient.get(key);
        if (cached) return JSON.parse(cached) as T;
        const result = await fetcher();
        // setex requires seconds TTL,
        const ttl = ttlSeconds
            ? ttlSeconds < 60
                ? 60
                : ttlSeconds
            : CACHE_TTL;
        await redisClient.setex(key, ttl, JSON.stringify(result));
        return result;
    }

    private async request(path: string, params: QueryParams = {}) {
        try {
            const url = `${this.baseUrl}${path}`;
            console.log('TMDB Request URL: ', url, params);
            const resp = await axios.get(url, {
                params: { ...params, api_key: this.apiKey, adult: false },
            });

            return resp.data;
        } catch (error: any) {
            console.log('TMDB request error: ', error?.message ?? error);
            throw error;
        }
    }

    async searchMulti(query: string, page = 1) {
        const key = this.cacheKey(`search:${query}:p:${page}`);
        return this.getCached(key, () =>
            this.request('/search/multi', { query, page })
        );
    }

    async getDetails(
        mediaType: 'movie' | 'tv',
        id: string | number,
        append = 'credits,videos'
    ) {
        const key = this.cacheKey(`${mediaType}:${id}:details`);
        return this.getCached(key, () =>
            this.request(`/${mediaType}/${id}`, { append_to_response: append })
        );
    }

    async getPopular(mediaType: 'movie' | 'tv', page = 1) {
        const key = this.cacheKey(`${mediaType}:popular:p:${page}`);
        return this.getCached(key, () =>
            this.request(`/${mediaType}/popular`, { page })
        );
    }

    // Expose a direct request in case controller needs a specific endpoint
    async raw(path: string, params: QueryParams = {}, ttlSeconds?: number) {
        try {
            // console.log('TMDB Raw Request Path: ', path, params);
            const key = this.cacheKey(`raw:${path}:${JSON.stringify(params)}`);
            return this.getCached(
                key,
                () => this.request(path, params),
                ttlSeconds
            );
        } catch (error) {
            console.log('TMDB raw request error: ', error);
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

// Export a singleton
export const tmdbClient = new TMDBClient();
