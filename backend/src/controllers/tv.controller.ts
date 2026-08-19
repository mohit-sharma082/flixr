import { Request, Response } from 'express';
import {
    TMDB_ROUTES,
    tmdbClient,
    clampPage,
    sanitizeAppendToResponse,
} from '../services/tmdbClient';
import { buildDiscoverParams } from '../utils/discoverParams';

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
    const page = clampPage(req.query.page);
    if (!q) return res.status(400).json({ error: 'Missing q param' });

    // Use multi-search so results include persons / movies / tv; you can switch to /search/tv if you want only tv
    const result = await tmdbClient.searchMulti(q, page);
    return res.json(result);
};

export const popular = async (req: Request, res: Response) => {
    const page = clampPage(req.query.page);
    const data = await tmdbClient.getPopular('tv', page);
    return res.json(data);
};

export const topRated = async (req: Request, res: Response) => {
    const page = clampPage(req.query.page);
    // TMDB endpoint is /tv/top_rated
    const data = await tmdbClient.raw('/tv/top_rated', { page });
    return res.json(data);
};

export const airingToday = async (req: Request, res: Response) => {
    const page = clampPage(req.query.page);
    const data = await tmdbClient.raw('/tv/airing_today', { page });
    return res.json(data);
};

export const onTheAir = async (req: Request, res: Response) => {
    const page = clampPage(req.query.page);
    const data = await tmdbClient.raw('/tv/on_the_air', { page });
    return res.json(data);
};

export const discover = async (req: Request, res: Response) => {
    const params = buildDiscoverParams(req, 'tv');
    const data = await tmdbClient.raw('/discover/tv', params);
    return res.json(data);
};

export const genres = async (_req: Request, res: Response) => {
    const data = await tmdbClient.raw('/genre/tv/list', {});
    return res.json(data);
};

export const details = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    // TMDB ids are numeric; reject junk here instead of forwarding it upstream.
    if (!/^\d+$/.test(id ?? ''))
        return res.status(400).json({ error: 'Invalid tv id' });

    // Append useful info by default
    const append =
        (req.query.append as string) ||
        'credits,videos,images,recommendations,similar,keywords,external_ids,content_ratings';
    const [details, reviews] = await Promise.allSettled([
        tmdbClient.getDetails('tv', id, append),
        tmdbClient.raw(TMDB_ROUTES.tv.reviews(id)),
    ]);

    // The show is the page; if TMDB can't give it to us, say so rather than
    // returning 200 with a null body (which reads as success to every client).
    // Distinguish "no such title" from "upstream is broken": collapsing both
    // into 404 makes a rejected API key or a TMDB outage look like a catalogue
    // gap on every single title page.
    if (details.status !== 'fulfilled') {
        const status = (details.reason as any)?.response?.status;
        if (status === 404)
            return res.status(404).json({ error: 'Show not found' });
        return res
            .status(502)
            .json({ error: 'Upstream catalogue request failed' });
    }

    // Reviews are supplementary — a failure there degrades, it doesn't 404.
    return res.json({
        show: details.value,
        reviews: reviews.status === 'fulfilled' ? reviews.value : null,
    });
};

export const recommendations = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = clampPage(req.query.page);
    const data = await tmdbClient.raw(`/tv/${id}/recommendations`, { page });
    return res.json(data);
};

export const similar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const page = clampPage(req.query.page);
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

export const watchProviders = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    // TMDB /watch/providers returns JustWatch-sourced legal availability by region:
    // { id, results: { US: { link, flatrate?, rent?, buy? }, ... } }
    const data = await tmdbClient.raw(TMDB_ROUTES.tv.watchProviders(id));
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

    const append =
        sanitizeAppendToResponse(req.query.append) || 'credits';
    const data = await tmdbClient.raw(`/tv/${id}/season/${season_number}`, {
        append_to_response: append,
    });
    return res.json(data);
};
