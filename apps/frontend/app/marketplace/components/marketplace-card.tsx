import Link from 'next/link';
import type { AdSlot } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';

export function MarketplaceCard({ adSlot }: { adSlot: AdSlot }) {
  const meta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = meta?.icon;

  return (
    <Link
      href={`/marketplace/${adSlot.id}`}
      className="block rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm) transition-shadow hover:shadow-(--shadow-md)"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-balance font-medium leading-snug text-(--color-foreground)">
          {adSlot.name}
        </h3>
        <Badge tone={meta?.tone ?? 'neutral'}>
          {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
          {meta?.label ?? adSlot.type}
        </Badge>
      </div>

      {adSlot.publisher && (
        <p className="mt-1 text-sm text-(--color-muted)">by {adSlot.publisher.name}</p>
      )}

      {adSlot.description && (
        <p className="mt-1.5 line-clamp-2 text-pretty text-sm text-(--color-muted)">
          {adSlot.description}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${adSlot.isAvailable ? 'bg-(--color-success)' : 'bg-(--color-subtle)'}`}
          />
          <span className={adSlot.isAvailable ? 'text-(--color-success)' : 'text-(--color-muted)'}>
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
        </span>
        <span className="font-numeric text-lg font-semibold">
          ${Number(adSlot.basePrice).toLocaleString()}
          <span className="text-sm font-normal text-(--color-muted)">/mo</span>
        </span>
      </div>
    </Link>
  );
}
