'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

export const SearchSection = () => {
    const [query, setQuery] = useState('');

    return (
        <div className='w-full p-2 rounded flex items-center '>
            <Input
                type='text'
                placeholder='Search...'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className='w-fit min-w-[20vw] mr-4'
            />
            <Link href={`/search?q=${encodeURIComponent(query)}`}>
                <Button
                    variant={'outline'}
                    className='flex items-center'
                    onClick={() => {
                        // Handle search action
                    }}>
                    <Search />
                    Search
                </Button>
            </Link>
        </div>
    );
};
