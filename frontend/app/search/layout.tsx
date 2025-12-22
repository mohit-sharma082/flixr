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
        <div className='animate-pulse space-y-4'>
            <div className='h-8 bg-gray-300 rounded w-3/4 mx-auto'></div>
            <div className='h-48 bg-gray-300 rounded w-full'></div>
        </div>
    );
};
