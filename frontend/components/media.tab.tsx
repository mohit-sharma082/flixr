'use client';

import { useState, useEffect } from 'react';
import { useMemo } from 'react';
import Image from 'next/image';
import { Movie, ImageItem, ImageResponse } from '@/lib/interfaces';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Film,
    ImageIcon,
    Monitor,
    Maximize2,
    Search,
    X,
    SlidersHorizontal,
    FileImage,
} from 'lucide-react';
interface FilterOptions {
    minWidth: string;
    maxWidth: string;
    minHeight: string;
    maxHeight: string;
}

// instead of taking movie as a prop, we take the media data directly, to be able to use it for tv shows aswell

interface MediaTabProps {
    images?: {
        backdrops: ImageItem[];
        logos: ImageItem[];
        posters: ImageItem[];
    };
    videos?: any[];
}

const MediaTab = (props: MediaTabProps) => {
    const { images, videos } = props;
    const [media, setMedia] = useState<ImageResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({
        minWidth: '',
        maxWidth: '',
        minHeight: '',
        maxHeight: '',
    });
    // const videos = useMemo(() => {
    //     return movie?.videos?.results || [];
    // }, [movie.videos]);

    useEffect(() => {
        // console.log('Fetching media for movie ID:', movie);
        // const images = movie?.images ?? {
        //     backdrops: [],
        //     logos: [],
        //     posters: [],
        // };
        // const videos = movie?.videos?.results ?? [];

        if(!images) {
            setError('No media available for this movie.');
            setLoading(false);
            return;
        }

        if (images.backdrops.length === 0 && videos?.length === 0) {
            setError('No media available for this movie.');
            setLoading(false);
            return;
        }
        setMedia({
            backdrops: images.backdrops || [],
            logos: images.logos || [],
            posters: images.posters || [],
            id: 0,
        });
        setLoading(false);
    }, [props]);

    const filteredBackdrops = useMemo(() => {
        if (!media) return [];
        return media.backdrops.filter((img) => {
            const minWidthValid =
                !filters.minWidth || img.width >= parseInt(filters.minWidth);
            const maxWidthValid =
                !filters.maxWidth || img.width <= parseInt(filters.maxWidth);
            const minHeightValid =
                !filters.minHeight || img.height >= parseInt(filters.minHeight);
            const maxHeightValid =
                !filters.maxHeight || img.height <= parseInt(filters.maxHeight);
            return (
                minWidthValid &&
                maxWidthValid &&
                minHeightValid &&
                maxHeightValid
            );
        });
    }, [media, filters]);

    const filteredLogos = useMemo(() => {
        if (!media) return [];
        return media.logos.filter((img) => {
            const minWidthValid =
                !filters.minWidth || img.width >= parseInt(filters.minWidth);
            const maxWidthValid =
                !filters.maxWidth || img.width <= parseInt(filters.maxWidth);
            const minHeightValid =
                !filters.minHeight || img.height >= parseInt(filters.minHeight);
            const maxHeightValid =
                !filters.maxHeight || img.height <= parseInt(filters.maxHeight);
            return (
                minWidthValid &&
                maxWidthValid &&
                minHeightValid &&
                maxHeightValid
            );
        });
    }, [media, filters]);

    const filteredPosters = useMemo(() => {
        if (!media) return [];
        return media.posters.filter((img) => {
            const minWidthValid =
                !filters.minWidth || img.width >= parseInt(filters.minWidth);
            const maxWidthValid =
                !filters.maxWidth || img.width <= parseInt(filters.maxWidth);
            const minHeightValid =
                !filters.minHeight || img.height >= parseInt(filters.minHeight);
            const maxHeightValid =
                !filters.maxHeight || img.height <= parseInt(filters.maxHeight);
            return (
                minWidthValid &&
                maxWidthValid &&
                minHeightValid &&
                maxHeightValid
            );
        });
    }, [media, filters]);

    const getImageUrl = (path: string, size: string = 'w500') => {
        return `https://image.tmdb.org/t/p/${size}${path}`;
    };

    const formatDimensions = (width: number, height: number) => {
        return `${width} × ${height}`;
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minWidth: '',
            maxWidth: '',
            minHeight: '',
            maxHeight: '',
        });
    };

    const hasActiveFilters = () => {
        return Object.values(filters).some((value) => value !== '');
    };

    if (loading) {
        return <MediaTabSkeleton />;
    }

    if (error) {
        return (
            <div className='text-center py-12'>
                <Film className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <h3 className='text-xl font-medium mb-2'>
                    Unable to load media gallery
                </h3>
                <p className='text-muted-foreground max-w-md mx-auto'>
                    {error}
                </p>
            </div>
        );
    }

    if (
        !media ||
        (media.backdrops.length === 0 &&
            media.logos.length === 0 &&
            media.posters.length === 0)
    ) {
        return (
            <div className='text-center py-12'>
                <Film className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <h3 className='text-xl font-medium mb-2'>No media available</h3>
                <p className='text-muted-foreground max-w-md mx-auto'>
                    We couldn't find any images for this movie.
                </p>
            </div>
        );
    }

    return (
        <div className='space-y-10'>
            {/* Filter Controls */}
            <div className='flex flex-col space-y-4'>
                <div className='flex items-center justify-between'>
                    <h2 className='text-2xl font-bold'>Media Gallery</h2>
                    <div className='flex items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setShowFilters(!showFilters)}
                            className='flex items-center gap-1'>
                            <SlidersHorizontal className='w-4 h-4' />
                            Filters
                        </Button>

                        {hasActiveFilters() && (
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={clearFilters}
                                className='flex items-center gap-1 text-muted-foreground'>
                                <X className='w-4 h-4' />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className='bg-muted/30 p-4 rounded-lg space-y-4'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='minWidth'>Min Width</Label>
                                <Input
                                    id='minWidth'
                                    name='minWidth'
                                    type='number'
                                    placeholder='Min width'
                                    value={filters.minWidth}
                                    onChange={handleFilterChange}
                                    className='h-9'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='maxWidth'>Max Width</Label>
                                <Input
                                    id='maxWidth'
                                    name='maxWidth'
                                    type='number'
                                    placeholder='Max width'
                                    value={filters.maxWidth}
                                    onChange={handleFilterChange}
                                    className='h-9'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='minHeight'>Min Height</Label>
                                <Input
                                    id='minHeight'
                                    name='minHeight'
                                    type='number'
                                    placeholder='Min height'
                                    value={filters.minHeight}
                                    onChange={handleFilterChange}
                                    className='h-9'
                                />
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='maxHeight'>Max Height</Label>
                                <Input
                                    id='maxHeight'
                                    name='maxHeight'
                                    type='number'
                                    placeholder='Max height'
                                    value={filters.maxHeight}
                                    onChange={handleFilterChange}
                                    className='h-9'
                                />
                            </div>
                        </div>

                        <div className='flex justify-end'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={clearFilters}
                                className='flex items-center gap-1'>
                                <X className='w-4 h-4' />
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrops Section */}
            {media.backdrops.length > 0 && (
                <div className='space-y-6'>
                    <div className='flex items-center gap-2'>
                        <h3 className='text-xl font-semibold'>Backdrops</h3>
                        <Badge variant='secondary' className='h-5 px-1.5'>
                            {filteredBackdrops.length} /{' '}
                            {media.backdrops.length}
                        </Badge>
                    </div>

                    {filteredBackdrops.length > 0 ? (
                        <ScrollArea className='w-full whitespace-nowrap pb-6'>
                            <div className='flex w-max space-x-4'>
                                {filteredBackdrops.map((backdrop, index) => (
                                    <div
                                        key={index}
                                        className='relative group cursor-pointer'
                                        onClick={() =>
                                            setSelectedImage(backdrop)
                                        }>
                                        <div className='overflow-hidden rounded-md w-[300px]'>
                                            <div className='relative aspect-video'>
                                                <Image
                                                    src={
                                                        getImageUrl(
                                                            backdrop.file_path
                                                        ) || '/placeholder.svg'
                                                    }
                                                    alt={`Backdrop ${
                                                        index + 1
                                                    }`}
                                                    fill
                                                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                                                    sizes='(max-width: 768px) 100vw, 300px'
                                                />
                                                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                                    <Maximize2 className='w-8 h-8 text-white' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='mt-2 flex items-center justify-between'>
                                            <div className='text-xs text-muted-foreground'>
                                                {formatDimensions(
                                                    backdrop.width,
                                                    backdrop.height
                                                )}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <Monitor className='w-3 h-3 text-muted-foreground' />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <ScrollBar orientation='horizontal' />
                        </ScrollArea>
                    ) : (
                        <div className='text-center py-6 bg-muted/20 rounded-lg'>
                            <p className='text-muted-foreground'>
                                No backdrops match your filter criteria
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Logos Section */}
            {media.logos.length > 0 && (
                <>
                    {media.backdrops.length > 0 && <Separator />}

                    <div className='space-y-6'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-xl font-semibold'>Logos</h3>
                            <Badge variant='secondary' className='h-5 px-1.5'>
                                {filteredLogos.length} / {media.logos.length}
                            </Badge>
                        </div>

                        {filteredLogos.length > 0 ? (
                            <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {filteredLogos.map((logo, index) => (
                                    <div
                                        key={index}
                                        className='relative group cursor-pointer'
                                        onClick={() => setSelectedImage(logo)}>
                                        <div className='overflow-hidden rounded-md bg-black/5 p-4 flex items-center justify-center h-[150px]'>
                                            <div className='relative w-full h-full'>
                                                <Image
                                                    src={
                                                        getImageUrl(
                                                            logo.file_path
                                                        ) || '/placeholder.svg'
                                                    }
                                                    alt={`Logo ${index + 1}`}
                                                    fill
                                                    className='object-contain transition-transform duration-300 group-hover:scale-105'
                                                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw'
                                                />
                                                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                                    <Maximize2 className='w-8 h-8 text-white' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='mt-2 flex items-center justify-between'>
                                            <div className='text-xs text-muted-foreground'>
                                                {formatDimensions(
                                                    logo.width,
                                                    logo.height
                                                )}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <FileImage className='w-3 h-3 text-muted-foreground' />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center py-6 bg-muted/20 rounded-lg'>
                                <p className='text-muted-foreground'>
                                    No logos match your filter criteria
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Posters Section */}
            {media.posters.length > 0 && (
                <>
                    {(media.backdrops.length > 0 || media.logos.length > 0) && (
                        <Separator />
                    )}

                    <div className='space-y-6'>
                        <div className='flex items-center gap-2'>
                            <h3 className='text-xl font-semibold'>Posters</h3>
                            <Badge variant='secondary' className='h-5 px-1.5'>
                                {filteredPosters.length} /{' '}
                                {media.posters.length}
                            </Badge>
                        </div>

                        {filteredPosters.length > 0 ? (
                            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5  gap-4'>
                                {filteredPosters.map((poster, index) => (
                                    <div
                                        key={index}
                                        className='relative group cursor-pointer'
                                        onClick={() =>
                                            setSelectedImage(poster)
                                        }>
                                        <div className='overflow-hidden rounded-md'>
                                            <div className='relative aspect-[2/3]'>
                                                <Image
                                                    src={
                                                        getImageUrl(
                                                            poster.file_path
                                                        ) || '/placeholder.svg'
                                                    }
                                                    alt={`Poster ${index + 1}`}
                                                    fill
                                                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                                                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw'
                                                />
                                                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                                    <Maximize2 className='w-8 h-8 text-white' />
                                                </div>
                                            </div>
                                        </div>
                                        <div className='mt-2 flex items-center justify-between'>
                                            <div className='text-xs text-muted-foreground'>
                                                {formatDimensions(
                                                    poster.width,
                                                    poster.height
                                                )}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <ImageIcon className='w-3 h-3 text-muted-foreground' />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center py-6 bg-muted/20 rounded-lg'>
                                <p className='text-muted-foreground'>
                                    No posters match your filter criteria
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Image Viewer Modal */}
            {selectedImage && (
                <div
                    className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'
                    onClick={() => setSelectedImage(null)}>
                    <div
                        className='relative max-w-7xl max-h-[90vh] overflow-hidden'
                        onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={
                                getImageUrl(
                                    selectedImage.file_path,
                                    'original'
                                ) || '/placeholder.svg'
                            }
                            alt='Full size image'
                            width={selectedImage.width}
                            height={selectedImage.height}
                            className='object-contain max-h-[90vh]'
                        />
                        <button
                            className='absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors'
                            onClick={() => setSelectedImage(null)}>
                            <X className='w-6 h-6' />
                        </button>
                        <div className='absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-md text-sm'>
                            {formatDimensions(
                                selectedImage.width,
                                selectedImage.height
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MediaTabSkeleton = () => {
    return (
        <div className='space-y-10'>
            {/* Filter controls skeleton */}
            <div className='flex items-center justify-between'>
                <div className='h-8 w-40 bg-muted rounded-md animate-pulse' />
                <div className='h-8 w-24 bg-muted rounded-md animate-pulse' />
            </div>

            {/* Backdrops skeleton */}
            <div className='space-y-6'>
                <div className='h-6 w-32 bg-muted rounded-md animate-pulse' />

                <div className='flex space-x-4 overflow-hidden pb-6'>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className='w-[300px] space-y-2'>
                            <div className='aspect-video bg-muted rounded-md animate-pulse' />
                            <div className='h-4 w-20 bg-muted rounded-md animate-pulse' />
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Logos skeleton */}
            <div className='space-y-6'>
                <div className='h-6 w-24 bg-muted rounded-md animate-pulse' />

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6'>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className='space-y-2'>
                            <div className='h-[150px] bg-muted rounded-md animate-pulse' />
                            <div className='h-4 w-16 bg-muted rounded-md animate-pulse' />
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Posters skeleton */}
            <div className='space-y-6'>
                <div className='h-6 w-28 bg-muted rounded-md animate-pulse' />

                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className='space-y-2'>
                            <div className='aspect-[2/3] bg-muted rounded-md animate-pulse' />
                            <div className='h-4 w-16 bg-muted rounded-md animate-pulse' />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MediaTab;
