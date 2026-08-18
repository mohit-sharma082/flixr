import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Boundary for notFound() thrown by the movie detail page.
 *
 * The root app/not-found.tsx sits outside this segment's streaming boundary
 * (created by loading.tsx), so without a not-found.tsx here the thrown 404
 * rendered an empty page. This is the nearest boundary that can actually paint.
 */
export default function MovieNotFound() {
    return (
        <main className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
            <h1 className='text-2xl font-semibold'>Movie not found</h1>
            <p className='max-w-md text-muted-foreground'>
                We couldn&apos;t find that title. It may have been removed from
                TMDB, or the link might be wrong.
            </p>
            <div className='flex flex-wrap justify-center gap-3'>
                <Button asChild>
                    <Link href='/movie'>Browse movies</Link>
                </Button>
                <Button asChild variant='outline'>
                    <Link href='/'>Return home</Link>
                </Button>
            </div>
        </main>
    );
}
