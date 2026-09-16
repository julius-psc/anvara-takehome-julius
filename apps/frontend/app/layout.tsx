import type { Metadata, Viewport } from 'next';
import type { CSSProperties } from 'react';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import './globals.css';
import { Nav } from './components/nav';

export const metadata: Metadata = {
  title: {
    default: 'Anvara — Sponsorship Marketplace',
    template: '%s · Anvara',
  },
  description: 'The marketplace connecting sponsors with publishers.',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description: 'The marketplace connecting sponsors with publishers.',
    type: 'website',
    siteName: 'Anvara',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara — Sponsorship Marketplace',
    description: 'The marketplace connecting sponsors with publishers.',
  },
};

export const viewport: Viewport = {
  themeColor: '#fbfbfa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen antialiased">
        <Nav />
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
        <Toaster
          theme="system"
          position="bottom-right"
          richColors
          closeButton
          style={{ '--width': 'fit-content' } as CSSProperties}
          toastOptions={{
            classNames: {
              toast:
                '!w-fit !max-w-[min(22rem,calc(100vw-2rem))] !min-w-0 !py-2.5 !px-3.5 !gap-2.5',
              title: '!text-sm !font-medium !leading-snug',
              description: '!text-xs !leading-snug !opacity-90',
              content: '!gap-0.5',
              icon: '!size-4',
            },
          }}
        />
      </body>
    </html>
  );
}
