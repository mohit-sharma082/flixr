import type React from 'react';
import type { Metadata } from 'next';

import { Analytics } from '@vercel/analytics/next';
// @ts-ignore
import './globals.css';
import ReduxProvider from '../providers/ReduxProvider';

import { Toaster } from '@/components/ui/toaster';
import { JetBrains_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import { Header } from '@/components/header';
import { ThemeProvider } from '@/components/theme-provider';
import ClickSpark from '@/components/reactbits/click-spark';
import { FloatingNavFAB } from '@/components/floating-nav';

// Initialize fonts
const jetBrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains-mono',
});

const font = Plus_Jakarta_Sans({
    subsets: ['latin'],
    variable: '--font-plus-jakarta-sans',
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
                className={`font-sans antialiased ${font.variable} ${font.className}`}>
                <ThemeProvider
                    attribute='class'
                    defaultTheme='system'
                    enableSystem
                    disableTransitionOnChange>
                    <ReduxProvider>
                        {/* <Header /> */}
                        <FloatingNavFAB />
                        <ClickSpark
                            sparkColor='#fff'
                            sparkSize={10}
                            sparkRadius={15}
                            sparkCount={8}
                            duration={400}>
                            {children}
                        </ClickSpark>
                    </ReduxProvider>
                    <Analytics />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
