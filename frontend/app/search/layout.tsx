import type React from 'react';
import { Suspense } from 'react';
import { SearchSection } from '@/components/search/search-section';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import Link from 'next/link';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <div className='flex items-center p-2 md:px-4 border'>
                <Link href='/'>
                    <Button variant={'ghost'} size={'icon'}>
                        <Home />
                    </Button>
                </Link>
                <SearchSection />
            </div>
            <Suspense fallback={<SearchSkeleton />}>{children}</Suspense>;
        </div>
    );
}

const SearchSkeleton = () => {
    return (
        <div className='animate-pulse space-y-4 p-4'>
            <div className='h-10 bg-foreground/10 rounded w-3/4 '></div>
            <div className='h-4 bg-foreground/10 rounded w-24 '></div>
            <div className='grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className='aspect-[0.7] bg-foreground/10 rounded w-full'></div>
                ))}
            </div>
        </div>
    );
};
