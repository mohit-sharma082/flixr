'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { Season, Episode } from '@/lib/interfaces';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
const SeasonInfo = React.lazy(() =>
    import('./SeasonInfo').then((mod) => ({ default: mod.SeasonInfo })),
);
const EpisodesList = React.lazy(() =>
    import('./EpisodesList').then((mod) => ({ default: mod.EpisodesList })),
);
const SelectedEpisodeDetails = React.lazy(() =>
    import('./SelectedEpisodeDetails').then((mod) => ({
        default: mod.SelectedEpisodeDetails,
    })),
);

interface SeasonDetailsProps {
    season: Season;
}

export default function SeasonDetails({ season }: SeasonDetailsProps) {
    const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(
        season.episodes?.[0] || null,
    );

    const backgroundImage = useMemo(() => {
        if (selectedEpisode?.still_path) {
            return `https://image.tmdb.org/t/p/w1280${selectedEpisode.still_path}`;
        }
        return season.poster_path
            ? `https://image.tmdb.org/t/p/w1280${season.poster_path}`
            : '/placeholder.svg?height=1080&width=1920';
    }, [selectedEpisode]);

    return (
        <main className='relative min-h-screen overflow-hidden bg-background'>
            {/* Sticky Background with Gradient Overlay */}
            <div className='fixed inset-0 z-0 '>
                <Image
                    src={backgroundImage || '/placeholder.svg'}
                    alt='Background'
                    fill
                    className='object-cover'
                    priority
                />
                {/* Multiple gradient layers for depth */}
                <div className='absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/60' />
                <div className='absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background' />
            </div>

            {/* Three Column Layout */}
            <div className='relative z-10 h-screen overflow-y-scroll lg:overflow-clip lg:flex'>
                {/* Left Column - Season Info (25%) */}
                <div className='w-full lg:w-[20%] border-r border-border bg-background/30 backdrop-blur-sm'>
                    <div className='p-4 pt-4 pb-0'>
                        <Button
                            onClick={() => window.history.back()}
                            variant='outline'
                            size='icon'
                            className='rounded-full bg-black/50 backdrop-blur-sm border-none text-white hover:bg-black/70'>
                            <ArrowLeft className='h-5 w-5' />
                            <span className='sr-only'>Back</span>
                        </Button>
                    </div>
                    <SeasonInfo season={season} />
                </div>

                {/* Center Column - Episodes List (50%) */}
                <div className='lg:w-[60%] border-r border-border bg-background/30 backdrop-blur-sm'>
                    <div className='h-full flex flex-col p-4 md:max-w-[90%] mx-auto'>
                        <div className='p-4'>
                            <h3 className='text-xl font-bold text-foreground'>
                                Episodes
                            </h3>
                            <p className='text-sm text-muted-foreground'>
                                {season.episodes?.length} episodes
                            </p>
                        </div>
                        <div className='flex-1 overflow-hidden'>
                            <EpisodesList
                                episodes={season.episodes || []}
                                selectedEpisode={selectedEpisode}
                                onSelectEpisode={setSelectedEpisode}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column - Episode Details (25%) */}
                <div className='lg:w-1/4 bg-background/30 backdrop-blur-sm'>
                    <div className='h-full flex flex-col px-2 lg:p-0'>
                        <div className='lg:border-b border-border p-6 pb-2 lg:p-4'>
                            <h3 className='text-lg font-bold text-foreground'>
                                Details
                            </h3>
                        </div>
                        <div className='flex-1 overflow-hidden'>
                            <SelectedEpisodeDetails episode={selectedEpisode} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
