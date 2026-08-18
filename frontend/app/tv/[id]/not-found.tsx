import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Boundary for notFound() thrown by the TV detail page — see the movie
 * equivalent for why the root not-found.tsx can't serve this segment.
 */
export default function TvNotFound() {
    return (
        <main className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
            <h1 className='text-2xl font-semibold'>Show not found</h1>
            <p className='max-w-md text-muted-foreground'>
                We couldn&apos;t find that show. It may have been removed from
                TMDB, or the link might be wrong.
            </p>
            <div className='flex flex-wrap justify-center gap-3'>
                <Button asChild>
                    <Link href='/tv'>Browse TV shows</Link>
                </Button>
                <Button asChild variant='outline'>
                    <Link href='/'>Return home</Link>
                </Button>
            </div>
        </main>
    );
}
