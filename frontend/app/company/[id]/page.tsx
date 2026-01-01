import { createServerApi } from '@/lib/api';
import type { ImageItem } from '@/lib/interfaces';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Globe, MapPin } from 'lucide-react';
import Image from 'next/image';

function getImageUrl(path: string): string {
    return `https://image.tmdb.org/t/p/original/${path}`;
}

interface CompanyDetails {
    details: {
        description: string;
        headquarters: string;
        homepage: string;
        id: number;
        logo_path?: string | null;
        name: string;
        origin_country: string;
        parent_company: CompanyDetails | null;
    };
    alternativeNames: {
        id: number;
        results: Array<{
            name: string;
            type: string;
        }>;
    };
    images: {
        id: number;
        logos: ImageItem[];
    };
}

export default async function CompanyPage({
    params,
}: {
    params: { id: string };
}) {
    try {
        const id = (await params).id;
        const companyId = Number.parseInt(id as string, 10);

        if (Number.isNaN(companyId)) {
            return <EmptyState message='Invalid company ID.' />;
        }

        const fetchCompanyDetails = async () => {
            try {
                if (isNaN(companyId)) {
                    throw new Error('Invalid company ID');
                }
                const api = createServerApi();
                const res = await api.get('/api/companies/' + companyId);
                return res?.data?.data ?? res?.data ?? res;
            } catch (error) {
                console.error('Error fetching company details:', error);
                return null;
            }
        };

        const company: CompanyDetails = await fetchCompanyDetails();
        console.log('Company Details:', company);

        if (!company) {
            return <EmptyState message='Company not found.' />;
        }

        return (
            <main className='min-h-screen bg-background text-foreground'>
                <div className='sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-border'>
                    <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
                        <Link href='/'>
                            <Button variant='ghost' size='sm'>
                                <ArrowLeft className='w-4 h-4 mr-2' />
                                Back
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                    <CompanyHeader company={company.details} />

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 my-12'>
                        <CompanyInfo company={company.details} />
                    </div>

                    {company.alternativeNames?.results &&
                        company.alternativeNames.results.length > 0 && (
                            <AlternativeNames
                                names={company.alternativeNames.results}
                            />
                        )}

                    {company.images?.logos &&
                        company.images.logos.length > 0 && (
                            <LogosGallery logos={company.images.logos} />
                        )}
                </div>
            </main>
        );
    } catch (error: any) {
        console.error('Error in CompanyPage:', error);
        return <EmptyState message='An unexpected error occurred.' />;
    }
}

function EmptyState({ message }: { message: string }) {
    return (
        <main className='min-h-screen flex items-center justify-center'>
            <div className='text-center'>
                <p className='text-muted-foreground text-lg mb-4'>{message}</p>
                <Link href='/'>
                    <Button>Back to Home</Button>
                </Link>
            </div>
        </main>
    );
}

interface AlternativeName {
    name: string;
    type: string;
}

function AlternativeNames({ names }: { names: AlternativeName[] }) {
    return (
        <div className='my-12'>
            <h2 className='text-2xl font-bold text-foreground mb-6'>
                Alternative Names
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                {names.map((alt, index) => (
                    <Card
                        key={index}
                        className='bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors p-4'>
                        <p className='text-sm text-muted-foreground mb-1'>
                            {alt.type}
                        </p>
                        <p className='text-foreground font-medium'>
                            {alt.name}
                        </p>
                    </Card>
                ))}
            </div>
        </div>
    );
}

interface CompanyDetailsData {
    logo_path?: string | null;
    name: string;
    description: string;
    origin_country: string;
}

function CompanyHeader({ company }: { company: CompanyDetailsData }) {
    return (
        <div className='mb-12'>
            <div className='flex flex-col sm:flex-row items-start gap-8'>
                {company?.logo_path && (
                    <div className='flex-shrink-0'>
                        <div className='w-24 h-24 bg-card rounded-lg overflow-hidden border border-border flex items-center justify-center p-2'>
                            <Image
                                src={
                                    getImageUrl(company.logo_path) ||
                                    '/placeholder.svg'
                                }
                                alt={company.name}
                                width={96}
                                height={96}
                                className='object-contain'
                            />
                        </div>
                    </div>
                )}

                <div className='flex-1'>
                    <h1 className='text-4xl sm:text-5xl font-bold text-foreground mb-2'>
                        {company.name}
                    </h1>
                    <p className='text-sm text-muted-foreground mb-4'>
                        {company.origin_country}
                    </p>
                    {company.description && (
                        <p className='text-lg text-foreground/80 leading-relaxed max-w-2xl'>
                            {company.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

interface CompanyDetailsData {
    homepage: string;
    headquarters: string;
    parent_company: any;
}

function CompanyInfo({ company }: { company: CompanyDetailsData }) {
    return (
        <div className='lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <Card className='bg-card/50 backdrop-blur-sm border-border'>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                        <MapPin className='w-5 h-5 text-primary' />
                        Headquarters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-foreground/80'>
                        {company.headquarters || 'Not available'}
                    </p>
                </CardContent>
            </Card>

            <Card className='bg-card/50 backdrop-blur-sm border-border'>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                        <Globe className='w-5 h-5 text-primary' />
                        Website
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {company.homepage ? (
                        <a
                            href={company.homepage}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-sm text-primary hover:text-primary/80 underline truncate'>
                            Visit Website
                        </a>
                    ) : (
                        <p className='text-sm text-foreground/80'>
                            Not available
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className='bg-card/50 backdrop-blur-sm border-border'>
                <CardHeader className='pb-3'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                        <Building2 className='w-5 h-5 text-primary' />
                        Parent Company
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-foreground/80'>
                        {company.parent_company?.details?.name || 'Independent'}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function LogosGallery({ logos }: { logos: ImageItem[] }) {
    return (
        <div className='my-12'>
            <h2 className='text-2xl font-bold text-foreground mb-6'>
                Company Logos
            </h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                {logos.map((logo, index) => (
                    <div
                        key={index}
                        className='group relative aspect-square rounded-lg overflow-hidden bg-card/50 border border-border hover:border-primary/50 transition-all duration-300 flex items-center justify-center p-4'>
                        <Image
                            src={
                                getImageUrl(logo.file_path) ||
                                '/placeholder.svg'
                            }
                            alt={`Company logo ${index + 1}`}
                            width={200}
                            height={200}
                            className='object-contain group-hover:scale-105 transition-transform duration-300'
                        />
                        {logo.width && logo.height && (
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                <p className='text-xs text-white font-medium'>
                                    {logo.width} × {logo.height}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
