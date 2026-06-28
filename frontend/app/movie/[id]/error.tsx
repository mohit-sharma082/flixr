'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log for monitoring; never render raw error details to users.
        console.error(error);
    }, [error]);

    return (
        <main className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
            <h2 className='text-2xl font-semibold'>
                Couldn&apos;t load this movie
            </h2>
            <p className='max-w-md text-muted-foreground'>
                We hit an unexpected error loading this movie. You can try
                again.
            </p>
            <Button onClick={reset}>Try again</Button>
        </main>
    );
}
