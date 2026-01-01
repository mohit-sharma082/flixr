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

// using high ttl for data such as trending which doesn't change often
const high_ttl = 43_200; // 12 hours

/**
 * 
 * 
 * For reference

Airing Today

On The Air

Popular

Top Rated


 */

export const getHomePageData= async (req: Request, res: Response) => {

    // one page of trending movies 
    // one page of trending tv shows 

    // one page of now playing movies
    // one page of popular movies
    // one page of top rated movies
    // one page of upcoming movies

    // one page of airing today tv shows
    // one page of popular tv shows
    // one page of top rated tv shows
    // one page of on the air tv shows

    // const arr 

    const [trendingMovies, trendingTvs] = await Promise.allSettled([
        tmdbClient.raw(
            TMDB_ROUTES.trending.movie('week'),
            { page: 1 },
            high_ttl
        ),
        tmdbClient.raw(
            TMDB_ROUTES.trending.tv('week'),
            { page: 1 },
            high_ttl
        ),
    ]);
}

export const trending = async (req: Request, res: Response) => {
    // const page = parsePage(req.query.page);
    const timeWindow: 'day' | 'week' =
        req.query.time_window === 'day' ? 'day' : 'week';

    const [movies1, movies2, tvs1, tvs2] = await Promise.allSettled([
        tmdbClient.raw(
            TMDB_ROUTES.trending.movie(timeWindow),
            { page: 1 },
            high_ttl
        ),
        tmdbClient.raw(
            TMDB_ROUTES.trending.movie(timeWindow),
            { page: 2 },
            high_ttl
        ),
        tmdbClient.raw(
            TMDB_ROUTES.trending.tv(timeWindow),
            { page: 1 },
            high_ttl
        ),
        tmdbClient.raw(
            TMDB_ROUTES.trending.tv(timeWindow),
            { page: 2 },
            high_ttl
        ),
    ]);

    const allMovies: any = { results: [] };
    if (movies1.status === 'fulfilled')
        allMovies.results.push(...movies1.value.results);
    if (movies2.status === 'fulfilled')
        allMovies.results.push(...movies2.value.results);
    const allTvs: any = { results: [] };
    if (tvs1.status === 'fulfilled') allTvs.results.push(...tvs1.value.results);
    if (tvs2.status === 'fulfilled') allTvs.results.push(...tvs2.value.results);

    return res.json({
        data: {
            movies: allMovies,
            tvs: allTvs,
        },
    });
};
