import type React from 'react';
import { Suspense } from 'react';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <Suspense
            fallback={
                <div className='h-screen w-screen animate-pulse bg-primary/10 flex items-center justify-center text-lg'>
                    Loading...
                </div>
            }>
            {children}
        </Suspense>
    );
}
