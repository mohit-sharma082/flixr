import { Router } from 'express';
import {
    searchPeople,
    getPersonDetails,
    getPersonCredits,
    getPersonImages,
    getPersonExternalIds,
    getPopularPeople,
} from '../controllers/people.controller';

const router = Router();

/**
 * Base path: /api/people
 */

// Search
router.get('/search', searchPeople);

// Popular people
router.get('/popular', getPopularPeople);

// Person details
router.get('/:id', getPersonDetails);

// Person credits (movies + tv)
router.get('/:id/credits', getPersonCredits);

// Person images
router.get('/:id/images', getPersonImages);

// External IDs (IMDb, socials)
router.get('/:id/external', getPersonExternalIds);

export default router;
