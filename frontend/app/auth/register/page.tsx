import { AuthForm } from '@/components/auth-form';

export const metadata = {
    title: 'Create Account - Flixr Community',
    description: 'Create a new Flixr Community account',
};

export default function RegisterPage() {
    return (
        <div className='fixed top-0 left-0 bg-background z-50 h-screen w-screen overflow-scroll flex items-center justify-center min-h-screen '>
            <AuthForm type='register' />
        </div>
    );
}
