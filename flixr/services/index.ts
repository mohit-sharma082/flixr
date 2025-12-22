import axios from 'axios';

const API_PREFIX = '/api';

const baseURL = 'http://192.168.81.126:4000';

const BASE_ROUTES = [
    'auth',
    'movies',
    'tv',
    'reviews',
    'comments',
    'common',
] as const;

export const ROUTES = {
    // Auth
    auth: {
        login: `/auth/login`,
        register: `/auth/register`,
        me: `/auth/me`,
    },

    // Movies
    movies: {
        popular: (page = 1) => `/movies/popular?page=${page}`,
        topRated: (page = 1) => `/movies/top_rated?page=${page}`,
        nowPlaying: (page = 1) => `/movies/now_playing?page=${page}`,
        upcoming: (page = 1) => `/movies/upcoming?page=${page}`,
        details: (id: number | string, append?: string) =>
            `/movies/${id}${
                append ? `?append=${encodeURIComponent(append)}` : ''
            }`,
        images: (id: number | string) => `/movies/${id}/images`,
        search: (q: string, page = 1) =>
            `/common/search?q=${encodeURIComponent(q)}&page=${page}`,
    },

    // TV
    tv: {
        popular: (page = 1) => `/tv/popular?page=${page}`,
        details: (id: number | string, append?: string) =>
            `/tv/${id}${append ? `?append=${encodeURIComponent(append)}` : ''}`,
        images: (id: number | string) => `/tv/${id}/images`,
        search: (q: string, page = 1) =>
            `/common/search?q=${encodeURIComponent(q)}&page=${page}`,
    },

    // Reviews & Comments
    reviews: {
        crud: `/reviews`, // POST, GET (list), PUT, DELETE depending on body/params
        byTmdbMovie: (id: number | string) => `/reviews/tmdb/movie/${id}`,
        byUser: (userId: string) =>
            `/reviews?userId=${encodeURIComponent(userId)}`,
    },

    comments: {
        base: `/comments`,
        byMedia: (mediaType: 'movie' | 'tv', tmdbId: number | string) =>
            `/comments/media/${mediaType}/${tmdbId}`,
        byReview: (reviewId: string) => `/comments/review/${reviewId}`,
    },

    // Common / utilities
    common: {
        root: `/common`,
        trending: `/common/trending`,
        searchMulti: (q: string, page = 1) =>
            `/common/search?q=${encodeURIComponent(q)}&page=${page}`,
    },
} as const;

export const api = axios.create({
    baseURL: (baseURL || 'http://localhost:4000') + API_PREFIX,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    try {
    } catch {
        console.log('ERROR - calling url : ', JSON.stringify({ config }, null, 4));
        // ignore
    }
    return config;
});
