import { MovieCard } from '@/components/movies/movie-card';
import { TvShowCard } from '@/components/tv/tv-show-card';
import { PersonCard } from '@/components/person-card';

import { Button } from '@/components/ui/button';
import { Movie } from '@/lib/interfaces';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
const getProfileUrl = (path: string | null) => {
    return path ? `https://image.tmdb.org/t/p/w200${path}` : null;
};

const colorByIndex = (
    index: number
): 'blue' | 'red' | 'green' | 'yellow' | 'violet' | 'rose' | 'orange' => {
    const colors = [
        'blue',
        'red',
        'green',
        'yellow',
        'violet',
        'rose',
        'orange',
    ];
    return colors[index % colors.length] as
        | 'blue'
        | 'red'
        | 'green'
        | 'yellow'
        | 'violet'
        | 'rose'
        | 'orange';
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
export const metadata = {
    title: 'Search - Flixr Community',
    description: 'Search for movies in the Flixr Community',
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
): Promise<{ results: Movie[]; totalPages: number }> {
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
            throw new Error('Failed to search movies : ');
        }

        const data = await response.json();
        return {
            results: data.results || data,
            totalPages: data.totalPages || 1,
        };
    } catch (error) {
        console.error('Error searching movies:', error);
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
    const arr = response?.results ?? [];
    arr.forEach((item) => {
        if (item.media_type === 'person') {
            people.push(item);
        } else {
            items.push(item);
        }
    });

    return (
        <main className='min-h-screen '>
            <div className=' px-4 sm:px-6 lg:px-8 py-12'>
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold '>
                        {query
                            ? `Search Results for "${query}"`
                            : 'Search Movies'}
                    </h1>
                    <p className=' mt-2'>
                        {items.length > 0
                            ? `Found ${items.length} results`
                            : 'Enter a search term to find movies'}
                    </p>
                </div>

                {people.length > 0 && (
                    <div className='grid grid-cols-3 justify-center md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4'>
                        {people.map((person: any, i: number) => {
                            return (
                                <Link key={i} href={`/person/${person.id}`}>
                                    <div className='w-[100px] md:w-[150px] space-y-3 '>
                                        <div className='overflow-hidden rounded-md'>
                                            <Avatar className='h-[100px] md:h-[150px] w-[100px] md:w-[150px] rounded-md'>
                                                {person.profile_path ? (
                                                    <AvatarImage
                                                        src={
                                                            getProfileUrl(
                                                                person.profile_path
                                                            ) || ''
                                                        }
                                                        alt={person.name}
                                                        className='object-cover'
                                                    />
                                                ) : (
                                                    <AvatarFallback
                                                        className={
                                                            'text-4xl bg-gradient-to-br from-primary/5 to-background'
                                                        }>
                                                        {getInitials(
                                                            person.name
                                                        )}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>
                                        </div>
                                        <div className='space-y-1 text-sm'>
                                            <h3 className='font-medium leading-none'>
                                                {person.name}
                                            </h3>
                                            <p className='text-xs text-muted-foreground line-clamp-2'>
                                                {person.character}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {items.length > 0 && (
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]'>
                        {items?.map((item, i) => {
                            if (item.media_type == 'tv') {
                                return (
                                    <TvShowCard
                                        key={'tv_' + i}
                                        show={item}
                                        index={i}
                                    />
                                );
                            }
                            if (item.media_type == 'movie') {
                                return (
                                    <MovieCard
                                        key={'movie_' + i}
                                        movie={item}
                                        index={i}
                                    />
                                );
                            }
                            if (item.media_type == 'person') {
                                return (
                                    <PersonCard
                                        key={'person_' + i}
                                        person={item}
                                        index={i}
                                    />
                                );
                            }
                            return (
                                <div className='aspect-square border p-2 overflow-scroll'>
                                    Unsupported media type
                                    <pre className='whitespace-pre-wrap text-pretty'>
                                        {JSON.stringify({ item }, null, 2)}
                                    </pre>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className='mt-12 flex items-center justify-center gap-4'>
                        {page > 1 && (
                            <Button asChild variant='outline'>
                                <Link
                                    href={`/search?q=${encodeURIComponent(
                                        query
                                    )}&page=${page - 1}`}>
                                    Previous
                                </Link>
                            </Button>
                        )}

                        <span className=''>
                            Page {page} of {totalPages}
                        </span>

                        {page < totalPages && (
                            <Button asChild>
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

                {!query && (
                    <div className='text-center py-12'>
                        <p className=''>
                            Use the search bar above to find movies
                        </p>
                    </div>
                )}

                {query && items.length === 0 && (
                    <div className='text-center py-12'>
                        <p className=''>
                            No movies or shows found for "{query}"
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}
