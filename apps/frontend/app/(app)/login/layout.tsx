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

/** Break out of the (app) max-width shell so login can be full-bleed. */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 -my-8 min-h-[calc(100dvh-3.5rem)] overflow-x-clip">
      {children}
    </div>
  );
}
