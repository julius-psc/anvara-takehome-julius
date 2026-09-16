import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdSlotGrid } from './components/ad-slot-grid';
import { AdSlotGridSkeleton } from './components/ad-slot-grid-skeleton';

export const metadata: Metadata = {
  title: 'Marketplace',
  description:
    'Browse available ad slots from publishers — display, video, native, newsletter, and podcast inventory with transparent pricing.',
  openGraph: {
    title: 'Marketplace · Anvara',
    description: 'Browse available ad slots from publishers with transparent pricing.',
    url: '/marketplace',
  },
  alternates: {
    canonical: '/marketplace',
  },
};

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Marketplace</h1>
        <p className="mt-0.5 text-sm text-(--color-muted)">
          Browse available ad slots from our publishers.
        </p>
      </div>

      {/* Header renders immediately; the listings stream in when ready. */}
      <Suspense fallback={<AdSlotGridSkeleton />}>
        <AdSlotGrid />
      </Suspense>
    </div>
  );
}
