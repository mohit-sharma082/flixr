'use client';

import { Review } from '@/lib/interfaces';
import React, { useMemo } from 'react';
import {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
} from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { AtSign, Star } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';

const ReviewsGrid = ({ reviews: REVIEWS }: { reviews: Review[] }) => {
    const [selectedReview, setSelectedReview] = React.useState<Review | null>(
        null
    );
    const getInitials = (name: string) => {
        const names = name.split(' ');
        const initials = names.map((n) => n.charAt(0).toUpperCase());
        return initials.join('');
    };

    const reviews = useMemo(() => {
        if (!REVIEWS || REVIEWS.length === 0) return null;
        return REVIEWS.sort((a, b) => {
            const valueA = a.content?.length || 0;
            const valueB = b.content?.length || 0;
            return valueA - valueB;
        });
    }, [REVIEWS]);

    if (!reviews) return null;
    if (reviews.length === 0) return null;
    return (
        <div className='bg-background'>
            <h2 className='text-2xl font-bold my-2'>
                Reviews ({reviews?.length})
            </h2>
            <div className='grid gap-4 items-start md:grid-cols-[repeat(auto-fill,minmax(600px,1fr))]'>
                {reviews?.map((review, i) => (
                    <Card key={i}>
                        <CardHeader className='flex items-center gap-4'>
                            <Avatar className='h-16 w-16'>
                                <AvatarImage
                                    className='h-16 w-16'
                                    src={
                                        'https://image.tmdb.org/t/p/w500' +
                                        review.author_details?.avatar_path
                                    }
                                />
                                <AvatarFallback>
                                    {getInitials(review.author)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                {review.author ??
                                    review.author_details.name ??
                                    'Anonymous'}
                                <span className='flex items-center text-sm text-muted-foreground'>
                                    <AtSign
                                        size={18}
                                        className='bg-muted-foreground/10 p-0.5 rounded'
                                    />
                                    {review.author_details.username}
                                </span>
                            </div>
                            <div className='ms-auto h-full'>
                                {review.author_details.rating !== null && (
                                    <Badge
                                        size={'lg'}
                                        className='flex items-center gap-1 bg-yellow-600 text-white'>
                                        <Star />
                                        {review.author_details.rating}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className='text-sm text-muted-foreground'>
                                {review.content?.length > 300
                                    ? review.content.slice(0, 300).concat('...') // Truncate long reviews
                                    : review.content}
                                {review.content?.length > 300 && (
                                    <Button
                                        variant={'link'}
                                        className=''
                                        onClick={() =>
                                            setSelectedReview(review)
                                        }>
                                        Read More
                                    </Button>
                                )}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {selectedReview !== null ? (
                <Dialog
                    open={true}
                    onOpenChange={() => setSelectedReview(null)}>
                    <DialogTrigger />
                    <DialogContent className='min-w-[50vw]'>
                        <DialogHeader>
                            <DialogTitle className='text-lg font-bold'>
                                Review
                            </DialogTitle>
                        </DialogHeader>
                        <div className='flex items-center gap-4'>
                            <Avatar className='h-16 w-16'>
                                <AvatarImage
                                    className='h-16 w-16'
                                    src={
                                        'https://image.tmdb.org/t/p/w500' +
                                        selectedReview.author_details
                                            ?.avatar_path
                                    }
                                />
                                <AvatarFallback>
                                    {getInitials(selectedReview.author)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                {selectedReview.author ??
                                    selectedReview.author_details.name ??
                                    'Anonymous'}
                                <span className='flex items-center text-sm text-muted-foreground'>
                                    <AtSign
                                        size={18}
                                        className='bg-muted-foreground/10 p-0.5 rounded'
                                    />
                                    {selectedReview.author_details.username}
                                </span>
                            </div>
                            <div className='ms-auto h-full'>
                                {selectedReview.author_details.rating !==
                                    null && (
                                    <Badge
                                        size={'lg'}
                                        className='flex items-center gap-1 bg-yellow-600 text-white'>
                                        <Star />
                                        {selectedReview.author_details.rating}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <ScrollArea className='h-[50vh] pr-4'>
                            <p>{selectedReview?.content}</p>
                        </ScrollArea>
                        <DialogFooter>
                            <Button
                                variant='secondary'
                                onClick={() => setSelectedReview(null)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
};

export default ReviewsGrid;
