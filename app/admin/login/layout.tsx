'use client';

import '../../globals.css';
import { Inter, Merriweather } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const merriweather = Merriweather({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap',
});

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${merriweather.variable} dark`} suppressHydrationWarning>
      <head>
        <title>Admin Paneli - Giriş</title>
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
} 