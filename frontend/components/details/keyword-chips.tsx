import Link from 'next/link';
import { Keyword } from '@/lib/interfaces';

/** Keyword/topic tags that deep-link into discover (with_keywords). */
export function KeywordChips({
    keywords,
    basePath,
}: {
    keywords?: Keyword[];
    basePath: '/movie' | '/tv';
}) {
    if (!keywords?.length) return null;
    return (
        <div className='flex flex-wrap gap-2'>
            {keywords.map((k) => (
                <Link
                    key={k.id}
                    href={`${basePath}?with_keywords=${k.id}`}
                    className='inline-flex min-h-[44px] items-center rounded-full border border-white/10 bg-background/40 px-4 py-2 text-sm text-white/80 backdrop-blur-sm transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-white'>
                    {k.name}
                </Link>
            ))}
        </div>
    );
}
