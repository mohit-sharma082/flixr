'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, AlertTriangle, Tv } from 'lucide-react';

interface WhereToWatchProps {
    mediaType: 'movie' | 'tv';
    id: number;
}

interface Provider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
    display_priority?: number;
}

interface RegionProviders {
    link?: string;
    flatrate?: Provider[];
    free?: Provider[];
    ads?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
}

interface WatchProvidersResponse {
    id?: number;
    results?: Record<string, RegionProviders>;
}

// Groups rendered in priority order. TMDB's terms require deep-linking to the
// JustWatch page (the per-region `link`), not directly to each provider.
const GROUPS: { key: keyof RegionProviders; label: string }[] = [
    { key: 'flatrate', label: 'Stream' },
    { key: 'free', label: 'Free' },
    { key: 'ads', label: 'Free with ads' },
    { key: 'rent', label: 'Rent' },
    { key: 'buy', label: 'Buy' },
];

function pickDefaultRegion(regions: string[]): string {
    if (regions.length === 0) return '';
    // Prefer the browser's region, then US, then the first available.
    const locale =
        typeof navigator !== 'undefined' ? navigator.language : 'en-US';
    const browserRegion = locale.split('-')[1]?.toUpperCase();
    if (browserRegion && regions.includes(browserRegion)) return browserRegion;
    if (regions.includes('US')) return 'US';
    return regions[0];
}

function ProviderRow({
    label,
    providers,
    link,
}: {
    label: string;
    providers: Provider[];
    link?: string;
}) {
    return (
        <div className='space-y-2'>
            <h4 className='text-sm font-medium text-muted-foreground'>
                {label}
            </h4>
            <ul className='flex flex-wrap gap-3'>
                {providers.map((p) => {
                    const logo = (
                        <span className='flex items-center gap-2'>
                            {p.logo_path ? (
                                // Small fixed-size third-party logo; plain <img> avoids
                                // coupling provider domains to next/image remotePatterns.
                                <img
                                    src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                                    alt={p.provider_name}
                                    width={40}
                                    height={40}
                                    loading='lazy'
                                    className='h-10 w-10 rounded-md object-cover border border-white/10'
                                />
                            ) : (
                                <span className='flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-background/40 text-xs'>
                                    {p.provider_name.slice(0, 2)}
                                </span>
                            )}
                            <span className='text-sm'>{p.provider_name}</span>
                        </span>
                    );
                    return (
                        <li key={p.provider_id}>
                            {link ? (
                                <a
                                    href={link}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    title={`Watch on ${p.provider_name} (via JustWatch)`}
                                    className='flex min-h-[44px] items-center rounded-lg border border-white/10 bg-background/30 px-3 py-2 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-background/50'>
                                    {logo}
                                </a>
                            ) : (
                                <span className='flex min-h-[44px] items-center rounded-lg border border-white/10 bg-background/30 px-3 py-2'>
                                    {logo}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function WhereToWatch({ mediaType, id }: WhereToWatchProps) {
    const [results, setResults] = useState<Record<string, RegionProviders>>({});
    const [region, setRegion] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchProviders = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const api = createApi();
            const base = mediaType === 'movie' ? 'movies' : 'tv';
            const res = await api.get<WatchProvidersResponse>(
                `/api/${base}/${id}/watch-providers`
            );
            const data = res.data?.results ?? {};
            setResults(data);
            setRegion(pickDefaultRegion(Object.keys(data)));
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [mediaType, id]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const regions = useMemo(() => Object.keys(results).sort(), [results]);
    const current: RegionProviders | undefined = results[region];
    const hasAny =
        !!current &&
        GROUPS.some((g) => (current[g.key] as Provider[] | undefined)?.length);

    return (
        <section
            aria-labelledby='where-to-watch-heading'
            className='space-y-4 p-1'>
            <div className='flex flex-wrap items-center gap-3'>
                <div className='flex items-center gap-2'>
                    <Tv className='h-5 w-5 text-primary' aria-hidden='true' />
                    <h3
                        id='where-to-watch-heading'
                        className='text-xl font-semibold'>
                        Where to Watch
                    </h3>
                </div>
                {regions.length > 0 && (
                    <label className='ms-auto flex items-center gap-2 text-sm text-muted-foreground'>
                        Region
                        <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className='min-h-[44px] rounded-md border border-white/10 bg-background/40 px-2 py-1 text-foreground'>
                            {regions.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            {loading && (
                <p className='text-sm text-muted-foreground' role='status'>
                    Loading availability…
                </p>
            )}

            {!loading && error && (
                <Card className='border-destructive/40'>
                    <CardContent className='flex items-center gap-3'>
                        <AlertTriangle className='h-5 w-5 text-destructive' />
                        <p className='text-sm text-muted-foreground'>
                            We couldn&apos;t load watch availability right now.
                            Please try again later.
                        </p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && !hasAny && (
                <Card>
                    <CardContent className='text-center text-muted-foreground'>
                        No streaming, rental, or purchase options are listed for
                        this title{region ? ` in ${region}` : ''}.
                    </CardContent>
                </Card>
            )}

            {!loading && !error && hasAny && current && (
                <div className='space-y-5'>
                    {GROUPS.map((g) => {
                        const providers = current[g.key] as
                            | Provider[]
                            | undefined;
                        if (!providers?.length) return null;
                        return (
                            <ProviderRow
                                key={g.key}
                                label={g.label}
                                providers={providers}
                                link={current.link}
                            />
                        );
                    })}
                </div>
            )}

            {/* TMDB API terms require crediting the JustWatch source for this data. */}
            {!loading && !error && (
                <p className='pt-2 text-xs text-muted-foreground'>
                    Streaming availability data provided by{' '}
                    {current?.link ? (
                        <a
                            href={current.link}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 underline hover:text-foreground'>
                            JustWatch
                            <ExternalLink
                                className='h-3 w-3'
                                aria-hidden='true'
                            />
                        </a>
                    ) : (
                        'JustWatch'
                    )}
                    .
                </p>
            )}
        </section>
    );
}
