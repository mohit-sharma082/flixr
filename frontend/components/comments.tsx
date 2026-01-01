'use client';

import { useEffect, useState } from 'react';
import { createApi } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Review {
    id: string;
    author?: string;
    rating?: number;
    comment?: string;
    text?: string;
    createdAt?: string;
}

interface CommentsProps {
    movieId: number;
    refreshTrigger?: number;
}

export function Comments({ movieId, refreshTrigger = 0 }: CommentsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true);
            try {
                const api = createApi();
                const response = await api.get(
                    `/api/reviews/tmdb/movie/${movieId}`
                );
                setReviews(response.data || []);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [movieId, refreshTrigger]);

    if (loading) {
        return (
            <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className='h-4 w-24' />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className='h-20 w-full' />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <Card>
                <CardContent className='pt-6'>
                    <p className=''>
                        No reviews yet. Be the first to review!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-4'>
            {reviews.map((review) => (
                <Card key={review.id}>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <h4 className='font-semibold'>
                                {review.author || 'Anonymous'}
                            </h4>
                            {review.rating && (
                                <span className='text-sm font-medium'>
                                    {review.rating}/10 ⭐
                                </span>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className=''>
                            {review.comment || review.text}
                        </p>
                        {review.createdAt && (
                            <p className='text-xs  mt-2'>
                                {new Date(
                                    review.createdAt
                                ).toLocaleDateString()}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
