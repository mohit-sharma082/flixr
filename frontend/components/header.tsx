'use client';

import type React from 'react';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { selectCurrentUser, selectToken } from '@/store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '@/components/ui/drawer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { ModeToggle } from './mode-toggle';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './ui/sheet';
import { Menu, Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Header() {
    const router = useRouter();
    const dispatch = useDispatch();
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const user = useSelector(selectCurrentUser);
    const token = useSelector(selectToken);
    const [searchQuery, setSearchQuery] = useState('');
    const rootPagesWithoutHeader = [
        '/auth',
        '/search',
        '/movie',
        '/tv',
        '/person',
        '/company'
    ];

    // const searchTimeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !token) {
            // Token exists but Redux state is empty - could trigger hydration of user data
            // For now, we rely on the layout to handle this
        }
    }, []);

    const handleSearch = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (searchQuery.trim()) {
                router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                setSearchQuery('');
            }
        },
        [searchQuery, router]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleLogout = () => {
        dispatch(logout());
        router.push('/');
    };

    if (rootPagesWithoutHeader.some((path) => pathname.startsWith(path))) {
        return null;
    }

    return (
        <header className='sticky top-0 z-50  bg-background/90 backdrop-blur-lg '>
            <div className=' px-4 sm:px-6 lg:px-8 py-4'>
                <div className='flex items-center justify-between gap-4'>
                    <Link
                        href='/'
                        className='text-xl font-bold flex items-center gap-2'>
                        <div className='p-0.5 bg-foreground/60 rounded-lg'>
                            <Image
                                src='/icon-512.png'
                                alt='Flixr Logo'
                                width={28}
                                height={28}
                            />
                        </div>
                        TMDB
                    </Link>

                    {isMobile ? null : (
                        <form
                            onSubmit={handleSearch}
                            className='flex-1 max-w-md'>
                            <Input
                                type='search'
                                placeholder='Search movies, shows, people...'
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className='w-full'
                            />
                        </form>
                    )}

                    <div className='flex items-center gap-2'>
                        {isMobile ? (
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <Button variant='outline' size={'icon'}>
                                        <Search />
                                    </Button>
                                </DrawerTrigger>
                                <DrawerContent>
                                    <DrawerHeader>
                                        <DrawerTitle>Search</DrawerTitle>
                                        <DrawerDescription>
                                            Search your favourite movies, shows
                                            and people
                                        </DrawerDescription>
                                    </DrawerHeader>
                                    <form
                                        onSubmit={handleSearch}
                                        className='flex-1 max-w-md p-4'>
                                        <Input
                                            type='search'
                                            placeholder='misson impossible...'
                                            value={searchQuery}
                                            onChange={handleSearchChange}
                                            className='w-full'
                                        />
                                    </form>
                                    <DrawerFooter className='flex gap-4'>
                                        <Button>Search</Button>
                                        <DrawerClose>
                                            <Button variant='destructive'>
                                                Cancel
                                            </Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>
                        ) : null}
                        <ModeToggle />
                        {token && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant='outline'>
                                        {user.email}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                    <DropdownMenuItem asChild>
                                        <Link href='/profile'>Profile</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SheetWrapper isMobile={isMobile}>
                                <Button variant='ghost' asChild>
                                    <Link href='/auth/login'>Sign In</Link>
                                </Button>
                                <Button asChild>
                                    <Link href='/auth/register'>Register</Link>
                                </Button>
                            </SheetWrapper>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

const SheetWrapper = ({
    children,
    isMobile = true,
    className,
}: {
    children: React.ReactNode;
    className?: string;
    isMobile?: boolean;
}) => {
    if (isMobile)
        return (
            <Sheet>
                <SheetTrigger>
                    <div className='p-2 hover:bg-accent/50 rounded'>
                        <Menu size={20} />
                    </div>
                </SheetTrigger>
                <SheetContent side='left' className='w-[18rem] px-[1rem]'>
                    <SheetHeader className='text-left p-6 tracking-wider'>
                        <SheetTitle className='invisible'>Title</SheetTitle>
                    </SheetHeader>
                    {children}
                </SheetContent>
            </Sheet>
        );
    return children;
};
