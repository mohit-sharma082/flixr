import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as tvCtrl from '../controllers/tv.controller';

const router = Router();

/**
 * TV routes
 * - /api/tv/search?q=...
 * - /api/tv/popular
 * - /api/tv/top_rated
 * - /api/tv/on_the_air
 * - /api/tv/airing_today
 * - /api/tv/:id
 * - /api/tv/:id/recommendations
 * - /api/tv/:id/similar
 * - /api/tv/:id/credits
 * - /api/tv/:id/videos
 * - /api/tv/:id/external_ids
 * - /api/tv/:id/season/:season_number
 */

router.get('/search', asyncHandler(tvCtrl.search));
router.get('/popular', asyncHandler(tvCtrl.popular));
router.get('/top_rated', asyncHandler(tvCtrl.topRated));
router.get('/on_the_air', asyncHandler(tvCtrl.onTheAir));
router.get('/airing_today', asyncHandler(tvCtrl.airingToday));

router.get('/:id', asyncHandler(tvCtrl.details));
router.get('/:id/recommendations', asyncHandler(tvCtrl.recommendations));
router.get('/:id/similar', asyncHandler(tvCtrl.similar));
router.get('/:id/credits', asyncHandler(tvCtrl.credits));
router.get('/:id/videos', asyncHandler(tvCtrl.videos));
router.get('/:id/external_ids', asyncHandler(tvCtrl.externalIds));
router.get('/:id/season/:season_number', asyncHandler(tvCtrl.seasonDetails));

export default router;
