// app/tv/[id]/page.tsx
import React, { Suspense } from 'react';
import { Season } from '@/lib/interfaces';

// const SeasonDetails = React.lazy(
//     () => import('@/components/tv/season/season-details'),
// );

const SeasonDetails = React.lazy(
    () => import('@/components/tv/season/SeasonDetails'),
);

interface PageProps {
    params: { id: string; seasonId: string };
    searchParams?: Record<string, string | string[] | undefined>;
}

async function getTvShowSeason(
    id: string,
    seasonId: string,
): Promise<Season | null> {
    try {
        const apiBase =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
            `${apiBase}/api/tv/${encodeURIComponent(
                id,
            )}/season/${encodeURIComponent(seasonId)}?append=credits,images,videos`,
            {
                next: { revalidate: 3600 },
            },
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
    const { id, seasonId } = await params;
    const data = await getTvShowSeason(id, seasonId);

    if (!data) {
        return (
            <main className='min-h-screen flex items-center justify-center'>
                <div className='text-center py-12'>
                    <h2 className='text-xl font-semibold'>Season not found</h2>
                    <p className='text-muted-foreground mt-2'>
                        Unable to load TV show season details.
                    </p>
                </div>
            </main>
        );
    }

    // console.log('TV Show Data:', data);

    return (
        <main>
            <Suspense fallback={<div>Loading season details...</div>}>
                <SeasonDetails season={data} />
            </Suspense>
        </main>
    );
}
