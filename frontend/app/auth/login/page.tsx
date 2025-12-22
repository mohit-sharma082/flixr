import { AuthForm } from '@/components/auth-form';

export const metadata = {
    title: 'Sign In - TMDB Community',
    description: 'Sign in to your TMDB Community account',
};

export default function LoginPage() {
    return (
        <div className='fixed top-0 left-0 bg-background z-50 h-screen w-screen overflow-scroll flex items-center justify-center min-h-screen '>
            <AuthForm type='login' />
        </div>
    );
}
