import { MovieCard } from '@/components/movies/movie-card';
import { TvShowCard } from '@/components/tv/tv-show-card';
import { PersonCard } from '@/components/person-card';
import { Button } from '@/components/ui/button';
import { Movie } from '@/lib/interfaces';
import Link from 'next/link';
import { Search, Film, User, AlertCircle } from 'lucide-react';
import {
    Empty,
    EmptyHeader,
    EmptyTitle,
    EmptyDescription,
    EmptyMedia,
} from '@/components/ui/empty';

export const metadata = {
    title: 'Search | Flixr',
    description: 'Search for movies, TV shows, and people on Flixr',
};

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
        page?: string;
    }>;
}

async function searchMulti(
    query: string,
    page: number
): Promise<{ results: any[]; totalPages: number }> {
    if (!query) {
        return { results: [], totalPages: 1 };
    }
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(
            `${apiUrl}/api/common/search?q=${encodeURIComponent(
                query
            )}&page=${page}`,
            {
                next: { revalidate: 300 }, // Cache for 5 minutes
            }
        );

        if (!response.ok) {
            console.log('Search API response not ok:', response);
            throw new Error('Failed to search');
        }

        const data = await response.json();
        return {
            results: Array.isArray(data.results) ? data.results : [],
            totalPages: data.total_pages || 1, // TMDB/backend use snake_case
        };
    } catch (error) {
        console.error('Error searching:', error);
        return { results: [], totalPages: 1 };
    }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const query = params.q || '';
    const page = Number.parseInt(params.page || '1', 10);

    let people: any[] = [];
    let items: any[] = [];

    const response = await searchMulti(query, page);
    const { results, totalPages } = response;

    results.forEach((item) => {
        if (item.media_type === 'person') {
            people.push(item);
        } else {
            items.push(item);
        }
    });

    const hasResults = items.length > 0 || people.length > 0;

    return (
        <main className='min-h-screen bg-background text-foreground pb-20'>
            <div className='px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
                {query && hasResults && (
                    <div className='mb-8 md:mb-12 border-b border-border/40 pb-6'>
                        <h1 className='text-3xl font-extrabold tracking-tight'>
                            Search Results
                        </h1>
                        <p className='text-muted-foreground mt-2 text-sm md:text-base'>
                            Showing results for &ldquo;{query}&rdquo; — Found {items.length} titles and {people.length} people.
                        </p>
                    </div>
                )}

                {/* People Results */}
                {people.length > 0 && (
                    <div className='mb-12'>
                        <h2 className='text-xl font-bold mb-6 text-foreground flex items-center gap-2'>
                            <User className='h-5 w-5 text-primary' />
                            People
                        </h2>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 auto-rows-max'>
                            {people.map((person, i) => (
                                <PersonCard
                                    key={`person-${person.id}-${i}`}
                                    person={person}
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Media Results */}
                {items.length > 0 && (
                    <div>
                        <h2 className='text-xl font-bold mb-6 text-foreground flex items-center gap-2'>
                            <Film className='h-5 w-5 text-primary' />
                            Movies & TV Shows
                        </h2>
                        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 auto-rows-max'>
                            {items.map((item, i) => {
                                if (item.media_type === 'tv') {
                                    return (
                                        <TvShowCard
                                            key={`tv-${item.id}-${i}`}
                                            show={item}
                                            index={i}
                                        />
                                    );
                                }
                                return (
                                    <MovieCard
                                        key={`movie-${item.id}-${i}`}
                                        movie={item}
                                        index={i}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Pagination */}
                {query && hasResults && totalPages > 1 && (
                    <div className='mt-12 md:mt-16 flex items-center justify-center gap-4 border-t border-border/45 pt-8'>
                        {page > 1 && (
                            <Button asChild variant='outline' className="min-h-[44px] px-5">
                                <Link
                                    href={`/search?q=${encodeURIComponent(
                                        query
                                    )}&page=${page - 1}`}>
                                    Previous
                                </Link>
                            </Button>
                        )}

                        <span className='text-sm font-medium text-muted-foreground'>
                            Page {page} of {totalPages}
                        </span>

                        {page < totalPages && (
                            <Button asChild className="min-h-[44px] px-5">
                                <Link
                                    href={`/search?q=${encodeURIComponent(
                                        query
                                    )}&page=${page + 1}`}>
                                    Next
                                </Link>
                            </Button>
                        )}
                    </div>
                )}

                {/* Empty / Initial State */}
                {!query && (
                    <div className='py-12 md:py-20 flex justify-center'>
                        <Empty className="max-w-md border border-dashed border-border/60 rounded-xl p-8 bg-foreground/[0.01]">
                            <EmptyMedia variant="icon" className="bg-primary/10 text-primary">
                                <Search className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle className="text-xl font-bold">Search Flixr</EmptyTitle>
                                <EmptyDescription className="text-muted-foreground max-w-sm mt-1">
                                    Type a query in the search bar above to find movies, TV shows, and people in our database.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                )}

                {/* No results state */}
                {query && !hasResults && (
                    <div className='py-12 md:py-20 flex justify-center'>
                        <Empty className="max-w-md border border-dashed border-border/60 rounded-xl p-8 bg-foreground/[0.01]">
                            <EmptyMedia variant="icon" className="bg-destructive/10 text-destructive">
                                <AlertCircle className="h-6 w-6" />
                            </EmptyMedia>
                            <EmptyHeader>
                                <EmptyTitle className="text-xl font-bold">No Results Found</EmptyTitle>
                                <EmptyDescription className="text-muted-foreground max-w-sm mt-1">
                                    We couldn't find any titles or people matching &ldquo;{query}&rdquo;. Please verify spelling or try another query.
                                </EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    </div>
                )}
            </div>
        </main>
    );
}

