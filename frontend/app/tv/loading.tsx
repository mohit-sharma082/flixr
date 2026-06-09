import { SkeletonGrid } from '@/components/discover/skeleton-grid';

export default function Loading() {
    return (
        <div className='min-h-screen bg-background text-foreground'>
            {/* Fake sticky filter bar */}
            <div className='sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-3 px-4 sm:px-6 lg:px-8'>
                <div className='flex gap-2'>
                    <div className='h-9 w-32 bg-white/5 rounded-md animate-pulse' />
                    <div className='h-9 w-24 bg-white/5 rounded-md animate-pulse' />
                    <div className='h-9 w-24 bg-white/5 rounded-md animate-pulse' />
                </div>
            </div>
            <div className='px-4 sm:px-6 lg:px-8 pt-5 pb-28'>
                <SkeletonGrid />
            </div>
        </div>
    );
}
