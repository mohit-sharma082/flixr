import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    user: mongoose.Types.ObjectId;
    tmdbId: number;
    mediaType: 'movie' | 'tv';
    rating: number;
    content: string;
    createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        tmdbId: { type: Number, required: true },
        mediaType: { type: String, enum: ['movie', 'tv'], required: true },
        rating: { type: Number, min: 0, max: 10, required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

// Hot path: detail pages query/sort reviews by {tmdbId, mediaType}; index it to avoid collection scans.
ReviewSchema.index({ tmdbId: 1, mediaType: 1, createdAt: -1 });
// Enforce one review per user per title (uncomment if that's the intended product rule):
// ReviewSchema.index({ user: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
