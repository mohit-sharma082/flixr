import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImageItem } from '@/lib/interfaces';
import { cn } from '@/lib/utils';

interface PersonPageProps {
    params: { id: string };
}

interface PersonData {
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    profile_path: string | null;
    known_for_department: string;
    popularity: number;
    also_known_as: string[];
    external_ids: {
        imdb_id: string | null;
        twitter_id: string | null;
        instagram_id: string | null;
        facebook_id: string | null;
        youtube_id: string | null;
    };
    combined_credits: {
        cast: Array<{
            id: number;
            title?: string;
            name?: string;
            poster_path: string | null;
            character?: string;
            release_date?: string;
            first_air_date?: string;
            vote_average: number;
            media_type: 'movie' | 'tv';
        }>;
        crew: Array<{
            id: number;
            title?: string;
            overview?: string;
            original_title?: string;
            original_language?: string;
            popularity?: number;
            genre_ids?: number[];
            poster_path: string | null;
            backdrop_path?: string | null;

            department?: string;
            job?: string;
            release_date?: string;
            first_air_date?: string;
            vote_average: number;
            vote_count: number;
            media_type: 'movie' | 'tv';
            adult?: boolean;
        }>;
    };
    images?: {
        profiles?: Array<ImageItem>;
    };
}

export default async function PersonPage({
    params,
}: {
    params: { id: string };
}) {
    const id = (await params).id;
    const personId = Number.parseInt(id as string, 10);
    if (Number.isNaN(personId)) {
        return <EmptyState message='Invalid person ID.' />;
    }
    const fetchPersonDetails = async () => {
        try {
            if (isNaN(personId)) {
                throw new Error('Invalid person ID');
            }
            const apiUrl =
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const response = await fetch(`${apiUrl}/api/people/${personId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch person details');
            }

            const data: PersonData = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching person details:', error);
            return null;
        }
    };

    const person = await fetchPersonDetails();
    // console.log('Fetched person data:', person);

    if (!person) {
        return <EmptyState message='Person not found.' />;
    }

    const imageUrl = person.profile_path
        ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
        : '/placeholder.svg';

    const credits = [...person.combined_credits.cast].sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '';
        const dateB = b.release_date || b.first_air_date || '';
        return dateB.localeCompare(dateA);
    });
    const images = person.images?.profiles || [];

    return (
        <main className='max-h-screen bg-background'>
            <div className='absolute z-0 top-0 left-0 w-screen h-screen'>
                <Image
                    src={imageUrl}
                    alt={person.name}
                    fill
                    className='object-cover rounded opacity-20'
                />
                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent  to-background' />
                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-r from-background via-transparent to-background' />
            </div>
            <section className=' hidden md:block h-screen  m-0 p-0 w-screen  z-10'>
                <div className='z-10 container max-h-screen  mx-auto flex '>
                    <div className='z-10 max-h-svh h-fit p-4 min-w-[300px] flex flex-col gap-4'>
                        <div className='relative w-full  '>
                            <Image
                                src={imageUrl}
                                alt={person.name}
                                width={300}
                                height={390}
                                className='rounded-xl shadow-lg object-cover'
                                priority
                            />
                        </div>
                        <InfoCard
                            label='Known For'
                            value={person.known_for_department}
                        />
                        {person.place_of_birth && (
                            <InfoCard
                                label='Place of Birth'
                                value={person.place_of_birth}
                            />
                        )}
                        {person.birthday && (
                            <InfoCard
                                label='Birthday'
                                value={new Date(person.birthday).toDateString()}
                            />
                        )}
                        {person.deathday && (
                            <InfoCard
                                label='Died'
                                value={new Date(person.deathday).toDateString()}
                            />
                        )}
                        <InfoCard
                            label='Popularity'
                            value={person.popularity.toFixed(1)}
                        />
                    </div>
                    <ScrollArea className='h-screen p-2 '>
                        <div className='flex flex-col gap-6 justify-end  w-full'>
                            {/* <div className='absolute z-0 top-0 left-0 w-full h-full'>
                                <Image
                                    src={imageUrl}
                                    alt={person.name}
                                    fill
                                    className='object-cover rounded opacity-10'
                                />
                                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent  to-background' />
                                <div className='absolute top-0 left-0 w-full h-full bg-gradient-to-r from-background via-transparent to-background' />
                            </div> */}
                            <div className=' pt-4 min-h-[410px] flex flex-col justify-end rounded'>
                                <h1 className='text-4xl font-bold mb-2'>
                                    {person.name}
                                </h1>
                                <div className='flex flex-wrap gap-2 mb-4'>
                                    <Badge variant='secondary'>
                                        {person.known_for_department}
                                    </Badge>
                                    {person.birthday && (
                                        <Badge variant='outline'>
                                            Born{' '}
                                            {new Date(
                                                person.birthday
                                            ).getFullYear()}
                                        </Badge>
                                    )}
                                </div>
                                {person.also_known_as.length > 0 && (
                                    <p className='text-sm text-muted-foreground'>
                                        Also known as:{' '}
                                        {person.also_known_as
                                            .slice(0, 4)
                                            .join(', ')}
                                    </p>
                                )}
                                <SocialLinks ids={person.external_ids} />
                            </div>
                            <div className=' space-y-4'>
                                {/* BIOGRAPHY */}
                                <div
                                    className={cn('', {
                                        'xl:grid items-stretch xl:grid-cols-3 gap-4':
                                            images.length > 0,
                                    })}>
                                    {person.biography && (
                                        <section className='col-span-2'>
                                            <h2 className='text-2xl font-semibold mb-2'>
                                                Biography
                                            </h2>
                                            <div className=' pb-4 text-pretty leading-relaxed text-muted-foreground'>
                                                {person.biography}
                                            </div>
                                        </section>
                                    )}
                                    {/* IMAGES */}
                                    {images?.length <= 0 ? null : (
                                        <section className='xl:col-span-1 w-full '>
                                            <h2 className='text-2xl font-semibold mb-2'>
                                                Images ({images?.length})
                                            </h2>
                                            <div className='grid w-full grid-cols-3 gap-4 max-h-[40vh] overflow-y-scroll'>
                                                {images.map((image, i) => {
                                                    return (
                                                        <div
                                                            key={i}
                                                            className={
                                                                'border rounded relative aspect-square'
                                                            }>
                                                            <Image
                                                                loading='lazy'
                                                                src={
                                                                    'https://image.tmdb.org/t/p/w300' +
                                                                    image.file_path
                                                                }
                                                                alt={`${
                                                                    person.name
                                                                } image ${
                                                                    i + 1
                                                                }`}
                                                                fill
                                                                className='object-cover w-full h-full rounded'
                                                            />
                                                        </div>
                                                    );
                                                })}
                                                <div className='h-10'></div>
                                            </div>
                                        </section>
                                    )}
                                </div>

                                {/* FILMOGRAPHY */}
                                <section>
                                    <h2 className='text-2xl font-semibold mb-2'>
                                        Filmography
                                    </h2>

                                    {credits.length === 0 ? (
                                        <p className='text-muted-foreground'>
                                            No credits available.
                                        </p>
                                    ) : (
                                        <div className='grid grid-cols-2  md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
                                            {credits.map((credit, i) => (
                                                <CreditCard
                                                    key={`${credit.id}-${credit.media_type}`}
                                                    credit={credit}
                                                    index={i}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </section>
            {/* HERO */}
            <section className='z-10 block md:hidden relative border-b border-border'>
                <div className='container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8'>
                    <div className='z-10 relative w-full max-w-[260px] '>
                        <Image
                            src={imageUrl}
                            alt={person.name}
                            width={260}
                            height={390}
                            className='rounded-xl shadow-lg object-cover'
                            priority
                        />
                    </div>

                    <div className='flex flex-col justify-end'>
                        <h1 className='text-4xl font-bold mb-2'>
                            {person.name}
                        </h1>
                        <div className='flex flex-wrap gap-2 mb-4'>
                            <Badge variant='secondary'>
                                {person.known_for_department}
                            </Badge>
                            {person.birthday && (
                                <Badge variant='outline'>
                                    Born{' '}
                                    {new Date(person.birthday).getFullYear()}
                                </Badge>
                            )}
                        </div>
                        {person.also_known_as.length > 0 && (
                            <p className='text-sm text-muted-foreground'>
                                Also known as:{' '}
                                {person.also_known_as.slice(0, 4).join(', ')}
                            </p>
                        )}
                        <SocialLinks ids={person.external_ids} />
                    </div>
                </div>
            </section>

            {/* CONTENT */}
            <section className='z-10 block md:hidden container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10'>
                {/* SIDEBAR */}
                <aside className='z-10  space-y-6 lg:sticky lg:top-24 h-fit'>
                    <InfoCard
                        label='Known For'
                        value={person.known_for_department}
                    />
                    {person.place_of_birth && (
                        <InfoCard
                            label='Place of Birth'
                            value={person.place_of_birth}
                        />
                    )}
                    {person.birthday && (
                        <InfoCard
                            label='Birthday'
                            value={new Date(person.birthday).toDateString()}
                        />
                    )}
                    {person.deathday && (
                        <InfoCard
                            label='Died'
                            value={new Date(person.deathday).toDateString()}
                        />
                    )}
                    <InfoCard
                        label='Popularity'
                        value={person.popularity.toFixed(1)}
                    />
                </aside>

                {/* MAIN */}
                <div className='space-y-12'>
                    {/* BIOGRAPHY */}
                    {person.biography && (
                        <section>
                            <h2 className='text-2xl font-semibold mb-4'>
                                Biography
                            </h2>
                            <Card className='p-6 leading-relaxed text-muted-foreground'>
                                {person.biography}
                            </Card>
                        </section>
                    )}
                    {images?.length <= 0 ? null : (
                        <section>
                            <h2 className='text-2xl font-semibold mb-2'>
                                Images ({images?.length})
                            </h2>
                            <div className='grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4 lg:max-h-[40vh] overflow-y-scroll'>
                                {images.map((image, i) => {
                                    return (
                                        <div
                                            key={i}
                                            className={
                                                'border rounded relative aspect-square'
                                            }>
                                            <Image
                                                loading='lazy'
                                                src={
                                                    'https://image.tmdb.org/t/p/w300' +
                                                    image.file_path
                                                }
                                                alt={`${person.name} image ${
                                                    i + 1
                                                }`}
                                                fill
                                                className='object-cover w-full h-full rounded'
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* FILMOGRAPHY */}
                    <section>
                        <h2 className='text-2xl font-semibold mb-6'>
                            Filmography
                        </h2>

                        {credits.length === 0 ? (
                            <p className='text-muted-foreground'>
                                No credits available.
                            </p>
                        ) : (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4'>
                                {credits.map((credit, i) => (
                                    <CreditCard
                                        key={`${credit.id}-${credit.media_type}`}
                                        credit={credit}
                                        index={i}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
}

/* ------------------------------ */
/* Components                      */
/* ------------------------------ */

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <Card className='p-4 gap-4'>
            <p className='text-xs uppercase text-muted-foreground'>{label}</p>
            <p className='font-medium'>{value}</p>
        </Card>
    );
}

function SocialLinks({ ids }: { ids: PersonData['external_ids'] }) {
    const links = [
        ids.imdb_id && {
            href: `https://www.imdb.com/name/${ids.imdb_id}`,
            label: 'IMDb',
        },
        ids.twitter_id && {
            href: `https://twitter.com/${ids.twitter_id}`,
            label: 'Twitter',
        },
        ids.instagram_id && {
            href: `https://instagram.com/${ids.instagram_id}`,
            label: 'Instagram',
        },
        ids.youtube_id && {
            href: `https://youtube.com/${ids.youtube_id}`,
            label: 'YouTube',
        },
    ].filter(Boolean) as Array<{ href: string; label: string }>;

    if (links.length === 0) return null;

    return (
        <div className='flex gap-3 mt-6 flex-wrap'>
            {links.map((l) => (
                <Link
                    key={l.label}
                    href={l.href}
                    target='_blank'
                    className='text-sm px-4 py-2 rounded-full border bg-accent/50 hover:bg-accent transition group flex items-center gap-2'>
                    {l.label}
                    <ExternalLink
                        size={14}
                        className='hidden group-hover:block'
                    />
                </Link>
            ))}
        </div>
    );
}

function CreditCard({
    credit,
    index,
}: {
    credit: PersonData['combined_credits']['cast'][number];
    index: number;
}) {
    const title = credit.title || credit.name || 'Untitled';
    const date = credit.release_date || credit.first_air_date;
    const image = credit.poster_path
        ? `https://image.tmdb.org/t/p/w300${credit.poster_path}`
        : '/placeholder.svg';
    // console.log('Rendering credit:', credit);

    return (
        <Link key={index} href={`/${credit.media_type}/${credit.id}`}>
            <Card className='overflow-hidden hover:shadow-lg transition p-0'>
                <Image
                    src={image}
                    alt={title}
                    width={300}
                    height={400}
                    className='object-cover '
                />
                <div className='p-3'>
                    <p className='text-sm font-medium line-clamp-2'>{title}</p>
                    {date && (
                        <p className='text-xs text-muted-foreground'>
                            {new Date(date).getFullYear()}
                        </p>
                    )}
                    {credit.character && (
                        <p className=''>as {credit.character}</p>
                    )}
                </div>
            </Card>
        </Link>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <main className='min-h-screen flex items-center justify-center'>
            <p className='text-muted-foreground'>{message}</p>
        </main>
    );
}
