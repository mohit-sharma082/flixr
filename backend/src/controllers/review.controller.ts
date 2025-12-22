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

export const getReviewsForTmdb = async (req: Request, res: Response) => {
    const { mediaType, tmdbId } = req.params;
    const reviews = await Review.find({ tmdbId: +tmdbId, mediaType }).populate(
        'user',
        'name email'
    );
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
