import { Request, Response } from 'express';
import { TMDB_ROUTES, tmdbClient } from '../services/tmdbClient';

/**
 * TV controllers - thin logic, delegate TMDB fetch + caching to tmdbClient.
 *
 * Endpoints implemented:
 * - GET /search?q=...            -> searchMulti (multi-search)
 * - GET /popular?page=...        -> /tv/popular
 * - GET /top_rated?page=...     -> /tv/top_rated
 * - GET /airing_today?page=...  -> /tv/airing_today
 * - GET /on_the_air?page=...    -> /tv/on_the_air
 * - GET /:id                    -> /tv/{id} (append credits,videos,recommendations)
 * - GET /:id/recommendations
 * - GET /:id/similar
 * - GET /:id/credits
 * - GET /:id/videos
 * - GET /:id/external_ids
 * - GET /:id/season/:season_number
 */

export const search = async (req: Request, res: Response) => {
    const q = (req.query.q || '').toString();
    const page = +(req.query.page || 1);
    if (!q) return res.status(400).json({ error: 'Missing q param' });

    // Use multi-search so results include persons / movies / tv; you can switch to /search/tv if you want only tv
    const result = await tmdbClient.searchMulti(q, page);
    return res.json(result);
};

export const popular = async (req: Request, res: Response) => {
    const page = +(req.query.page || 1);
    const data = await tmdbClient.getPopular('tv', page);
    return res.json(data);
};

export const topRated = async (req: Request, res: Response) => {
    const page = +(req.query.page || 1);
    // TMDB endpoint is /tv/top_rated
    const data = await tmdbClient.raw('/tv/top_rated', { page });
    return res.json(data);
};

export const airingToday = async (req: Request, res: Response) => {
    const page = +(req.query.page || 1);
    const data = await tmdbClient.raw('/tv/airing_today', { page });
    return res.json(data);
};

export const onTheAir = async (req: Request, res: Response) => {
    const page = +(req.query.page || 1);
    const data = await tmdbClient.raw('/tv/on_the_air', { page });
    return res.json(data);
};

export const details = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Missing tv id' });

    // Append useful info by default
    const append =
        (req.query.append as string) ||
        'credits,videos,recommendations,external_ids';
    const [details, reviews] = await Promise.allSettled([
        tmdbClient.getDetails('tv', id, append),
        tmdbClient.raw(TMDB_ROUTES.tv.reviews(id)),
    ]);
    return res.json({
        show: details.status === 'fulfilled' ? details.value : null,
        reviews: reviews.status === 'fulfilled' ? reviews.value : null,
    });
};

export const recommendations = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = +(req.query.page || 1);
    const data = await tmdbClient.raw(`/tv/${id}/recommendations`, { page });
    return res.json(data);
};

export const similar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = +(req.query.page || 1);
    const data = await tmdbClient.raw(`/tv/${id}/similar`, { page });
    return res.json(data);
};

export const credits = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/tv/${id}/credits`);
    return res.json(data);
};

export const videos = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/tv/${id}/videos`);
    return res.json(data);
};

export const externalIds = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await tmdbClient.raw(`/tv/${id}/external_ids`);
    return res.json(data);
};

export const seasonDetails = async (req: Request, res: Response) => {
    const { id, season_number } = req.params;
    if (!season_number)
        return res.status(400).json({ error: 'Missing season number' });

    const append = (req.query.append as string) || 'credits';
    const data = await tmdbClient.raw(`/tv/${id}/season/${season_number}`, {
        append_to_response: append,
    });
    return res.json(data);
};
