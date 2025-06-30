'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from './components/ThemeProvider';
import ThemeToggle from './components/ThemeToggle';
import { AuthProvider } from './components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

// Note: metadata must be moved to a separate layout file since it's a server-side concern
const metadata = {
  title: 'ShelfIt - Track Your Borrowed & Lent Items',
  description: 'Keep track of items you\'ve borrowed or lent to others',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen">
              <header className="border-b dark:border-gray-700">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                  <h1 className="text-2xl font-bold">ShelfIt</h1>
                  <div className="flex items-center gap-4">
                    <ThemeToggle />
                  </div>
                </div>
              </header>
              <main className="container mx-auto px-4 py-8">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 