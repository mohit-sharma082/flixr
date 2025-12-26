'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Credits, Crew, Movie } from '@/lib/interfaces';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Film, User2, Award } from 'lucide-react';
import Link from 'next/link';

const CastAndCrewTab = ({ credits: CREDITS }: { credits: Credits }) => {
    const credits = useMemo(() => CREDITS ?? { crew: [], cast: [] }, [CREDITS]);

    // Group crew by department
    const crewByDepartment =
        credits?.crew.reduce<Record<string, Crew[]>>((acc, crewMember) => {
            if (!acc[crewMember.department]) {
                acc[crewMember.department] = [];
            }
            acc[crewMember.department].push(crewMember);
            return acc;
        }, {}) || {};

    // Sort departments by importance
    const sortedDepartments = Object.keys(crewByDepartment).sort((a, b) => {
        const priority = [
            'Directing',
            'Writing',
            'Production',
            'Sound',
            'Camera',
            'Editing',
        ];
        return priority.indexOf(a) - priority.indexOf(b);
    });

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

    if (!credits || (credits.cast.length === 0 && credits.crew.length === 0)) {
        return (
            <div className='text-center py-12'>
                <Film className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
                <h3 className='text-xl font-medium mb-2'>
                    No cast & crew information available
                </h3>
                <p className='text-muted-foreground max-w-md mx-auto'>
                    We couldn't find any cast or crew information for this
                    movie.
                </p>
            </div>
        );
    }

    return (
        <div className='space-y-10'>
            {/* Cast Section */}
            <div className='space-y-6'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-2xl font-bold'>Cast</h2>
                    {credits.cast.length > 0 && (
                        <Badge variant='secondary' className='h-5 px-1.5'>
                            {credits.cast.length}
                        </Badge>
                    )}
                </div>

                {credits.cast.length > 0 ? (
                    <div className='flex  flex-wrap gap-4'>
                        {credits.cast.map((person, i) => (
                            <Link key={i} href={`/person/${person.id}`}>
                                <div className='w-[120px] md:w-[150px] space-y-3'>
                                    <div className='overflow-hidden rounded-md'>
                                        <Avatar className='h-[120px] md:h-[150px] w-[120px] md:w-[150px] rounded-md'>
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
                                                <AvatarFallback className='bg-muted text-4xl'>
                                                    {getInitials(person.name)}
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
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-8'>
                        <User2 className='h-10 w-10 mx-auto text-muted-foreground mb-3' />
                        <p className='text-muted-foreground'>
                            No cast information available
                        </p>
                    </div>
                )}
            </div>

            <Separator />

            {/* Crew Section */}
            <div className='space-y-6'>
                <div className='flex items-center gap-2'>
                    <h2 className='text-2xl font-bold'>Crew</h2>
                    {credits.crew.length > 0 && (
                        <Badge variant='secondary' className='h-5 px-1.5'>
                            {credits.crew.length}
                        </Badge>
                    )}
                </div>

                {sortedDepartments.length > 0 ? (
                    <div className='space-y-8'>
                        {sortedDepartments.map((department) => (
                            <div key={department} className='space-y-4'>
                                <h3 className='text-xl font-semibold'>
                                    {department}
                                </h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                                    {crewByDepartment[department].map(
                                        (person) => (
                                            <div
                                                key={person.credit_id}
                                                className='flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors'>
                                                <Avatar className='h-12 w-12 rounded-md'>
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
                                                        <AvatarFallback className='bg-muted text-sm'>
                                                            {getInitials(
                                                                person.name
                                                            )}
                                                        </AvatarFallback>
                                                    )}
                                                </Avatar>
                                                <div>
                                                    <p className='font-medium text-sm leading-none'>
                                                        {person.name}
                                                    </p>
                                                    <p className='text-xs text-muted-foreground mt-1'>
                                                        {person.job}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                                {department !==
                                    sortedDepartments[
                                        sortedDepartments.length - 1
                                    ] && <Separator className='mt-6' />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-8'>
                        <Award className='h-10 w-10 mx-auto text-muted-foreground mb-3' />
                        <p className='text-muted-foreground'>
                            No crew information available
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const CastAndCrewSkeleton = () => {
    return (
        <div className='space-y-10'>
            {/* Cast section skeleton */}
            <div className='space-y-6'>
                <div className='h-8 w-32 bg-muted rounded-md animate-pulse' />

                <div className='flex space-x-4 overflow-hidden pb-6'>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className='w-[150px] space-y-3'>
                            <div className='h-[150px] w-[150px] bg-muted rounded-md animate-pulse' />
                            <div className='h-4 w-3/4 bg-muted rounded-md animate-pulse' />
                            <div className='h-3 w-1/2 bg-muted rounded-md animate-pulse' />
                        </div>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Crew section skeleton */}
            <div className='space-y-6'>
                <div className='h-8 w-32 bg-muted rounded-md animate-pulse' />

                {[...Array(3)].map((_, i) => (
                    <div key={i} className='space-y-4'>
                        <div className='h-6 w-40 bg-muted rounded-md animate-pulse' />

                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                            {[...Array(4)].map((_, j) => (
                                <div
                                    key={j}
                                    className='flex items-center gap-3 p-2'>
                                    <div className='h-12 w-12 bg-muted rounded-md animate-pulse' />
                                    <div className='space-y-2'>
                                        <div className='h-4 w-24 bg-muted rounded-md animate-pulse' />
                                        <div className='h-3 w-16 bg-muted rounded-md animate-pulse' />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {i < 2 && <Separator className='mt-6' />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CastAndCrewTab;
