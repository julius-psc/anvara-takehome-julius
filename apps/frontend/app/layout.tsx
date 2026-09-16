import type { Metadata, Viewport } from 'next';
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
      <body className="flex min-h-dvh flex-col antialiased">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Toaster theme="system" position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
