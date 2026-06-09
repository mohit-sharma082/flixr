export function SkeletonGrid() {
    return (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8 auto-rows-max'>
            {[...Array(18)].map((_, i) => (
                <div key={i} className='w-full space-y-3'>
                    <div className='aspect-[2/3] w-full rounded-xl bg-gradient-to-br from-white/8 to-white/2 animate-pulse shimmer' />
                    <div className='space-y-2'>
                        <div className='h-4 w-4/5 rounded-md bg-white/5 animate-pulse' />
                        <div className='h-3 w-1/2 rounded-md bg-white/3 animate-pulse' />
                    </div>
                </div>
            ))}
        </div>
    );
}
