'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

const page = () => {
    const router = useRouter();
    router.replace('/');

    return <></>;
};

export default page;
