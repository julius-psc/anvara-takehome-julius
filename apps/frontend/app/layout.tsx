import type { Metadata, Viewport } from 'next';
import { Playfair_Display } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Toaster } from 'sonner';
import './globals.css';
import { Nav } from './components/nav';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap',
});

const siteUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3847';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Anvara — Sponsorship Marketplace',
    template: '%s · Anvara',
  },
  description:
    'Anvara connects sponsors with publishers. Browse transparent ad inventory, set campaign budgets, and fill placements in one marketplace.',
  applicationName: 'Anvara',
  keywords: [
    'sponsorship marketplace',
    'ad slots',
    'publishers',
    'sponsors',
    'campaigns',
    'media buying',
  ],
  authors: [{ name: 'Anvara' }],
  creator: 'Anvara',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Book premium placements or list your inventory. One marketplace for sponsors and publishers.',
    type: 'website',
    siteName: 'Anvara',
    locale: 'en_US',
    url: siteUrl,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Book premium placements or list your inventory. One marketplace for sponsors and publishers.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfa' },
    { media: '(prefers-color-scheme: dark)', color: '#141414' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${playfairDisplay.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <Nav />
        <main className="flex flex-1 flex-col">{children}</main>
        <Toaster theme="system" position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
