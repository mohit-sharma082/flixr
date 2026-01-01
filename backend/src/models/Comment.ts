import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
    user: mongoose.Types.ObjectId;
    tmdbId?: number; // attach to media item
    mediaType?: 'movie' | 'tv'; // media type if attached to media
    review?: mongoose.Types.ObjectId; // optional: attach to a review
    parent?: mongoose.Types.ObjectId; // reply to another comment
    content: string;
    edited?: boolean;
    likeCount?: number;
    pinned?: boolean;
    deleted?: boolean; // soft delete
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        tmdbId: { type: Number, index: true },
        mediaType: { type: String, enum: ['movie', 'tv'], index: true },
        review: { type: Schema.Types.ObjectId, ref: 'Review', index: true },
        parent: { type: Schema.Types.ObjectId, ref: 'Comment', index: true },
        content: { type: String, required: true },
        edited: { type: Boolean, default: false },
        likeCount: { type: Number, default: 0 },
        pinned: { type: Boolean, default: false },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Compound index for quick retrieval of top-level comments for a media item
CommentSchema.index({ tmdbId: 1, mediaType: 1, parent: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
