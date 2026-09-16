import { getMarketplaceAdSlots } from '@/lib/data';
import { MarketplaceBrowser } from './marketplace-browser';

// Async Server Component: fetches the public marketplace listings on the server
// and streams in via the <Suspense> boundary in page.tsx. A failed fetch throws
// and bubbles to the route's error boundary (error.tsx).
export async function AdSlotGrid() {
  const adSlots = await getMarketplaceAdSlots();

  if (adSlots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-16 text-center text-sm text-(--color-muted)">
        No ad slots available at the moment.
      </div>
    );
  }

  return <MarketplaceBrowser adSlots={adSlots} />;
}
