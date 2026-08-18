'use client';

import { useCallback, useEffect, useState } from 'react';
import { createApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, AlertTriangle } from 'lucide-react';
import { ReviewComposer } from '@/components/review-composer';
import { ReviewCard, type ReviewCardData } from '@/components/reviews/review-card';

interface FlixrReviewsProps {
    tmdbId: number;
    mediaType?: 'movie' | 'tv';
}

interface FlixrReview {
    _id: string;
    user: { name?: string; email?: string };
    rating: number;
    content: string;
    createdAt: string;
    mediaType: string;
    tmdbId: number;
}

export default function FlixrReviews({
    tmdbId,
    mediaType = 'movie',
}: FlixrReviewsProps) {
    const [reviews, setReviews] = useState<FlixrReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const api = createApi();
            const response = await api.get(
                `/api/reviews/tmdb/${mediaType}/${tmdbId}`
            );
            setReviews(
                Array.isArray(response.data) ? response.data : []
            );
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [tmdbId, mediaType]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <section
            aria-labelledby='flixr-community-reviews-heading'
            className='space-y-4'>
            <div className='flex items-center gap-2'>
                <MessageSquare className='h-6 w-6 text-primary' />
                <h2
                    id='flixr-community-reviews-heading'
                    className='text-2xl font-semibold'>
                    Flixr Community Reviews
                </h2>
                {!loading && !error && reviews.length > 0 && (
                    <Badge variant='secondary'>{reviews.length}</Badge>
                )}
            </div>

            <ReviewComposer
                tmdbId={tmdbId}
                mediaType={mediaType}
                onReviewAdded={fetchReviews}
            />

            {loading && (
                <p className='text-sm text-muted-foreground' role='status'>
                    Loading community reviews…
                </p>
            )}

            {!loading && error && (
                <Card className='border-destructive/40'>
                    <CardContent className='flex items-center gap-3'>
                        <AlertTriangle className='h-5 w-5 text-destructive' />
                        <p className='text-sm text-muted-foreground'>
                            We couldn&apos;t load community reviews right now.
                            Please try again later.
                        </p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && reviews.length === 0 && (
                <Card>
                    <CardContent className='text-center text-muted-foreground'>
                        No community reviews yet — be the first.
                    </CardContent>
                </Card>
            )}

            {!loading && !error && reviews.length > 0 && (
                <div className='grid items-start gap-4 sm:grid-cols-2'>
                    {reviews.map((review) => {
                        const card: ReviewCardData = {
                            id: review._id,
                            author:
                                review.user?.name ||
                                review.user?.email ||
                                'Anonymous',
                            rating: review.rating,
                            content: review.content,
                            date: review.createdAt,
                        };
                        return <ReviewCard key={review._id} review={card} />;
                    })}
                </div>
            )}
        </section>
    );
}
