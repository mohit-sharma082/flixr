'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Video } from '@/lib/interfaces';
import { Rail } from './section';
import { TrailerDialog } from './trailer-button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { tmdbImg } from '@/lib/utils';

/** Trailers/videos rail (→ trailer dialog) + backdrops rail (→ lightbox). */
export function MediaRail({
    videos,
    backdrops,
}: {
    videos?: Video[];
    backdrops?: { file_path: string }[];
}) {
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [lightbox, setLightbox] = useState<string | null>(null);

    const ytVideos = (videos ?? [])
        .filter((v) => v.site === 'YouTube')
        .slice(0, 12);
    const imgs = (backdrops ?? []).slice(0, 12);

    if (!ytVideos.length && !imgs.length) return null;

    return (
        <>
            {ytVideos.length > 0 && (
                <Rail title='Trailers & Videos'>
                    {ytVideos.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => setActiveVideo(v)}
                            aria-label={`Play ${v.name}`}
                            className='group relative w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://img.youtube.com/vi/${v.key}/hqdefault.jpg`}
                                alt={v.name}
                                loading='lazy'
                                className='aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105'
                            />
                            <span className='absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20'>
                                <Play
                                    className='h-10 w-10 fill-white text-white drop-shadow'
                                    aria-hidden='true'
                                />
                            </span>
                            <span className='absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/80 to-transparent p-2 text-left text-xs text-white'>
                                {v.name}
                            </span>
                        </button>
                    ))}
                </Rail>
            )}

            {imgs.length > 0 && (
                <Rail title='Backdrops'>
                    {imgs.map((im) => {
                        const thumb = tmdbImg(im.file_path, 'w780');
                        if (!thumb) return null;
                        return (
                            <button
                                key={im.file_path}
                                onClick={() =>
                                    setLightbox(
                                        tmdbImg(im.file_path, 'original')
                                    )
                                }
                                aria-label='View backdrop'
                                className='w-80 shrink-0 snap-start overflow-hidden rounded-xl border border-white/10'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={thumb}
                                    alt=''
                                    loading='lazy'
                                    className='aspect-video w-full object-cover'
                                />
                            </button>
                        );
                    })}
                </Rail>
            )}

            <TrailerDialog
                video={activeVideo}
                open={!!activeVideo}
                onOpenChange={(o) => !o && setActiveVideo(null)}
            />

            <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
                <DialogContent className='max-w-5xl border-white/10 bg-black p-2'>
                    <DialogTitle className='sr-only'>Backdrop</DialogTitle>
                    {lightbox && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={lightbox}
                            alt=''
                            className='h-auto w-full rounded'
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
