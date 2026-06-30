export interface Stat {
    label: string;
    value: string;
}

/** Compact stat strip under the hero. Empty values are dropped automatically. */
export function StatBar({ items }: { items: Stat[] }) {
    const stats = items.filter((s) => s.value);
    if (!stats.length) return null;
    return (
        <div className='px-4 sm:px-6 lg:px-8'>
            <dl className='flex flex-wrap gap-x-8 gap-y-4 rounded-xl border border-white/10 bg-background/30 px-5 py-4 backdrop-blur-sm'>
                {stats.map((s) => (
                    <div key={s.label} className='min-w-[6rem]'>
                        <dt className='text-xs uppercase tracking-wide text-muted-foreground'>
                            {s.label}
                        </dt>
                        <dd className='mt-0.5 font-semibold'>{s.value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
