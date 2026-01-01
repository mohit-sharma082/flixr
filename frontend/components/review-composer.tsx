'use client';

import type React from 'react';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectToken } from '@/store/slices/authSlice';
import { createApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ReviewComposerProps {
    movieId: number;
    onReviewAdded?: () => void;
}

export function ReviewComposer({
    movieId,
    onReviewAdded,
}: ReviewComposerProps) {
    const token = useSelector(selectToken);
    const { toast } = useToast();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='pt-6'>
                    <p className=''>
                        <a
                            href='/auth/login'
                            className='text-blue-600 hover:underline'>
                            Sign in
                        </a>{' '}
                        to write a review
                    </p>
                </CardContent>
            </Card>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!comment.trim()) {
            toast({
                title: 'Error',
                description: 'Please write a review',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const api = createApi();
            await api.post('/api/reviews', {
                tmdbMovieId: movieId,
                rating,
                comment,
            });

            toast({
                title: 'Success',
                description: 'Review posted successfully',
            });

            setRating(5);
            setComment('');
            onReviewAdded?.();
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message || 'Failed to post review',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>
                    Share your thoughts about this movie
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='space-y-2'>
                        <Label htmlFor='rating'>Rating (1-10)</Label>
                        <div className='flex items-center gap-4'>
                            <input
                                id='rating'
                                type='range'
                                min='1'
                                max='10'
                                value={rating}
                                onChange={(e) =>
                                    setRating(
                                        Number.parseInt(e.target.value, 10)
                                    )
                                }
                                className='flex-1'
                            />
                            <span className='font-semibold text-lg'>
                                {rating}/10
                            </span>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='comment'>Your Review</Label>
                        <Textarea
                            id='comment'
                            placeholder='Write your review here...'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className='min-h-24'
                        />
                    </div>

                    <Button type='submit' disabled={loading}>
                        {loading ? 'Posting...' : 'Post Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
