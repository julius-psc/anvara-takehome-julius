'use client';

import type { AdSlot } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';

interface Props {
  adSlot: AdSlot;
  onOpen: (adSlot: AdSlot) => void;
}

// Compact horizontal row for the list view — same data as MarketplaceCard, denser.
export function MarketplaceRow({ adSlot, onOpen }: Props) {
  const meta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = meta?.icon;
  const dimmed = !adSlot.isAvailable;

  return (
    <li>
      <a
        href={`/marketplace/${adSlot.id}`}
        onClick={(e) => {
          // Keep modified clicks (new tab / window) as real navigation.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          e.preventDefault();
          onOpen(adSlot);
        }}
        className={`flex items-center gap-4 px-4 py-3 transition-[color,background-color,opacity] duration-150 ease-out hover:bg-(--color-surface-hover) ${
          dimmed ? 'opacity-60 hover:opacity-80' : ''
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="truncate font-medium text-(--color-foreground)">{adSlot.name}</h3>
            {adSlot.publisher && (
              <span className="truncate text-xs text-(--color-subtle)">
                by {adSlot.publisher.name}
              </span>
            )}
            <Badge tone={meta?.tone ?? 'neutral'}>
              {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
              {meta?.label ?? adSlot.type}
            </Badge>
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
      </a>
    </li>
  );
}
