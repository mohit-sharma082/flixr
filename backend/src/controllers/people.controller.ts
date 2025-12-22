import { Request, Response, NextFunction } from 'express';
import { tmdbClient } from '../services/tmdbClient';

/**
 * GET /api/people/search
 * Search people by name
 * Query params:
 *  - q (string, required)
 *  - page (number, optional)
 */
export const searchPeople = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { q, page = 1 } = req.query;

        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                message: 'Query parameter "q" is required',
            });
        }

        const data = await tmdbClient.raw('/search/person', {
            query: q,
            page: Number(page),
        });

        return res.json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/people/:id
 * Get person details
 * Optional query:
 *  - append (comma separated append_to_response)
 */
export const getPersonDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;
        const { append = 'combined_credits,images,external_ids' } = req.query;

        if (!id) {
            return res.status(400).json({
                message: 'Person ID is required',
            });
        }

        const data = await tmdbClient.raw(`/person/${id}`, {
            append_to_response: append,
        });

        return res.json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/people/:id/credits
 * Get combined movie + tv credits
 */
export const getPersonCredits = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const data = await tmdbClient.raw(`/person/${id}/combined_credits`);

        return res.json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/people/:id/images
 * Get profile images of a person
 */
export const getPersonImages = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const data = await tmdbClient.raw(`/person/${id}/images`);

        return res.json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/people/:id/external
 * Get external IDs (IMDb, Instagram, Twitter, etc.)
 */
export const getPersonExternalIds = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        const data = await tmdbClient.raw(`/person/${id}/external_ids`);

        return res.json(data);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/people/popular
 * Get popular people
 * Query params:
 *  - page (number, optional)
 */
export const getPopularPeople = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { page = 1 } = req.query;

        const data = await tmdbClient.raw('/person/popular', {
            page: Number(page),
        });

        return res.json(data);
    } catch (error) {
        next(error);
    }
};
