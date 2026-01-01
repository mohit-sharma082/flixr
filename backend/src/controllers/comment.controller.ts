import { Request, Response } from 'express';
import Joi from 'joi';
import Comment from '../models/Comment';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// Validation
const commentSchema = Joi.object({
    tmdbId: Joi.number().optional(),
    mediaType: Joi.string().valid('movie', 'tv').optional(),
    review: Joi.string().optional().allow(null, ''),
    parent: Joi.string().optional().allow(null, ''),
    content: Joi.string().min(1).max(2000).required(),
});

// create top-level comment (media) or comment on review/parent
export const createComment = async (req: AuthRequest, res: Response) => {
    const { error, value } = commentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    // require either tmdbId+mediaType OR review
    if (!value.review && !(value.tmdbId && value.mediaType)) {
        return res.status(400).json({
            error: 'Must attach comment to media (tmdbId+mediaType) or a review',
        });
    }

    // if parent provided, ensure it's an existing comment (optional)
    if (value.parent && !mongoose.Types.ObjectId.isValid(value.parent)) {
        return res.status(400).json({ error: 'Invalid parent id' });
    }

    const comment = new Comment({
        user: req.user._id,
        tmdbId: value.tmdbId,
        mediaType: value.mediaType,
        review: value.review || undefined,
        parent: value.parent || undefined,
        content: value.content,
    });
    await comment.save();

    // Optionally: populate user details for response
    await comment.populate('user', 'name email');

    res.status(201).json(comment);
};

// list comments for a media item (paginated)
export const listCommentsByMedia = async (req: Request, res: Response) => {
    const { mediaType, tmdbId } = req.params;
    const page = Math.max(1, +(req.query.page || 1));
    const limit = Math.min(50, +(req.query.limit || 20));
    if (!['movie', 'tv'].includes(mediaType))
        return res.status(400).json({ error: 'Invalid media type' });

    const query = {
        tmdbId: +tmdbId,
        mediaType,
        parent: { $exists: false },
        deleted: false,
    } as any;

    // pinned comments first, then newest
    const comments = await Comment.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .lean()
        .exec();

    // Optionally fetch reply counts or a few replies per comment
    // A simple approach: fetch latest 3 replies per comment
    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({
        parent: { $in: commentIds },
        deleted: false,
    })
        .sort({ createdAt: 1 })
        .limit(100) // fetch a reasonable page of replies for all comments
        .populate('user', 'name email')
        .lean()
        .exec();

    // group replies by parent id
    const repliesMap: Record<string, any[]> = {};
    replies.forEach((r: any) => {
        repliesMap[r.parent.toString()] = repliesMap[r.parent.toString()] || [];
        repliesMap[r.parent.toString()].push(r);
    });

    const result = comments.map((c) => ({
        ...c,
        replies: repliesMap[c._id.toString()] || [],
    }));

    res.json({ page, limit, results: result });
};

// list comments for a review (paginated)
export const listCommentsByReview = async (req: Request, res: Response) => {
    const { reviewId } = req.params;
    const page = Math.max(1, +(req.query.page || 1));
    const limit = Math.min(100, +(req.query.limit || 20));

    const query = {
        review: reviewId,
        parent: { $exists: false },
        deleted: false,
    } as any;
    const comments = await Comment.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name email')
        .lean()
        .exec();
    res.json({ page, limit, results: comments });
};

// update (edit) comment - only owner
export const updateComment = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { error, value } = Joi.object({
        content: Joi.string().min(1).max(2000).required(),
    }).validate(req.body);
    if (error) return res.status(400).json({ error: error.message });

    const comment = await Comment.findById(id);
    if (!comment || comment.deleted)
        return res.status(404).json({ error: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString())
        return res.status(403).json({ error: 'Not allowed' });

    comment.content = value.content;
    comment.edited = true;
    await comment.save();
    await comment.populate('user', 'name email');
    res.json(comment);
};

// soft delete - owner or admin
export const deleteComment = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const comment = await Comment.findById(id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // admin check placeholder: req.user.isAdmin?
    const isOwner = comment.user.toString() === req.user._id.toString();
    const isAdmin =
        req.user && (req.user.role === 'admin' || req.user.isAdmin === true); // adjust to your User model

    if (!isOwner && !isAdmin)
        return res.status(403).json({ error: 'Not allowed' });

    // soft delete for moderation history
    comment.deleted = true;
    await comment.save();
    res.json({ ok: true });
};

// like/unlike a comment (simple counter) — you can replace this with a likes collection for accuracy
export const toggleLike = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    // NOTE: For production, keep a separate collection to prevent multiple likes from same user.
    const comment = await Comment.findById(id);
    if (!comment || comment.deleted)
        return res.status(404).json({ error: 'Comment not found' });

    // Super simple: increment. For preventing duplicates, maintain a Like model or array of user ids (careful with array growth).
    const action = req.body.action === 'unlike' ? 'unlike' : 'like';
    if (action === 'like') comment.likeCount = (comment.likeCount || 0) + 1;
    else comment.likeCount = Math.max(0, (comment.likeCount || 0) - 1);

    await comment.save();
    res.json({ ok: true, likeCount: comment.likeCount });
};
