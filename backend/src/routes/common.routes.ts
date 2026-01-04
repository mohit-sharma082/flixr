import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as commonCtrl from '../controllers/common.controller';

const router = Router();

/**
 * Movie routes
 */
router.get('/homepage', asyncHandler(commonCtrl.getHomePageData));
router.get('/search', asyncHandler(commonCtrl.search));
router.get('/trending', asyncHandler(commonCtrl.trending));
router.get('/genres', asyncHandler(commonCtrl.getGenres));

export default router;
