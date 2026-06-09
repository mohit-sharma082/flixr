import Link from 'next/link';
import { Genre } from '@/lib/interfaces';
import { cn } from '@/lib/utils';

interface GenreRowProps {
    title: string;
    genres: Genre[];
    /** base path to deep-link into, e.g. "/movie" or "/tv" */
    basePath: '/movie' | '/tv';
}

export function GenreRow({ title, genres, basePath }: GenreRowProps) {
    if (!genres?.length) return null;
    return (
        <section className='px-4 sm:px-6 lg:px-8 py-6'>
            <h2 className='text-2xl font-semibold mb-4'>{title}</h2>
            <div className='flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-none pb-2'>
                {genres.map((genre) => (
                    <Link
                        key={genre.id}
                        href={`${basePath}?with_genres=${genre.id}`}
                        className={cn(
                            'snap-start shrink-0 px-5 py-3 rounded-xl text-sm font-semibold',
                            'bg-background/40 border border-white/10 backdrop-blur-sm',
                            'text-white/85 hover:text-white hover:border-primary/50 hover:bg-primary/10',
                            'transition-all duration-200',
                            // 44x44 min touch target satisfied by py-3 + px-5
                        )}>
                        {genre.name}
                    </Link>
                ))}
                {/* Trailing spacer per DESIGN.md carousel rule */}
                <div className='w-8 shrink-0' />
            </div>
        </section>
    );
}
