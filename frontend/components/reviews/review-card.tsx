'use client';

import { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AtSign, Calendar, ExternalLink, Star } from 'lucide-react';

export interface ReviewCardData {
    id: string;
    /** Display name of the reviewer. */
    author: string;
    /** Optional @handle (TMDB reviews only). */
    username?: string | null;
    /** Pre-resolved avatar image URL, or null to fall back to initials. */
    avatarUrl?: string | null;
    /** Rating on a 0–10 scale; null/undefined hides the badge. */
    rating?: number | null;
    content: string;
    /** ISO timestamp. */
    date?: string | null;
    /** Optional external source link (e.g. the review on TMDB). */
    sourceUrl?: string | null;
    sourceLabel?: string;
}

const COLLAPSE_THRESHOLD = 420;

function getInitials(name: string) {
    return (
        name
            .trim()
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || '?'
    );
}

function formatDate(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * TMDB review bodies are markdown. We don't ship a markdown renderer, so strip
 * the most common syntax to readable plain text and keep line breaks (rendered
 * via `whitespace-pre-line`). Conservative on purpose — no risky transforms.
 */
function cleanContent(raw: string) {
    return raw
        .replace(/\r\n/g, '\n')
        .replace(/\*\*(.+?)\*\*/g, '$1') // bold
        .replace(/(^|\W)\*(?!\s)(.+?)\*(?=\W|$)/g, '$1$2') // italic
        .replace(/(^|\W)_(?!\s)(.+?)_(?=\W|$)/g, '$1$2') // underscore italic
        .replace(/^#{1,6}\s+/gm, '') // headings
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links → label
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/** DESIGN.md rating colors: tinted glass badge keyed to the score. */
function ratingBadgeClasses(rating: number) {
    if (rating >= 7.5)
        return 'bg-green-500/15 text-green-400 border border-green-500/25';
    if (rating >= 6)
        return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25';
    return 'bg-red-500/15 text-red-400 border border-red-500/25';
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
    const [expanded, setExpanded] = useState(false);
    const content = cleanContent(review.content || '');
    const isLong = content.length > COLLAPSE_THRESHOLD;
    const date = formatDate(review.date);
    const hasRating =
        typeof review.rating === 'number' && !Number.isNaN(review.rating);

    return (
        <article className='flex flex-col rounded-xl border border-white/10 bg-background/30 p-5 backdrop-blur-sm transition-colors duration-300 hover:border-white/20'>
            <header className='flex items-start gap-3'>
                <Avatar className='h-11 w-11 shrink-0'>
                    {review.avatarUrl && (
                        <AvatarImage
                            src={review.avatarUrl}
                            alt={review.author}
                            className='object-cover'
                        />
                    )}
                    <AvatarFallback className='bg-gradient-to-br from-primary/40 to-primary/10 text-sm font-semibold text-foreground'>
                        {getInitials(review.author)}
                    </AvatarFallback>
                </Avatar>

                <div className='min-w-0 flex-1'>
                    <p className='truncate font-medium leading-tight'>
                        {review.author || 'Anonymous'}
                    </p>
                    <div className='mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground'>
                        {review.username && (
                            <span className='flex items-center gap-0.5'>
                                <AtSign className='h-3 w-3' aria-hidden='true' />
                                {review.username}
                            </span>
                        )}
                        {date && (
                            <span className='flex items-center gap-1'>
                                <Calendar
                                    className='h-3 w-3'
                                    aria-hidden='true'
                                />
                                {date}
                            </span>
                        )}
                    </div>
                </div>

                {hasRating && (
                    <Badge
                        className={cn(
                            'flex shrink-0 items-center gap-1 font-semibold',
                            ratingBadgeClasses(review.rating as number)
                        )}
                        aria-label={`Rated ${review.rating} out of 10`}>
                        <Star
                            className='h-3 w-3 fill-current'
                            aria-hidden='true'
                        />
                        {review.rating}
                        <span className='font-normal opacity-70'>/10</span>
                    </Badge>
                )}
            </header>

            <p
                className={cn(
                    'mt-4 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground',
                    isLong && !expanded && 'line-clamp-6'
                )}>
                {content}
            </p>

            {(isLong || review.sourceUrl) && (
                <footer className='mt-3 flex items-center gap-4 text-sm'>
                    {isLong && (
                        <button
                            type='button'
                            onClick={() => setExpanded((v) => !v)}
                            className='font-medium text-primary transition-colors hover:text-primary/80'>
                            {expanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                    {review.sourceUrl && (
                        <a
                            href={review.sourceUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='ms-auto inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground'>
                            {review.sourceLabel ?? 'Source'}
                            <ExternalLink className='h-3 w-3' aria-hidden='true' />
                        </a>
                    )}
                </footer>
            )}
        </article>
    );
}

/**
 * Resolve a TMDB review avatar path to a usable URL. Handles the two quirks:
 * a null path (→ null, caller shows initials) and gravatar paths that TMDB
 * returns prefixed with a stray leading slash (`/https://…`).
 */
export function resolveTmdbAvatar(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('/https://') || path.startsWith('/http://')) {
        return path.slice(1);
    }
    return `https://image.tmdb.org/t/p/w185${path}`;
}
