'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { selectToken, selectCurrentUser } from '@/store/slices/authSlice';
import { Header } from '@/components/header';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { createApi } from '@/lib/api';

interface UserReview {
    id: string;
    movieId: number;
    movieTitle: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const token = useSelector(selectToken);
    const user = useSelector(selectCurrentUser);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is authenticated
        if (!token) {
            router.push('/auth/login');
            return;
        }

        // Fetch user reviews
        const fetchUserReviews = async () => {
            try {
                const api = createApi();
                const response = await api.get(
                    '/api/reviews?userId=' + user?.id
                );
                setReviews(response.data || []);
            } catch (error) {
                console.error('Failed to fetch user reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserReviews();
    }, [token, user, router]);

    if (loading) {
        return (
            
                <main className='min-h-screen  py-12'>
                    <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8'>
                        <p className=''>Loading profile...</p>
                    </div>
                </main>
            
        );
    }

    return (
        <main className='min-h-screen  py-12'>
            <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8'>
                {/* User Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Your account information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <label className='text-sm font-medium '>
                                Email
                            </label>
                            <p className=' font-semibold'>
                                {user?.email}
                            </p>
                        </div>
                        {user?.name && (
                            <div>
                                <label className='text-sm font-medium '>
                                    Name
                                </label>
                                <p className=' font-semibold'>
                                    {user.name}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Reviews */}
                <div>
                    <h2 className='text-2xl font-bold  mb-6'>
                        Your Reviews
                    </h2>

                    {reviews.length === 0 ? (
                        <Card>
                            <CardContent className='pt-6'>
                                <p className=''>
                                    You haven't written any reviews yet.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className='space-y-4'>
                            {reviews.map((review) => (
                                <Card key={review.id}>
                                    <CardHeader>
                                        <div className='flex items-center justify-between'>
                                            <CardTitle className='text-lg'>
                                                {review.movieTitle}
                                            </CardTitle>
                                            <span className='text-sm font-medium'>
                                                {review.rating}/10 ⭐
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className='space-y-2'>
                                        <p className=''>
                                            {review.comment}
                                        </p>
                                        <p className='text-xs '>
                                            {new Date(
                                                review.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
