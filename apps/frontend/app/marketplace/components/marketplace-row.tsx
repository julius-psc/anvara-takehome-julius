import Link from 'next/link';
import type { AdSlot } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';

// Compact horizontal row for the list view — same data as MarketplaceCard, denser.
export function MarketplaceRow({ adSlot }: { adSlot: AdSlot }) {
  const meta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = meta?.icon;

  return (
    <li>
      <Link
        href={`/marketplace/${adSlot.id}`}
        className="flex items-center gap-4 px-4 py-3 transition-colors duration-150 ease-out hover:bg-(--color-surface-hover)"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-medium text-(--color-foreground)">{adSlot.name}</h3>
            <Badge tone={meta?.tone ?? 'neutral'}>
              {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
              {meta?.label ?? adSlot.type}
            </Badge>
            {adSlot.publisher && (
              <span className="truncate text-xs text-(--color-muted)">by {adSlot.publisher.name}</span>
            )}
          </div>
          {adSlot.description && (
            <p className="mt-0.5 truncate text-sm text-(--color-muted)">{adSlot.description}</p>
          )}
        </div>

        <span className="hidden items-center gap-1.5 text-sm sm:inline-flex">
          <span
            className={`h-1.5 w-1.5 rounded-full ${adSlot.isAvailable ? 'bg-(--color-success)' : 'bg-(--color-subtle)'}`}
          />
          <span className={adSlot.isAvailable ? 'text-(--color-success)' : 'text-(--color-muted)'}>
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
        </span>

        <span className="font-numeric text-sm font-semibold text-(--color-foreground)">
          ${Number(adSlot.basePrice).toLocaleString()}
          <span className="font-normal text-(--color-muted)">/mo</span>
        </span>
      </Link>
    </li>
  );
}
