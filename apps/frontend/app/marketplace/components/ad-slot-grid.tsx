import Link from 'next/link';
import { getMarketplaceAdSlots } from '@/lib/data';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';

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

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => {
        const meta = AD_SLOT_TYPE_META[slot.type];
        const TypeIcon = meta?.icon;
        return (
          <Link
            key={slot.id}
            href={`/marketplace/${slot.id}`}
            className="block rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm) transition-shadow hover:shadow-(--shadow-md)"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-balance font-medium leading-snug text-(--color-foreground)">
                {slot.name}
              </h3>
              <Badge tone={meta?.tone ?? 'neutral'}>
                {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
                {meta?.label ?? slot.type}
              </Badge>
            </div>

            {slot.publisher && (
              <p className="mt-1 text-sm text-(--color-muted)">by {slot.publisher.name}</p>
            )}

            {slot.description && (
              <p className="mt-1.5 line-clamp-2 text-pretty text-sm text-(--color-muted)">
                {slot.description}
              </p>
            )}

            <div className="mt-4 flex items-end justify-between">
              <span className="inline-flex items-center gap-1.5 text-sm">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${slot.isAvailable ? 'bg-(--color-success)' : 'bg-(--color-subtle)'}`}
                />
                <span className={slot.isAvailable ? 'text-(--color-success)' : 'text-(--color-muted)'}>
                  {slot.isAvailable ? 'Available' : 'Booked'}
                </span>
              </span>
              <span className="font-numeric text-lg font-semibold">
                ${Number(slot.basePrice).toLocaleString()}
                <span className="text-sm font-normal text-(--color-muted)">/mo</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
