import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as reviewCtrl from '../controllers/review.controller';
import auth from '../middleware/auth';

const router = Router();
router.post('/', auth, asyncHandler(reviewCtrl.createReview));
// Literal "mine" must be registered before the param route below so it is not
// matched as :mediaType/:tmdbId.
router.get('/mine', auth, asyncHandler(reviewCtrl.getMyReviews));
router.get(
    '/tmdb/:mediaType/:tmdbId',
    asyncHandler(reviewCtrl.getReviewsForTmdb)
);
router.put('/:id', auth, asyncHandler(reviewCtrl.updateReview));
router.delete('/:id', auth, asyncHandler(reviewCtrl.deleteReview));
export default router;
