import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as commonCtrl from '../controllers/common.controller';

const router = Router();

/**
 * Movie routes
 */
router.get('/search', asyncHandler(commonCtrl.search));
router.get('/trending', asyncHandler(commonCtrl.trending));

export default router;
