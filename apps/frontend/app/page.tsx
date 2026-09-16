import type { Metadata } from 'next';
import { Landing } from './components/landing/landing';

export const metadata: Metadata = {
  title: {
    absolute: 'Anvara — Sponsorship marketplace for sponsors & publishers',
  },
  description:
    'Anvara connects sponsors with publishers. Browse transparent ad inventory, set campaign budgets, and fill placements in one marketplace.',
  openGraph: {
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Book premium placements or list your inventory. One marketplace for sponsors and publishers.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Book premium placements or list your inventory. One marketplace for sponsors and publishers.',
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return <Landing />;
}
