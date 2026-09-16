'use client';

import type { AdSlot } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';

interface Props {
  adSlot: AdSlot;
  onOpen: (adSlot: AdSlot) => void;
}

export function MarketplaceCard({ adSlot, onOpen }: Props) {
  const meta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = meta?.icon;
  const dimmed = !adSlot.isAvailable;

  return (
    <a
      href={`/marketplace/${adSlot.id}`}
      onClick={(e) => {
        // Keep modified clicks (new tab / window) as real navigation.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(adSlot);
      }}
      className={`pressable block rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm) transition-[box-shadow,transform,opacity] duration-150 ease-out hover:shadow-(--shadow-md) ${
        dimmed ? 'opacity-60 hover:opacity-80' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h3 className="text-balance font-medium leading-snug text-(--color-foreground)">
          {adSlot.name}
        </h3>
        <Badge tone={meta?.tone ?? 'neutral'}>
          {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
          {meta?.label ?? adSlot.type}
        </Badge>
      </div>

      {adSlot.publisher && (
        <p className="mt-1 text-sm text-(--color-subtle)">by {adSlot.publisher.name}</p>
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
    </a>
  );
}
