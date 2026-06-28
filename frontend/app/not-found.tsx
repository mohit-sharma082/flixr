import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <main className='flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center'>
            <h1 className='text-6xl font-bold'>404</h1>
            <h2 className='text-2xl font-semibold'>Page not found</h2>
            <p className='max-w-md text-muted-foreground'>
                The page you are looking for doesn&apos;t exist or may have been
                moved.
            </p>
            <Button asChild>
                <Link href='/'>Return home</Link>
            </Button>
        </main>
    );
}
