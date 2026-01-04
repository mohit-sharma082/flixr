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

export const getHomePageData = async (req: Request, res: Response) => {
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

    const arr = [
        () => TMDB_ROUTES.trending.movie('week'),
        () => TMDB_ROUTES.trending.tv('week'),
        TMDB_ROUTES.movies.nowPlaying,
        TMDB_ROUTES.movies.popular,
        TMDB_ROUTES.movies.topRated,
        TMDB_ROUTES.movies.upcoming,
        TMDB_ROUTES.tv.airingToday,
        TMDB_ROUTES.tv.popular,
        TMDB_ROUTES.tv.topRated,
        TMDB_ROUTES.tv.onTheAir,

        TMDB_ROUTES.genres.movie,
        TMDB_ROUTES.genres.tv,
    ];
    const results = await Promise.allSettled(
        arr.map((route) =>
            tmdbClient.raw(route(), { page: 1, adult: false }, high_ttl)
        )
    );

    const responseData: any = {
        movies: {},
        tv: {},
        genres: {
            movies: [],
            tv: [],
        },
    };

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            switch (index) {
                case 0:
                    responseData.movies.trending =
                        result.value?.results ?? result.value;
                    break;
                case 1:
                    responseData.tv.trending =
                        result.value?.results ?? result.value;
                    break;
                case 2:
                    responseData.movies.nowPlaying =
                        result.value?.results ?? result.value;
                    break;
                case 3:
                    responseData.movies.popular =
                        result.value?.results ?? result.value;
                    break;
                case 4:
                    responseData.movies.topRated =
                        result.value?.results ?? result.value;
                    break;
                case 5:
                    responseData.movies.upcoming =
                        result.value?.results ?? result.value;
                    break;
                case 6:
                    responseData.tv.airingToday =
                        result.value?.results ?? result.value;
                    break;
                case 7:
                    responseData.tv.popular =
                        result.value?.results ?? result.value;
                    break;
                case 8:
                    responseData.tv.topRated =
                        result.value?.results ?? result.value;
                    break;
                case 9:
                    responseData.tv.onTheAir =
                        result.value?.results ?? result.value;
                    break;
                case 10:
                    responseData.genres.movies = result.value?.genres ?? [];
                    break;
                case 11:
                    responseData.genres.tv = result.value?.genres ?? [];
                    break;
            }
        }
    });

    return res.json({
        data: responseData,
    });
};

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

export const getGenres = async (req: Request, res: Response) => {
    const [movieGenresRes, tvGenresRes] = await Promise.allSettled([
        tmdbClient.raw(TMDB_ROUTES.genres.movie(), {}, high_ttl),
        tmdbClient.raw(TMDB_ROUTES.genres.tv(), {}, high_ttl),
    ]);

    const movieGenres =
        movieGenresRes.status === 'fulfilled'
            ? movieGenresRes.value.genres
            : [];
    const tvGenres =
        tvGenresRes.status === 'fulfilled' ? tvGenresRes.value.genres : [];

    return res.json({
        data: {
            genres: {
                movies: movieGenres,
                tv: tvGenres,
            },
        },
    });
};
