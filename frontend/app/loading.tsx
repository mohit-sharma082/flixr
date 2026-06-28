import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <main className='min-h-screen bg-black'>
            {/* Hero area */}
            <div className='pt-4 px-4 sm:px-6 lg:px-8'>
                <Skeleton className='h-[40vh] md:h-[60vh] w-full rounded-2xl' />
            </div>

            {/* Row title + horizontal card grid */}
            <section className='px-4 sm:px-6 lg:px-8 pt-8 space-y-4'>
                <Skeleton className='h-7 w-56' />
                <div className='flex items-stretch gap-4 overflow-hidden'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className='shrink-0 w-[150px] space-y-2'>
                            <Skeleton className='aspect-[0.7] w-full rounded-lg' />
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-3 w-1/2' />
                        </div>
                    ))}
                </div>
            </section>

            {/* Second row */}
            <section className='px-4 sm:px-6 lg:px-8 pt-8 space-y-4'>
                <Skeleton className='h-7 w-48' />
                <div className='flex items-stretch gap-4 overflow-hidden'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className='shrink-0 w-[150px] space-y-2'>
                            <Skeleton className='aspect-[0.7] w-full rounded-lg' />
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-3 w-1/2' />
                        </div>
                    ))}
                </div>
            </section>

            <div className='h-20' />
        </main>
    );
}
