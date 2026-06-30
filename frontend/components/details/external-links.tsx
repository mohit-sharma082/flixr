import { ExternalLink } from 'lucide-react';
import { ExternalIds } from '@/lib/interfaces';

/** Official-site + IMDb + social links built from TMDB external_ids. */
export function ExternalLinks({
    externalIds,
    homepage,
}: {
    externalIds?: ExternalIds;
    homepage?: string | null;
}) {
    const links: { label: string; href: string }[] = [];
    if (homepage) links.push({ label: 'Official site', href: homepage });
    if (externalIds?.imdb_id)
        links.push({
            label: 'IMDb',
            href: `https://www.imdb.com/title/${externalIds.imdb_id}`,
        });
    if (externalIds?.instagram_id)
        links.push({
            label: 'Instagram',
            href: `https://instagram.com/${externalIds.instagram_id}`,
        });
    if (externalIds?.twitter_id)
        links.push({
            label: 'X / Twitter',
            href: `https://twitter.com/${externalIds.twitter_id}`,
        });
    if (externalIds?.facebook_id)
        links.push({
            label: 'Facebook',
            href: `https://facebook.com/${externalIds.facebook_id}`,
        });

    if (!links.length) return null;
    return (
        <div className='flex flex-wrap gap-2'>
            {links.map((l) => (
                <a
                    key={l.label}
                    href={l.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-white/10 bg-background/40 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-background/60'>
                    {l.label}
                    <ExternalLink className='h-3.5 w-3.5' aria-hidden='true' />
                </a>
            ))}
        </div>
    );
}
