'use client';

import { lazy, Suspense, useState } from 'react';
import Link from 'next/link';
import { Credits } from '@/lib/interfaces';
import { Rail } from './section';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { tmdbImg } from '@/lib/utils';

const CastAndCrewTab = lazy(() => import('@/components/cast-crew.tab'));

function initials(name: string) {
    return name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

export function CastRail({ credits }: { credits?: Credits }) {
    const [open, setOpen] = useState(false);
    const cast = credits?.cast ?? [];
    if (!cast.length) return null;
    const top = cast.slice(0, 20);
    // Get profile image URL
    const getProfileUrl = (path: string | null) => {
        return path ? `https://image.tmdb.org/t/p/w185${path}` : null;
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <>
            <Rail
                title='Top Cast'
                action={
                    <Button
                        variant='ghost'
                        className='min-h-[44px]'
                        onClick={() => setOpen(true)}>
                        Full cast &amp; crew →
                    </Button>
                }>
                {top.map((p) => {
                    const img = tmdbImg(p.profile_path, 'w185');
                    return (
                        <Link
                            key={p.credit_id ?? p.id}
                            href={`/person/${p.id}`}
                            className='w-28 md:w-44 shrink-0 snap-start'>
                            {/* <div className='overflow-hidden rounded-xl border border-white/10 bg-background/30 backdrop-blur-sm transition-all duration-200 hover:border-white/20'>
                                <div className='relative aspect-2/3 bg-muted'>
                                    {img ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={img}
                                            alt={p.name}
                                            loading='lazy'
                                            className='h-full w-full object-cover'
                                        />
                                    ) : (
                                        <div className='flex h-full items-center justify-center'>
                                            <Avatar className='h-12 w-12'>
                                                <AvatarFallback>
                                                    {initials(p.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    )}
                                </div>
                                <div className='p-2'>
                                    <p className='line-clamp-1 text-sm font-medium'>
                                        {p.name}
                                    </p>
                                    <p className='line-clamp-1 text-xs text-muted-foreground'>
                                        {p.character}
                                    </p>
                                </div>
                            </div> */}
                            <div className='w-28 md:w-44 space-y-3'>
                                <div className='overflow-hidden rounded-md'>
                                    <Avatar className='w-28 h-28 md:w-44 md:h-44 rounded-md'>
                                        {p.profile_path ? (
                                            <AvatarImage
                                                src={
                                                    getProfileUrl(
                                                        p.profile_path,
                                                    ) || ''
                                                }
                                                alt={p.name}
                                                className='object-cover'
                                            />
                                        ) : (
                                            <AvatarFallback className='bg-muted text-4xl'>
                                                {getInitials(p.name)}
                                            </AvatarFallback>
                                        )}
                                    </Avatar>
                                </div>
                                <div className='space-y-1 text-sm'>
                                    <h3 className='font-medium leading-none'>
                                        {p.name}
                                    </h3>
                                    <p className='text-xs text-muted-foreground line-clamp-2'>
                                        {p.character}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </Rail>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className='max-h-[85vh] md:max-w-none md:w-[70vw] overflow-y-auto border-white/10'>
                    <DialogHeader>
                        <DialogTitle>Full cast &amp; crew</DialogTitle>
                    </DialogHeader>
                    <Suspense
                        fallback={
                            <p className='text-sm text-muted-foreground'>
                                Loading…
                            </p>
                        }>
                        <CastAndCrewTab
                            credits={{
                                cast: credits?.cast ?? [],
                                crew: credits?.crew ?? [],
                            }}
                        />
                    </Suspense>
                </DialogContent>
            </Dialog>
        </>
    );
}
