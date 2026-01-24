'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const page = () => {
    const router = useRouter();
    router.replace('/', { scroll: false });

    return (
        <div>
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href='/'>
                <Button>Return Home</Button>
            </Link>
        </div>
    );
};

export default page;
