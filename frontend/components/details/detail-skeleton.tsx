import { Skeleton } from '@/components/ui/skeleton';

/** Loading skeleton that mirrors the Spotlight + rails detail layout. */
export function DetailSkeleton() {
    return (
        <div className='min-h-screen bg-background'>
            {/* Hero */}
            <div className='relative min-h-[60vh] w-full bg-muted/20'>
                <div className='mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-28 sm:px-6 lg:flex-row lg:items-end lg:px-8'>
                    <Skeleton className='aspect-2/3 w-28 rounded-xl sm:w-48 lg:w-60' />
                    <div className='flex-1 space-y-4'>
                        <Skeleton className='h-6 w-40' />
                        <Skeleton className='h-12 w-3/4 max-w-xl' />
                        <Skeleton className='h-4 w-1/2 max-w-md' />
                        <div className='flex gap-3 pt-2'>
                            <Skeleton className='h-11 w-36 rounded-md' />
                            <Skeleton className='h-11 w-11 rounded-full' />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stat bar */}
            <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
                <Skeleton className='h-20 w-full rounded-xl' />
            </div>

            {/* Rails */}
            {[0, 1].map((r) => (
                <div key={r} className='px-4 py-6 sm:px-6 lg:px-8'>
                    <Skeleton className='mb-4 h-7 w-48' />
                    <div className='flex gap-4 overflow-hidden'>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton
                                key={i}
                                className='aspect-2/3 w-32 shrink-0 rounded-xl'
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
