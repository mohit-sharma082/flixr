import { Request, Response } from 'express';
import { TMDB_ROUTES, tmdbClient } from '../services/tmdbClient';

/**
 * Common controller - exposes common (movie and tv) related endpoints
 *
 * Endpoints implemented:
 * - GET /search?q=&page=
 */

function parsePage(q: any) {
    const p = +(q || 1);
    return Number.isFinite(p) && p > 0 ? p : 1;
}

export const search = async (req: Request, res: Response) => {
    const q = (req.query.q || '').toString().trim();
    if (!q) return res.status(400).json({ error: 'Missing q param' });
    const page = parsePage(req.query.page);
    const data = await tmdbClient.searchMulti(q, page);
    return res.json(data);
};

export const trending = async (req: Request, res: Response) => {
    const page = parsePage(req.query.page);
    const timeWindow: 'day' | 'week' =
        req.query.time_window === 'day' ? 'day' : 'week';

    const [movies, tvs] = await Promise.allSettled([
        tmdbClient.raw(TMDB_ROUTES.trending.movie(timeWindow), { page }),
        tmdbClient.raw(TMDB_ROUTES.trending.tv(timeWindow), { page }),
    ]);
    return res.json({
        data: {
            movies: movies.status === 'fulfilled' ? movies.value : null,
            tvs: tvs.status === 'fulfilled' ? tvs.value : null,
        },
    });
};
