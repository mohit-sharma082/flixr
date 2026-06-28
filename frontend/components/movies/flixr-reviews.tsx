'use client';

import { useCallback, useEffect, useState } from 'react';
import { createApi } from '@/lib/api';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Star, Calendar, MessageSquare, AlertTriangle } from 'lucide-react';
import { ReviewComposer } from '@/components/review-composer';

interface FlixrReviewsProps {
    movieId: number;
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

function getInitials(str: string) {
    return str
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
}

function formatDate(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export default function FlixrReviews({ movieId }: FlixrReviewsProps) {
    const [reviews, setReviews] = useState<FlixrReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const api = createApi();
            const response = await api.get(
                `/api/reviews/tmdb/movie/${movieId}`
            );
            setReviews(
                Array.isArray(response.data) ? response.data : []
            );
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [movieId]);

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
                    className='text-2xl font-bold'>
                    Flixr Community Reviews
                </h2>
                {!loading && !error && reviews.length > 0 && (
                    <Badge variant='secondary'>{reviews.length}</Badge>
                )}
            </div>

            <ReviewComposer movieId={movieId} onReviewAdded={fetchReviews} />

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
                <div className='grid gap-4 items-start md:grid-cols-[repeat(auto-fill,minmax(600px,1fr))]'>
                    {reviews.map((review) => {
                        const reviewer =
                            review.user?.name ||
                            review.user?.email ||
                            'Anonymous';
                        const date = formatDate(review.createdAt);
                        return (
                            <Card key={review._id}>
                                <CardHeader className='flex items-center gap-4'>
                                    <Avatar className='h-12 w-12'>
                                        <AvatarFallback>
                                            {getInitials(reviewer)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col min-w-0'>
                                        <CardTitle className='text-base truncate'>
                                            {reviewer}
                                        </CardTitle>
                                        {date && (
                                            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                                                <Calendar className='h-3 w-3' />
                                                {date}
                                            </span>
                                        )}
                                    </div>
                                    <div className='ms-auto'>
                                        <Badge
                                            className='flex items-center gap-1 bg-yellow-600 text-white'
                                            aria-label={`Rated ${review.rating} out of 10`}>
                                            <Star
                                                className='h-3 w-3 fill-current'
                                                aria-hidden='true'
                                            />
                                            {review.rating}/10
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <Separator />
                                <CardContent>
                                    <p className='text-sm text-muted-foreground whitespace-pre-line break-words'>
                                        {review.content}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
