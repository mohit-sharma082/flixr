'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ModeToggle() {
    const { setTheme, theme } = useTheme();

    React.useEffect(() => { 
        console.log('Current theme:', theme);
    }, [theme, setTheme]);

    return (
        <Button
            variant='ghost'
            size='icon'
            onClick={() =>
                setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
            }>
            <Sun className='rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
            <Moon className='absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
        </Button>
    );
}
