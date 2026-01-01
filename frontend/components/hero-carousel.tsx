'use client';

import React, { useMemo } from 'react';
import type { Movie, TVShow } from '@/lib/interfaces';
import EmblaCarousel from './carousel/EmblaCarousel';

type Item = {
    id: number;
    mediaType: 'movie' | 'tv';
    title: string;
    overview?: string | null;
    backdrop?: string | null;
    poster?: string | null;
    releaseYear?: string | number | null;
    vote_average?: number;
    raw: Movie | TVShow;
};

interface HeroCarouselProps {
    movies?: Movie[];
    shows?: TVShow[];
    /**
     * width of each slide in px for layout calculations (responsive final size will adjust).
     * If omitted, component will measure container.
     */
    slideWidth?: number;
    autoplay?: boolean;
    autoplayInterval?: number; // ms
    maxItems?: number; // how many items to use from inputs
}

const IMAGE_BASE = 'https://image.tmdb.org/t/p/original'; // hero uses large images

export default function HeroCarousel({
    movies = [],
    shows = [],
    slideWidth,
    autoplay = true,
    autoplayInterval = 5000,
    maxItems = 20,
}: HeroCarouselProps) {
    // normalize movies + shows into unified items, sorted by popularity (desc)
    const items: Item[] = useMemo(() => {
        const m: Item[] = (movies || []).map((mv) => ({
            id: mv.id,
            mediaType: 'movie',
            title: mv.title || mv.original_title || 'Untitled',
            overview: mv.overview,
            backdrop: mv.backdrop_path,
            poster: mv.poster_path,
            releaseYear: mv.release_date
                ? new Date(mv.release_date).getFullYear()
                : null,
            vote_average: mv.vote_average,
            raw: mv,
        }));
        const s: Item[] = (shows || []).map((sh) => ({
            id: sh.id,
            mediaType: 'tv',
            title: sh.name || sh.original_name || 'Untitled',
            overview: sh.overview,
            backdrop: sh.backdrop_path,
            poster: sh.poster_path,
            releaseYear: sh.first_air_date
                ? new Date(sh.first_air_date).getFullYear()
                : null,
            vote_average: sh.vote_average,
            raw: sh,
        }));
        const combined = [...m, ...s];
        combined.sort(
            (a, b) => (b.raw.popularity ?? 0) - (a.raw.popularity ?? 0)
        );
        return combined.slice(
            0,
            Math.max(1, Math.min(maxItems, combined.length))
        );
    }, [movies, shows, maxItems]);

    return (
        <section className={'min-h-[20vh] max-w-screen overflow-scroll'}>
            <EmblaCarousel
                slides={items}
                options={{
                    align: 'start',
                    loop: true,
                    duration: 50,
                }}
            />
        </section>
    );
}
