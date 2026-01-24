'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Clapperboard, Home, Menu, TvMinimalPlay, User } from 'lucide-react';

const FAB_TIMEOUT_MS = 15000; // 10–20s recommended (15s default)

export function FloatingNavFAB() {
    const [open, setOpen] = useState(false);
    const isMobile = useIsMobile();
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isActive = (path: string) => {
        return window.location.pathname.startsWith(path);
    };

    const navigateTo = (path: string) => {
        router.push(path);
    };

    const routes = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Movies', path: '/movie/', icon: Clapperboard },
        { label: 'TV Shows', path: '/tv/', icon: TvMinimalPlay },
        { label: 'Profile', path: '/profile/', icon: User },
    ];

    const resetTimer = () => {
        // if (timerRef.current) clearTimeout(timerRef.current);
        // timerRef.current = setTimeout(() => {
        //     setOpen(false);
        // }, FAB_TIMEOUT_MS);
    };

    const handleOpen = () => {
        setOpen(true);
        resetTimer();
    };

    const handleClose = () => {
        setOpen(false);
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    useEffect(() => {
        if (!open && timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, [open]);

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
                className={cn('fixed  z-50 flex flex-col  gap-3', {
                    'bottom-10 right-4 items-end': isMobile,
                    'bottom-12 left-12': !isMobile,
                })}
                onMouseMove={resetTimer}
                onTouchStart={resetTimer}>
                {/* Action Items */}
                <AnimatePresence>
                    {open &&
                        routes.map((item, index) => (
                            <motion.button
                                key={item.label}
                                className={cn(
                                    'cursor-pointer flex items-center w-fit font-semibold gap-3 rounded-full bg-neutral-900 hover:px-6 transition-all duration-200 hover:border-primary border-primary/10 border-2 px-5 py-3 text-white/90 shadow-lg',
                                    {
                                        'bg-primary text-primary-foreground ':
                                            isActive(item.path),
                                        ' hover:text-white ':
                                            !isActive(item.path),
                                    }
                                )}
                                initial={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 10,
                                }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 10,
                                }}
                                transition={{
                                    delay: index * 0.05,
                                    duration: 0.2,
                                    ease: 'easeIn',
                                }}
                                onClick={() => {
                                    navigateTo(item.path);
                                    handleClose();
                                }}>
                                <item.icon className='w-5 h-5' />
                                {item.label}
                            </motion.button>
                        ))}
                </AnimatePresence>

                {/* Main FAB */}
                <motion.button
                    className='flex h-14 w-14 cursor-pointer hover:border-2 hover:border-primary-foreground items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl relative'
                    whileTap={{ scale: 0.9 }}
                    onClick={() => (open ? handleClose() : handleOpen())}
                    aria-label='Open navigation'>
                    <motion.span
                        animate={{
                            rotate: open ? 45 : 0,
                            opacity: open ? 0 : 1,
                            display: open ? 'none' : 'block',
                        }}
                        transition={{ duration: 0.2 }}
                        className='text-3xl leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                        <Menu className='w-5 h-5' />
                    </motion.span>
                    <motion.span
                        animate={{
                            rotate: open ? 45 : 0,
                            opacity: open ? 1 : 0,

                            display: open ? 'block' : 'none',
                        }}
                        transition={{ duration: 0.2 }}
                        className='text-3xl leading-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                        +
                    </motion.span>
                </motion.button>
            </div>
        </>
    );
}
