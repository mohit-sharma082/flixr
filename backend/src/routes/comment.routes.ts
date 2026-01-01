import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as commentCtrl from '../controllers/comment.controller';
import auth from '../middleware/auth';

const router = Router();

// Create comment (media or review)
router.post('/', auth, asyncHandler(commentCtrl.createComment));

// Get comments for a media item (movie/tv)
router.get(
    '/media/:mediaType/:tmdbId',
    asyncHandler(commentCtrl.listCommentsByMedia)
);

// Get comments for a review
router.get('/review/:reviewId', asyncHandler(commentCtrl.listCommentsByReview));

// Edit/delete/like
router.put('/:id', auth, asyncHandler(commentCtrl.updateComment));
router.delete('/:id', auth, asyncHandler(commentCtrl.deleteComment));
router.post('/:id/like', auth, asyncHandler(commentCtrl.toggleLike));

export default router;
