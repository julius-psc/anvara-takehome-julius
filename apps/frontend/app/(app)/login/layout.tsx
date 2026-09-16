import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Anvara as a sponsor or publisher to manage campaigns and ad inventory.',
  openGraph: {
    title: 'Sign in · Anvara',
    description: 'Sign in to manage campaigns or list your ad inventory.',
    url: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
