'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { Clapperboard, Home, TvMinimalPlay, User, X, Menu, Search } from 'lucide-react';
import { SearchCommand } from '@/components/search/search-command';

const FAB_TIMEOUT_MS = 15000;

const routes = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Movies', path: '/movie', icon: Clapperboard },
    { label: 'TV Shows', path: '/tv', icon: TvMinimalPlay },
    { label: 'Profile', path: '/profile', icon: User },
];

function isActive(pathname: string, routePath: string) {
    if (routePath === '/') return pathname === '/';
    return pathname === routePath || pathname.startsWith(routePath + '/');
}

export function FloatingNavFAB() {
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const isMobile = useIsMobile();
    const router = useRouter();
    const pathname = usePathname();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startCloseTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(false), FAB_TIMEOUT_MS);
    };

    const cancelTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const handleOpen = () => {
        setOpen(true);
        startCloseTimer();
    };

    const handleClose = () => {
        setOpen(false);
        cancelTimer();
    };

    const handleInteraction = () => {
        if (open) startCloseTimer();
    };

    // Cancel timer and close menu when route changes
    useEffect(() => {
        handleClose();
    }, [pathname]);

    // Cleanup on unmount
    useEffect(() => () => cancelTimer(), []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen((v) => !v);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className='fixed inset-0 z-40 bg-black/40'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                    />
                )}
            </AnimatePresence>

            {/* FAB Container */}
            <div
                className={cn('fixed z-50 flex flex-col gap-3', {
                    'bottom-10 right-4 items-end': isMobile,
                    'bottom-12 left-12 items-start': !isMobile,
                })}
                onMouseMove={handleInteraction}
                onTouchStart={handleInteraction}>

                {/* Nav Items — rendered above FAB, reversed so first item is closest to button */}
                <AnimatePresence>
                    {open && (
                        <motion.button
                            key='search'
                            onClick={() => { setSearchOpen(true); handleClose(); }}
                            className={cn(
                                'cursor-pointer flex items-center w-fit font-semibold gap-3 rounded-full px-5 py-3 text-sm shadow-lg border-2',
                                'bg-neutral-900 text-white/90 border-primary/10 hover:border-primary hover:px-6 transition-colors',
                            )}
                            initial={{ opacity: 0, scale: 0.85, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 12 }}
                            transition={{ delay: routes.length * 0.05, duration: 0.18, ease: 'easeOut' }}>
                            <Search className='w-4 h-4 shrink-0' />
                            Search
                        </motion.button>
                    )}
                    {open &&
                        [...routes].reverse().map((item, i) => {
                            const active = isActive(pathname, item.path);
                            return (
                                <motion.button
                                    key={item.label}
                                    className={cn(
                                        'cursor-pointer flex items-center w-fit font-semibold gap-3 rounded-full px-5 py-3 text-sm shadow-lg border-2 transition-colors duration-150',
                                        active
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-neutral-900 text-white/90 border-primary/10 hover:border-primary hover:px-6',
                                    )}
                                    initial={{ opacity: 0, scale: 0.85, y: 12 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.85, y: 12 }}
                                    transition={{
                                        delay: i * 0.05,
                                        duration: 0.18,
                                        ease: 'easeOut',
                                    }}
                                    onClick={() => {
                                        router.push(item.path);
                                        handleClose();
                                    }}>
                                    <item.icon className='w-4 h-4 shrink-0' />
                                    {item.label}
                                </motion.button>
                            );
                        })}
                </AnimatePresence>

                {/* Main FAB */}
                <motion.button
                    className='flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl border-2 border-transparent hover:border-primary-foreground/30 transition-colors'
                    whileTap={{ scale: 0.9 }}
                    onClick={() => (open ? handleClose() : handleOpen())}
                    aria-label={open ? 'Close navigation' : 'Open navigation'}>
                    <motion.span
                        animate={{ rotate: open ? 90 : 0, opacity: open ? 0 : 1 }}
                        transition={{ duration: 0.2 }}
                        className='absolute'>
                        <Menu className='w-5 h-5' />
                    </motion.span>
                    <motion.span
                        animate={{ rotate: open ? 0 : -90, opacity: open ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                        className='absolute'>
                        <X className='w-5 h-5' />
                    </motion.span>
                </motion.button>
            </div>

            <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
        </>
    );
}
