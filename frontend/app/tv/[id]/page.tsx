// app/tv/[id]/page.tsx
import React from 'react';
import { TVDetails } from '@/components/tv/tv-details'; // adjust path if necessary
import type { Review, TVShow } from '@/lib/interfaces';

interface PageProps {
    params: { id: string };
    searchParams?: Record<string, string | string[] | undefined>;
}

async function getTVDetails(
    id: string
): Promise<{ show: TVShow; reviews: { results: Review[] } } | null> {
    try {
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
            `${apiBase}/api/tv/${encodeURIComponent(
                id
            )}?append=credits,images,videos`,
            {
                next: { revalidate: 3600 },
            }
        );
        if (!res.ok) {
            console.error('Failed to fetch TV details', res.status);
            return null;
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error fetching TV details:', err);
        return null;
    }
}

export default async function TVPage({ params }: PageProps) {
    const { id } = await params;
    const data = await getTVDetails(id);

    if (!data?.show) {
        return (
            <main className='min-h-screen flex items-center justify-center'>
                <div className='text-center py-12'>
                    <h2 className='text-xl font-semibold'>Show not found</h2>
                    <p className='text-muted-foreground mt-2'>
                        Unable to load TV show details.
                    </p>
                </div>
            </main>
        );
    }

    // console.log('TV Show Data:', data);

    return (
        <main>
            <TVDetails show={data?.show} reviews={data?.reviews?.results} />
        </main>
    );
}
