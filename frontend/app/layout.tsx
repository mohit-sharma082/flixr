import type React from 'react';
import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/next';
// @ts-ignore
import './globals.css';
import ReduxProvider from '../providers/ReduxProvider';

import { Toaster } from '@/components/ui/toaster';
import { JetBrains_Mono, Handlee } from 'next/font/google';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';

// Initialize fonts
const jetBrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
    title: 'Flixr Community',
    description: 'Community reviews and discussions about your favorite movies',
    icons: ['/favicon.ico'],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body
                className={`font-sans antialiased ${jetBrainsMono.variable} ${jetBrainsMono.className}`}>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                    disableTransitionOnChange>
                    <ReduxProvider>
                        <Header />
                        {children}
                    </ReduxProvider>
                    <Analytics />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
