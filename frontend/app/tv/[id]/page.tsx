// app/tv/[id]/page.tsx
import React from 'react';
import { TVDetails } from '@/components/tv/tv-details'; // adjust path if necessary
import type { Review, TVShow } from '@/lib/interfaces';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(
            `${apiBase}/api/tv/${encodeURIComponent(
                id
            )}?append=credits,images,videos`
        );
        if (!res.ok) return { title: 'TV Show Details | Flixr' };
        const data = await res.json();
        const show = data?.show;
        if (!show) return { title: 'TV Show Not Found | Flixr' };

        return {
            title: `${show.name} | Flixr`,
            description: show.overview?.slice(0, 160) || 'TV show details on Flixr',
            openGraph: {
                title: `${show.name} | Flixr`,
                description: show.overview,
                images: show.backdrop_path
                    ? [`https://image.tmdb.org/t/p/w1280${show.backdrop_path}`]
                    : [],
            },
        };
    } catch {
        return { title: 'TV Show Details | Flixr' };
    }
}

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
