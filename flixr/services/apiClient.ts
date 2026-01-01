import { ROUTES, api } from './index';
import type { Movie, ImageResponse, Review, TVShow } from '../lib/interfaces';

export const moviesApi = {
    popular: (page = 1) =>
        api
            .get<{ results: Movie[] }>(ROUTES.movies.popular(page))
            .then((r) => r.data),
    details: (id: number | string, append?: string) =>
        api
            .get<{ movie: Movie }>(
                `/movies/${id}${append ? `?append=${append}` : ''}`
            )
            .then((r) => r.data),
    images: (id: number | string) =>
        api.get<ImageResponse>(ROUTES.movies.images(id)).then((r) => r.data),
    search: (q: string, page = 1) =>
        api
            .get<{ results: Movie[] }>(ROUTES.movies.search(q, page))
            .then((r) => r.data),
};

export const tvApi = {
    popular: (page = 1) =>
        api
            .get<{ results: TVShow[] }>(ROUTES.tv.popular(page))
            .then((r) => r.data),
    details: (id: number | string, append?: string) =>
        api
            .get<{ show: TVShow }>(ROUTES.tv.details(id, append))
            .then((r) => r.data),
    images: (id: number | string) =>
        api.get<ImageResponse>(ROUTES.tv.images(id)).then((r) => r.data),
    search: (q: string, page = 1) =>
        api.get(ROUTES.tv.search(q, page)).then((r) => r.data),
};

export const authApi = {
    login: (payload: { email: string; password: string }) =>
        api.post(ROUTES.auth.login, payload).then((r) => r.data),
    register: (payload: { name?: string; email: string; password: string }) =>
        api.post(ROUTES.auth.register, payload).then((r) => r.data),
    me: () => api.get(ROUTES.auth.me).then((r) => r.data),
};

export const reviewsApi = {
    post: (payload: any) =>
        api.post(ROUTES.reviews.crud, payload).then((r) => r.data),
    listByMovie: (tmdbId: number | string) =>
        api.get(ROUTES.reviews.byTmdbMovie(tmdbId)).then((r) => r.data),
    listByUser: (userId: string) =>
        api.get(ROUTES.reviews.byUser(userId)).then((r) => r.data),
};

export const commentsApi = {
    create: (payload: any) =>
        api.post(ROUTES.comments.base, payload).then((r) => r.data),
    listByMedia: (mediaType: 'movie' | 'tv', tmdbId: number | string) =>
        api.get(ROUTES.comments.byMedia(mediaType, tmdbId)).then((r) => r.data),
    listByReview: (reviewId: string) =>
        api.get(ROUTES.comments.byReview(reviewId)).then((r) => r.data),
};
