import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import Layout from './layout/layout';
import { Providers } from '../providers/providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'App21',
  description: 'Um novo jeito de organizar sprints',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Layout>
            {children}
            <Toaster
              className="z-[999999999] mx-auto flex w-full justify-end md:text-nowrap"
              visibleToasts={1}
              expand={false}
            />
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
