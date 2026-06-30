'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function PersonError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Person route error caught:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 sm:px-6 lg:px-8 text-center bg-background text-foreground animate-in fade-in duration-300">
            <div className="space-y-5 max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                    <AlertTriangle className="h-8 w-8" />
                </div>
                
                <div className="space-y-2">
                    <h1 className="text-3xl font-extrabold tracking-tight">Something went wrong</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        An error occurred while loading this page. This could be due to a temporary network issue or invalid request.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                    <Button 
                        onClick={() => reset()} 
                        size="lg" 
                        className="min-h-[44px] px-6 gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Try Again
                    </Button>
                    <Link href="/">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className="min-h-[44px] px-6 gap-2"
                        >
                            <Home className="h-4 w-4" />
                            Go to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
