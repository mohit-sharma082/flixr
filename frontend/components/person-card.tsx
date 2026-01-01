// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { Badge } from '@/components/ui/badge';
// import { useState } from 'react';
// import { User, Film } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { motion } from 'framer-motion';
// import { Card } from './ui/card';
// import { Person, KnownForItem } from '@/lib/interfaces';

// /** Minimal, reusable PersonCard */
// export function PersonCard({
//     person,
//     index,
// }: {
//     person: Person;
//     index: number;
// }) {
//     const [isHovered, setIsHovered] = useState(false);
//     const [imageError, setImageError] = useState(false);

//     const name = person.name || 'Unknown';
//     const profileUrl = person.profile_path
//         ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
//         : '';

//     if (!profileUrl) console.log('No profile URL for person:', person);

//     const knownFor = Array.isArray(person.known_for)
//         ? person.known_for.slice(0, 2)
//         : [];

//     // helper to show title from known_for item
//     const knownForTitle = (k: KnownForItem) => k.title ?? k.name ?? 'Untitled';

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 12 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.45, delay: 0.06 + index * 0.03 }}
//             className='h-full'>
//             <Link href={`/person/${person.id}`} className='block h-full'>
//                 <Card
//                     className='cursor-pointer border-none relative overflow-hidden transition-all duration-300 rounded-lg group h-full flex flex-col'
//                     onMouseEnter={() => setIsHovered(true)}
//                     onMouseLeave={() => setIsHovered(false)}>
//                     <div className='relative aspect-[2/3] overflow-hidden rounded-lg flex-shrink-0 bg-primary/10'>
//                         {profileUrl && !imageError ? (
//                             <Image
//                                 src={profileUrl}
//                                 alt={name ?? 'profile'}
//                                 fill
//                                 className='object-cover transition-transform duration-500 group-hover:scale-105'
//                                 sizes='(max-width: 640px) 42vw, (max-width: 1024px) 220px, 260px'
//                                 onError={(e) => {
//                                     console.log(e);
//                                     setImageError(true);
//                                 }}
//                                 priority={index < 4}
//                             />
//                         ) : (
//                             <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-primary/20 p-4'>
//                                 <User className='w-10 h-10 text-primary' />
//                                 <br />
//                                 <pre className='whitespace-pre-wrap text-pretty text-sm overflow-scroll z-20'>
//                                     {JSON.stringify(
//                                         { profileUrl, imageError, person },
//                                         null,
//                                         4
//                                     )}
//                                 </pre>
//                             </div>
//                         )}

//                         <div
//                             className={cn(
//                                 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300',
//                                 isHovered ? 'opacity-100' : 'opacity-0'
//                             )}
//                         />

//                         <div
//                             className={cn(
//                                 'absolute top-2 left-2 z-10 transition-opacity duration-300',
//                                 isHovered ? 'opacity-100' : 'opacity-0'
//                             )}>
//                             <Badge
//                                 variant='outline'
//                                 className='bg-black/40 border-none text-white'>
//                                 <User className='w-3 h-3' />
//                                 <span className='text-xs ml-1'>person</span>
//                             </Badge>
//                         </div>

//                         {typeof person.popularity === 'number' && (
//                             <div
//                                 className={cn(
//                                     'absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300',
//                                     isHovered ? 'opacity-100' : 'opacity-0'
//                                 )}
//                                 aria-hidden>
//                                 <Film className='w-3 h-3 text-yellow-300' />
//                                 <span className='text-xs text-white'>
//                                     {person.popularity?.toFixed(1)}
//                                 </span>
//                             </div>
//                         )}
//                     </div>

//                     <div className='mt-2 flex-grow'>
//                         <h3 className='font-medium line-clamp-1 text-sm sm:text-base'>
//                             {name}
//                         </h3>

//                         <div className='mt-2'>
//                             {knownFor.length > 0 ? (
//                                 <div className='text-xs text-muted-foreground'>
//                                     Known for:{' '}
//                                     <span className='font-medium'>
//                                         {knownFor.map((k, i) => (
//                                             <span key={k.id}>
//                                                 {knownForTitle(k)}
//                                                 {i < knownFor.length - 1
//                                                     ? ', '
//                                                     : ''}
//                                             </span>
//                                         ))}
//                                     </span>
//                                 </div>
//                             ) : (
//                                 <div className='text-xs text-muted-foreground'>
//                                     No notable credits
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </Card>
//             </Link>
//         </motion.div>
//     );
// }

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { User, Film } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import type { Person, KnownForItem } from '@/lib/interfaces';

/** Minimal, reusable PersonCard */
export function PersonCard({
    person,
    index,
}: {
    person: Person;
    index: number;
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const name = person.name || 'Unknown';
    const profileUrl = person.profile_path
        ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
        : '';

    const knownFor = Array.isArray(person.known_for)
        ? person.known_for.slice(0, 2)
        : [];

    const getInitials = (fullName: string): string => {
        return fullName
            .split(' ')
            .slice(0, 2)
            .map((word) => word[0])
            .join('')
            .toUpperCase();
    };

    const getGradientColor = (id: number): string => {
        const colors = [
            'from-slate-500 to-slate-700',
            'from-zinc-500 to-zinc-700',
            'from-stone-500 to-stone-700',
            'from-neutral-500 to-neutral-700',
            'from-gray-500 to-gray-700',
        ];
        return colors[id % colors.length];
    };

    // helper to show title from known_for item
    const knownForTitle = (k: KnownForItem) => k.title ?? k.name ?? 'Untitled';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 + index * 0.03 }}
            className='h-full'>
            <Link href={`/person/${person.id}`} className='block h-full'>
                <Card
                    className='cursor-pointer border-none relative overflow-hidden transition-all duration-300 rounded-lg group h-full flex flex-col'
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}>
                    <div className='relative aspect-[2/3] overflow-hidden rounded-lg flex-shrink-0 bg-primary/10'>
                        {profileUrl && !imageError ? (
                            <Image
                                src={profileUrl || '/placeholder.svg'}
                                alt={name ?? 'profile'}
                                fill
                                className='object-cover transition-transform duration-500 group-hover:scale-105'
                                sizes='(max-width: 640px) 42vw, (max-width: 1024px) 220px, 260px'
                                onError={() => setImageError(true)}
                                priority={index < 4}
                            />
                        ) : (
                            <div
                                className={cn(
                                    'w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br p-4',
                                    getGradientColor(person.id)
                                )}>
                                <Avatar className='h-16 w-16 border-2 border-white/30'>
                                    <AvatarFallback className='bg-white/10 text-white text-lg font-semibold'>
                                        {getInitials(name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                        )}

                        <div
                            className={cn(
                                'absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent transition-opacity duration-300',
                                isHovered ? 'opacity-100' : 'opacity-0'
                            )}
                        />

                        <div
                            className={cn(
                                'absolute top-2 left-2 z-10 transition-opacity duration-300',
                                isHovered ? 'opacity-100' : 'opacity-0'
                            )}>
                            <Badge
                                variant='outline'
                                className='bg-black/40 border-none text-white'>
                                <User className='w-3 h-3' />
                                <span className='text-xs ml-1'>person</span>
                            </Badge>
                        </div>

                        {typeof person.popularity === 'number' && (
                            <div
                                className={cn(
                                    'absolute bottom-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 transition-all duration-300',
                                    isHovered ? 'opacity-100' : 'opacity-0'
                                )}
                                aria-hidden>
                                <Film className='w-3 h-3 text-yellow-300' />
                                <span className='text-xs text-white'>
                                    {person.popularity?.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className='mt-2 flex-grow'>
                        <h3 className='font-medium line-clamp-1 text-sm sm:text-base'>
                            {name}
                        </h3>

                        <div className='mt-2'>
                            {knownFor.length > 0 ? (
                                <div className='text-xs text-muted-foreground'>
                                    Known for:{' '}
                                    <span className='font-medium'>
                                        {knownFor.map((k, i) => (
                                            <span key={k.id}>
                                                {knownForTitle(k)}
                                                {i < knownFor.length - 1
                                                    ? ', '
                                                    : ''}
                                            </span>
                                        ))}
                                    </span>
                                </div>
                            ) : (
                                <div className='text-xs text-muted-foreground'>
                                    No notable credits
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            </Link>
        </motion.div>
    );
}
