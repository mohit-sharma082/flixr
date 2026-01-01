import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as reviewCtrl from '../controllers/review.controller';
import auth from '../middleware/auth';

const router = Router();
router.post('/', auth, asyncHandler(reviewCtrl.createReview));
router.get(
    '/tmdb/:mediaType/:tmdbId',
    asyncHandler(reviewCtrl.getReviewsForTmdb)
);
router.put('/:id', auth, asyncHandler(reviewCtrl.updateReview));
router.delete('/:id', auth, asyncHandler(reviewCtrl.deleteReview));
export default router;
