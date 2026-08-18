'use client';

import { Review } from '@/lib/interfaces';
import { useMemo } from 'react';
import {
    ReviewCard,
    resolveTmdbAvatar,
    type ReviewCardData,
} from './reviews/review-card';

const ReviewsGrid = ({ reviews }: { reviews: Review[] }) => {
    const cards = useMemo<ReviewCardData[]>(() => {
        if (!reviews?.length) return [];
        // Copy before sorting — never mutate the prop array. Newest first.
        return [...reviews]
            .sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )
            .map((review) => ({
                id: review.id,
                author: review.author || review.author_details?.name || 'Anonymous',
                username: review.author_details?.username || null,
                avatarUrl: resolveTmdbAvatar(review.author_details?.avatar_path),
                rating: review.author_details?.rating ?? null,
                content: review.content,
                date: review.created_at,
                sourceUrl: review.url,
                sourceLabel: 'View on TMDB',
            }));
    }, [reviews]);

    if (cards.length === 0) return null;

    return (
        <div className='grid items-start gap-4 sm:grid-cols-2'>
            {cards.map((card) => (
                <ReviewCard key={card.id} review={card} />
            ))}
        </div>
    );
};

export default ReviewsGrid;
