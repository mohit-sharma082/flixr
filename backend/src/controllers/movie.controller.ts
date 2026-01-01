import { Request, Response } from 'express';
import { TMDB_ROUTES, tmdbClient } from '../services/tmdbClient';
import Review from '../models/Review';
import mongoose from 'mongoose';

/**
 * Movies controller - exposes commonly used TMDB movie endpoints plus
 * an aggregate endpoint that merges TMDB details with community reviews.
 *
 * Endpoints implemented:
 * - GET /search?q=&page=
 * - GET /popular?page=
 * - GET /top_rated?page=
 * - GET /now_playing?page=
 * - GET /upcoming?page=
 * - GET /trending/:time_window(day|week)?page=
 * - GET /discover?page=&sort_by=&year=&with_genres=&vote_average.gte=...
 * - GET /genres
 * - GET /:id (append_to_response optional)
 * - GET /:id/credits
 * - GET /:id/videos
 * - GET /:id/reviews?page=
 * - GET /:id/recommendations?page=
 * - GET /:id/similar?page=
 * - GET /:id/external_ids
 * - GET /:id/images
 * - GET /:id/aggregate  -> TMDB details + community rating + sample reviews
 */

const ROUTES = TMDB_ROUTES.movies;

function parsePage(q: any) {
    const p = +(q || 1);
    return Number.isFinite(p) && p > 0 ? p : 1;
}

export const search = async (req: Request, res: Response) => {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.status(400).json({ error: 'Missing q param' });
    const page = parsePage(req.query.page);
    // Use TMDB multi-search or /search/movie depending on desired scope
    const data = await tmdbClient.raw(ROUTES.search(), { query: q, page });
    return res.json(data);
};

export const popular = async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const data = await tmdbClient.getPopular('movie', page);
    return res.json(data);
};

export const topRated = async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const data = await tmdbClient.raw('/movie/top_rated', { page });
    return res.json(data);
};

export const nowPlaying = async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const data = await tmdbClient.raw('/movie/now_playing', { page });
    return res.json(data);
};

export const upcoming = async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const data = await tmdbClient.raw('/movie/upcoming', { page });
    return res.json(data);
};

export const trending = async (req: Request, res: Response) => {
    // /trending/movie/{time_window} where time_window is day or week
    const timeWindow = (req.params.time_window || 'day').toString();
    if (!['day', 'week'].includes(timeWindow))
        return res
            .status(400)
            .json({ error: 'time_window must be day or week' });
    const page = parsePage(req.query.page);
    const data = await tmdbClient.raw(`/trending/movie/${timeWindow}`, {
        page,
    });
    return res.json(data);
};

export const discover = async (req: Request, res: Response) => {
    // Forward common discover filters to TMDB (validate/whitelist as needed)
    const page = parsePage(req.query.page);
    const allowed: Record<string, any> = {
        sort_by: req.query.sort_by,
        with_genres: req.query.with_genres,
        year: req.query.year,
        'vote_average.gte': req.query['vote_average.gte'],
        primary_release_year: req.query.primary_release_year,
        with_keywords: req.query.with_keywords,
        page,
    };

    // Remove undefined keys
    const params: Record<string, any> = {};
    Object.entries(allowed).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '')
            params[k] = v;
    });

    const data = await tmdbClient.raw('/discover/movie', params);
    return res.json(data);
};

export const genres = async (_req: Request, res: Response) => {
    // TMDB: /genre/movie/list
    const data = await tmdbClient.raw('/genre/movie/list', {});
    return res.json(data);
};

export const details = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing movie id' });
    const append = (req.query.append as string) || 'credits,videos,images';

    const [movie, reviews] = await Promise.allSettled([
        tmdbClient.getDetails('movie', id, append),
        tmdbClient.raw(ROUTES.reviews(id), { page: 1 }),
    ]);

    return res.json({
        movie: movie.status === 'fulfilled' ? movie.value : null,
        reviews: reviews.status === 'fulfilled' ? reviews.value : null,
    });
};

export const tmdbReviews = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parsePage(req.query.page) ?? 1;
    const data = await tmdbClient.raw(ROUTES.reviews(id), { page });
    return res.json(data);
}

export const credits = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/movie/${id}/credits`, {});
    return res.json(data);
};

export const videos = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/movie/${id}/videos`, {});
    return res.json(data);
};

export const recommendations = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parsePage(req.query.page);
    const data = await tmdbClient.raw(`/movie/${id}/recommendations`, { page });
    return res.json(data);
};

export const similar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = parsePage(req.query.page);
    const data = await tmdbClient.raw(`/movie/${id}/similar`, { page });
    return res.json(data);
};

export const externalIds = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/movie/${id}/external_ids`, {});
    return res.json(data);
};

export const images = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/movie/${id}/images`, {});
    return res.json(data);
};

/**
 * Aggregate endpoint:
 * Returns:
 *  - tmdb: TMDB movie details (append_to_response allowed)
 *  - community: { avgRating, reviewCount, reviews: [ ...sample ] }
 *
 * Cache behavior: TMDB details are cached by tmdbClient. Community part is read from Mongo each call.
 * If you want to cache aggregate results in Redis, we can add that next.
 */
export const aggregate = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing movie id' });

    // Validate id is numeric (TMDB ids are numbers)
    if (!/^\d+$/.test(id))
        return res.status(400).json({ error: 'Invalid movie id' });

    // TMDB details
    const append = (req.query.append as string) || 'credits,videos,images';
    const tmdb = await tmdbClient.getDetails('movie', id, append);

    // Aggregate community reviews from Mongo
    // Calculate average rating and review count, include latest 10 reviews
    // Using Mongo aggregation for avg
    const movieIdNum = +id;
    const agg = await Review.aggregate([
        { $match: { tmdbId: movieIdNum, mediaType: 'movie' } },
        {
            $group: {
                _id: '$tmdbId',
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 },
            },
        },
    ]).exec();

    const stats =
        agg && agg.length
            ? {
                  avgRating: +(agg[0].avgRating || 0).toFixed(2),
                  reviewCount: agg[0].count,
              }
            : { avgRating: 0, reviewCount: 0 };

    // Fetch sample reviews (populate user name and email minimally)
    const sampleReviews = await Review.find({
        tmdbId: movieIdNum,
        mediaType: 'movie',
    })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('user', 'name email')
        .lean()
        .exec();

    return res.json({
        tmdb,
        community: {
            avgRating: stats.avgRating,
            reviewCount: stats.reviewCount,
            reviews: sampleReviews,
        },
    });
};

/**
 * Admin/utility endpoint suggestion (not wired by default):
 * - purge cache keys related to this movie (tmdbClient.invalidateKey can be used)
 * e.g. await tmdbClient.invalidateKey(`tmdb:movie:${id}*`)
 */
