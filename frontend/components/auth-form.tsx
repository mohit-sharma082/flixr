'use client';

import type React from 'react';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/authSlice';
import { createApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/store'; // typed dispatch (if you exported it)

interface AuthFormProps {
    type: 'login' | 'register';
}

export function AuthForm({ type }: AuthFormProps) {
    const router = useRouter();
    const dispatch = (useDispatch() as any) || useAppDispatch(); // fallback if not exported
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        // basic client-side validation
        if (
            !formData.email ||
            !formData.password ||
            (type === 'register' && !formData.name)
        ) {
            toast({
                title: 'Missing fields',
                description: 'Please fill all required fields',
                variant: 'destructive',
            });
            return;
        }

        setLoading(true);

        try {
            const api = createApi();
            const endpoint =
                type === 'login' ? '/api/auth/login' : '/api/auth/register';

            const response = await api.post(endpoint, formData);
            const { token, user } = response.data;

            // dispatch typed action
            dispatch(setCredentials({ token, user }));

            toast({
                title: 'Success',
                description:
                    type === 'login'
                        ? 'Logged in successfully'
                        : 'Account created successfully',
            });

            router.push('/');
        } catch (error: any) {
            // backend often uses { error: '...' } or { message: '...' }
            const message =
                error?.response?.data?.error ||
                error?.response?.data?.message ||
                error?.message ||
                'Authentication failed';

            toast({
                title: 'Error',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className='w-full max-w-md'>
            <CardHeader>
                <CardTitle>
                    {type === 'login' ? 'Sign In' : 'Create Account'}
                </CardTitle>
                <CardDescription>
                    {type === 'login'
                        ? 'Enter your credentials to sign in'
                        : 'Fill in the details to create a new account'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4' noValidate>
                    {type === 'register' && (
                        <div className='space-y-2'>
                            <Label htmlFor='name'>Name</Label>
                            <Input
                                id='name'
                                name='name'
                                type='text'
                                placeholder='Your name'
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <div className='space-y-2'>
                        <Label htmlFor='email'>Email</Label>
                        <Input
                            id='email'
                            name='email'
                            type='email'
                            placeholder='your@email.com'
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                            id='password'
                            name='password'
                            type='password'
                            placeholder='••••••••'
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <Button type='submit' className='w-full' disabled={loading}>
                        {loading
                            ? 'Loading...'
                            : type === 'login'
                            ? 'Sign In'
                            : 'Create Account'}
                    </Button>

                    <div className='text-center text-sm'>
                        {type === 'login' ? (
                            <>
                                Don&apos;t have an account?{' '}
                                <Link
                                    href='/auth/register'
                                    className='text-blue-600 hover:underline'>
                                    Create one
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <Link
                                    href='/auth/login'
                                    className='text-blue-600 hover:underline'>
                                    Sign in
                                </Link>
                            </>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
