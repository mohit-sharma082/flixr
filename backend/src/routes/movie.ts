import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as movieCtrl from '../controllers/movie.controller';

const router = Router();

/**
 * Movie routes
 */
router.get('/search', asyncHandler(movieCtrl.search));
router.get('/popular', asyncHandler(movieCtrl.popular));
router.get('/top_rated', asyncHandler(movieCtrl.topRated));
router.get('/now_playing', asyncHandler(movieCtrl.nowPlaying));
router.get('/upcoming', asyncHandler(movieCtrl.upcoming));

router.get('/trending/', asyncHandler(movieCtrl.trending));
router.get('/trending/:time_window', asyncHandler(movieCtrl.trending));

router.get('/discover', asyncHandler(movieCtrl.discover));
router.get('/genres', asyncHandler(movieCtrl.genres));

router.get('/:id', asyncHandler(movieCtrl.details));
router.get('/:id/credits', asyncHandler(movieCtrl.credits));
router.get('/:id/videos', asyncHandler(movieCtrl.videos));
router.get('/:id/reviews', asyncHandler(movieCtrl.tmdbReviews));
router.get('/:id/recommendations', asyncHandler(movieCtrl.recommendations));
router.get('/:id/similar', asyncHandler(movieCtrl.similar));
router.get('/:id/external_ids', asyncHandler(movieCtrl.externalIds));
router.get('/:id/images', asyncHandler(movieCtrl.images));
router.get('/:id/aggregate', asyncHandler(movieCtrl.aggregate));

export default router;
