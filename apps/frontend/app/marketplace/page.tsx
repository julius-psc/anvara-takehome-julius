import { Suspense } from 'react';
import { AdSlotGrid } from './components/ad-slot-grid';
import { AdSlotGridSkeleton } from './components/ad-slot-grid-skeleton';

// TODO: server-side pagination + filtering (category, price, type) + search via
// searchParams. The listings themselves are now fetched server-side and streamed.

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-(--color-muted)">Browse available ad slots from our publishers</p>
      </div>

      {/* Header renders immediately; the listings stream in when ready. */}
      <Suspense fallback={<AdSlotGridSkeleton />}>
        <AdSlotGrid />
      </Suspense>
    </div>
  );
}
