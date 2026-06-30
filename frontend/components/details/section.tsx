import { ReactNode } from 'react';

/** Section heading used across detail rails/sections (DESIGN.md: text-2xl font-semibold). */
export function SectionHeading({
    title,
    action,
}: {
    title: string;
    action?: ReactNode;
}) {
    return (
        <div className='mb-4 flex items-center justify-between gap-4'>
            <h2 className='text-2xl font-semibold tracking-tight'>{title}</h2>
            {action}
        </div>
    );
}

/** A vertical content section with a scroll anchor + standard page padding. */
export function Section({
    id,
    title,
    action,
    children,
}: {
    id?: string;
    title?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section id={id} className='scroll-mt-20 px-4 py-6 sm:px-6 lg:px-8'>
            {title && <SectionHeading title={title} action={action} />}
            {children}
        </section>
    );
}

/**
 * Horizontal snap rail (DESIGN.md: overflow-x-auto + snap + trailing spacer).
 * Children are the rail items (cards/thumbnails).
 */
export function Rail({
    id,
    title,
    action,
    children,
}: {
    id?: string;
    title: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section id={id} className='scroll-mt-20 py-6'>
            <div className='px-4 sm:px-6 lg:px-8'>
                <SectionHeading title={title} action={action} />
            </div>
            <div className='flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-4 pb-2 sm:px-6 lg:px-8'>
                {children}
                <div className='w-8 shrink-0' aria-hidden='true' />
            </div>
        </section>
    );
}
