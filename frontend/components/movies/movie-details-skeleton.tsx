import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function MovieDetailsSkeleton() {
    return (
        <div className='relative min-h-screen'>
            {/* Hero section skeleton */}
            <div className='relative h-[70vh] w-full bg-muted/30'>
                <div className='absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent bottom-0 h-1/3' />

                <div className='absolute bottom-0 left-0 right-0 p-6'>
                    <div className='container mx-auto'>
                        <div className='flex flex-col md:flex-row gap-8 items-end md:items-end'>
                            <Skeleton className='hidden md:block h-[300px] w-[200px] rounded-lg' />

                            <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-2'>
                                    <Skeleton className='h-6 w-20 rounded-full' />
                                    <Skeleton className='h-6 w-16 rounded-full' />
                                </div>

                                <Skeleton className='h-12 w-3/4 mb-2' />

                                <div className='flex flex-wrap gap-2 mb-4'>
                                    <Skeleton className='h-6 w-20 rounded-full' />
                                    <Skeleton className='h-6 w-24 rounded-full' />
                                    <Skeleton className='h-6 w-16 rounded-full' />
                                </div>

                                <div className='flex items-center gap-6 mb-4'>
                                    <Skeleton className='h-12 w-28' />
                                    <Skeleton className='h-6 w-32' />
                                    <Skeleton className='h-6 w-24' />
                                </div>

                                <div className='flex gap-2 mt-4'>
                                    <Skeleton className='h-10 w-36 rounded-md' />
                                    <Skeleton className='h-10 w-10 rounded-full' />
                                    <Skeleton className='h-10 w-10 rounded-full' />
                                    <Skeleton className='h-10 w-10 rounded-full' />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content section skeleton */}
            <div className='container mx-auto px-4 py-8'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                    <div className='md:col-span-2'>
                        <Tabs defaultValue='overview' className='w-full'>
                            <TabsList className='mb-6'>
                                <TabsTrigger value='overview'>
                                    Overview
                                </TabsTrigger>
                                <TabsTrigger value='cast'>
                                    Cast & Crew
                                </TabsTrigger>
                                <TabsTrigger value='media'>Media</TabsTrigger>
                            </TabsList>

                            <TabsContent value='overview' className='space-y-6'>
                                <div>
                                    <Skeleton className='h-8 w-40 mb-4' />
                                    <Skeleton className='h-4 w-full mb-2' />
                                    <Skeleton className='h-4 w-full mb-2' />
                                    <Skeleton className='h-4 w-3/4' />
                                </div>

                                <Skeleton className='h-px w-full' />

                                <div>
                                    <Skeleton className='h-8 w-32 mb-4' />
                                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                        {[...Array(6)].map((_, i) => (
                                            <div key={i}>
                                                <Skeleton className='h-4 w-24 mb-2' />
                                                <Skeleton className='h-6 w-40' />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <div>
                        <Skeleton className='md:hidden h-[300px] w-full rounded-lg mb-6' />

                        <Card>
                            <CardContent className='p-6'>
                                <Skeleton className='h-8 w-40 mb-4' />
                                <div className='space-y-4'>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className='flex gap-3'>
                                            <Skeleton className='h-20 w-14 rounded' />
                                            <div className='flex-1'>
                                                <Skeleton className='h-5 w-3/4 mb-2' />
                                                <Skeleton className='h-4 w-16 mb-2' />
                                                <Skeleton className='h-3 w-10' />
                                            </div>
                                        </div>
                                    ))}

                                    <Skeleton className='h-10 w-full rounded-md' />
                                </div>
                            </CardContent>
                        </Card>

                        <div className='mt-6'>
                            <Skeleton className='h-8 w-32 mb-4' />
                            <div className='flex flex-wrap gap-2'>
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className='h-6 w-16 rounded-full'
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
