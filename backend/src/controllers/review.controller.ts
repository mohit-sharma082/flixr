import { Request, Response } from 'express';
import Joi from 'joi';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

const reviewSchema = Joi.object({
    tmdbId: Joi.number().required(),
    mediaType: Joi.string().valid('movie', 'tv').required(),
    rating: Joi.number().min(0).max(10).required(),
    content: Joi.string().min(1).required(),
});

export const createReview = async (req: AuthRequest, res: Response) => {
    const { error, value } = reviewSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const review = new Review({
        ...value,
        user: req.user._id,
    });
    await review.save();

    // optionally: invalidate derived cache like aggregated ratings
    // await tmdbClient.invalidateKey(`tmdb:aggregated:${value.mediaType}:${value.tmdbId}*`);

    res.json(review);
};

export const getMyReviews = async (req: AuthRequest, res: Response) => {
    const reviews = await Review.find({ user: req.user._id }).sort({
        createdAt: -1,
    });
    res.json(reviews);
};

export const getReviewsForTmdb = async (req: Request, res: Response) => {
    const mediaType = req.params.mediaType as string;
    const tmdbId = req.params.tmdbId as string;

    // Validate before hitting Mongo: an unparseable id would otherwise become a
    // NaN cast error and surface to the client as a 500.
    if (mediaType !== 'movie' && mediaType !== 'tv')
        return res.status(400).json({ error: 'mediaType must be movie or tv' });
    if (!/^\d+$/.test(tmdbId ?? ''))
        return res.status(400).json({ error: 'Invalid tmdbId' });

    const reviews = await Review.find({ tmdbId: +tmdbId, mediaType })
        .sort({ createdAt: -1 })
        .populate('user', 'name email');
    res.json(reviews);
};

export const updateReview = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const existing = await Review.findById(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: 'Not allowed' });

    const { error, value } = reviewSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    existing.set(value);
    await existing.save();
    res.json(existing);
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const existing = await Review.findById(id);
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (existing.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: 'Not allowed' });

    await existing.deleteOne()
    res.json({ ok: true });
};
