'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Video } from '@/lib/interfaces';
import { cn } from '@/lib/utils';

/**
 * Controlled YouTube trailer dialog. Sandboxed iframe, only mounted while open
 * (so playback stops on close). Legitimate YouTube embed — not a stream.
 */
export function TrailerDialog({
    video,
    open,
    onOpenChange,
    title,
}: {
    video: Video | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-w-4xl overflow-hidden border-white/10 bg-black p-0'>
                <DialogHeader className='px-4 pt-4'>
                    <DialogTitle className='text-base'>
                        {title ?? video?.name ?? 'Trailer'}
                    </DialogTitle>
                </DialogHeader>
                <div className='aspect-video w-full'>
                    {open && video && (
                        <iframe
                            className='h-full w-full'
                            src={`https://www.youtube-nocookie.com/embed/${video.key}?autoplay=1&rel=0`}
                            title={title ?? video.name}
                            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                            allowFullScreen
                            sandbox='allow-scripts allow-same-origin allow-presentation allow-popups'
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

/** Hero "Play Trailer" CTA. Renders nothing when there's no trailer. */
export function TrailerButton({
    video,
    title,
    className,
    variant = 'default',
}: {
    video: Video | null;
    title?: string;
    className?: string;
    variant?: 'default' | 'secondary' | 'outline';
}) {
    const [open, setOpen] = useState(false);
    if (!video) return null;
    return (
        <>
            <Button
                variant={variant}
                className={cn('min-h-[44px] gap-2', className)}
                onClick={() => setOpen(true)}>
                <Play className='h-5 w-5 fill-current' aria-hidden='true' />
                Play Trailer
            </Button>
            <TrailerDialog
                video={video}
                open={open}
                onOpenChange={setOpen}
                title={title}
            />
        </>
    );
}
