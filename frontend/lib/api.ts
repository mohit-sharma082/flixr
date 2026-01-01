// src/lib/api.ts
import axios, { AxiosInstance } from 'axios';
import { store } from '../store';

// src/lib/endpoints.ts
export const API_PREFIX = '/api';

export const ROUTES = {
    // Auth
    auth: {
        login: `${API_PREFIX}/auth/login`,
        register: `${API_PREFIX}/auth/register`,
        me: `${API_PREFIX}/auth/me`,
    },

    // Movies
    movies: {
        popular: (page = 1) => `${API_PREFIX}/movies/popular?page=${page}`,
        topRated: (page = 1) => `${API_PREFIX}/movies/top_rated?page=${page}`,
        nowPlaying: (page = 1) =>
            `${API_PREFIX}/movies/now_playing?page=${page}`,
        upcoming: (page = 1) => `${API_PREFIX}/movies/upcoming?page=${page}`,
        details: (id: number | string, append?: string) =>
            `${API_PREFIX}/movies/${id}${
                append ? `?append=${encodeURIComponent(append)}` : ''
            }`,
        images: (id: number | string) => `${API_PREFIX}/movies/${id}/images`,
        search: (q: string, page = 1) =>
            `${API_PREFIX}/common/search?q=${encodeURIComponent(
                q
            )}&page=${page}`,
    },

    // TV
    tv: {
        popular: (page = 1) => `${API_PREFIX}/tv/popular?page=${page}`,
        details: (id: number | string, append?: string) =>
            `${API_PREFIX}/tv/${id}${
                append ? `?append=${encodeURIComponent(append)}` : ''
            }`,
        images: (id: number | string) => `${API_PREFIX}/tv/${id}/images`,
        search: (q: string, page = 1) =>
            `${API_PREFIX}/common/search?q=${encodeURIComponent(
                q
            )}&page=${page}`,
    },

    // Reviews & Comments
    reviews: {
        crud: `${API_PREFIX}/reviews`, // POST, GET (list), PUT, DELETE depending on body/params
        byTmdbMovie: (id: number | string) =>
            `${API_PREFIX}/reviews/tmdb/movie/${id}`,
        byUser: (userId: string) =>
            `${API_PREFIX}/reviews?userId=${encodeURIComponent(userId)}`,
    },

    comments: {
        base: `${API_PREFIX}/comments`,
        byMedia: (mediaType: 'movie' | 'tv', tmdbId: number | string) =>
            `${API_PREFIX}/comments/media/${mediaType}/${tmdbId}`,
        byReview: (reviewId: string) =>
            `${API_PREFIX}/comments/review/${reviewId}`,
    },

    // Common / utilities
    common: {
        searchMulti: (q: string, page = 1) =>
            `${API_PREFIX}/common/search?q=${encodeURIComponent(
                q
            )}`,
    },
} as const;

export const createApi = (baseURL?: string): AxiosInstance => {
    const api = axios.create({
        baseURL:
            baseURL ||
            process.env.NEXT_PUBLIC_API_URL ||
            'http://localhost:4000',
        timeout: 10000,
    });

    // Attach token at request time using store.getState() so this is safe to import in client modules
    api.interceptors.request.use((config) => {
        try {
            const state = store.getState();
            const token = state?.auth?.token;
            if (token) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch {
            // ignore
        }
        return config;
    });

    api.interceptors.response.use(
        (r) => r,
        (err) => {
            // Optional: normalize axios errors for your UI
            return Promise.reject(err);
        }
    );

    return api;
};

// server-side factory: NO Redux/store access, safe to use in Server Components
export const createServerApi = (baseURL?: string): AxiosInstance => {
    const api = axios.create({
        baseURL:
            baseURL ||
            process.env.NEXT_PUBLIC_API_URL ||
            'http://localhost:4000',
        timeout: 10000,
    });

    // Optional: add server-only interceptors (e.g., trace headers) but DO NOT read browser stores
    return api;
};
