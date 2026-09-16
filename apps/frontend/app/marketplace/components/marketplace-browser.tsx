'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { ViewToggle } from '@/app/components/view-toggle';
import { useViewPreference } from '@/lib/use-view-preference';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import { MarketplaceCard } from './marketplace-card';
import { MarketplaceRow } from './marketplace-row';

type StatusFilter = 'all' | 'available' | 'booked';
type TypeFilter = 'all' | AdSlot['type'];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'available', label: 'Available' },
  { key: 'booked', label: 'Booked' },
];

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All types' },
  ...Object.entries(AD_SLOT_TYPE_META).map(([key, meta]) => ({
    key: key as AdSlot['type'],
    label: meta.label,
  })),
];

function statusChipClass(active: boolean) {
  return `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-(--color-foreground) text-white'
      : 'text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-foreground)'
  }`;
}

// Softer selected state so the type row reads as secondary to availability.
function typeChipClass(active: boolean) {
  return `inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
    active
      ? 'bg-(--color-surface-hover) text-(--color-foreground)'
      : 'text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-foreground)'
  }`;
}

// Client-side status + type filters and view toggle over server-fetched listings.
// Data still streams from the Server Component; this only owns which subset is
// shown and how. The view choice persists across reloads.
export function MarketplaceBrowser({ adSlots }: { adSlots: AdSlot[] }) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [view, setView] = useViewPreference('anvara.marketplace.view');

  // Each filter's counts respect the other axis, so tabs stay honest as you narrow.
  const byStatus =
    status === 'available'
      ? adSlots.filter((s) => s.isAvailable)
      : status === 'booked'
        ? adSlots.filter((s) => !s.isAvailable)
        : adSlots;
  const byType = type === 'all' ? adSlots : adSlots.filter((s) => s.type === type);

  const statusCounts: Record<StatusFilter, number> = {
    all: byType.length,
    available: byType.filter((s) => s.isAvailable).length,
    booked: byType.filter((s) => !s.isAvailable).length,
  };
  const typeCounts: Record<TypeFilter, number> = {
    all: byStatus.length,
    DISPLAY: byStatus.filter((s) => s.type === 'DISPLAY').length,
    VIDEO: byStatus.filter((s) => s.type === 'VIDEO').length,
    NATIVE: byStatus.filter((s) => s.type === 'NATIVE').length,
    NEWSLETTER: byStatus.filter((s) => s.type === 'NEWSLETTER').length,
    PODCAST: byStatus.filter((s) => s.type === 'PODCAST').length,
  };

  const shown = byStatus.filter((s) => (type === 'all' ? true : s.type === type));

  const emptyLabel = [
    status !== 'all' ? status : null,
    type !== 'all' ? AD_SLOT_TYPE_META[type]?.label.toLowerCase() : null,
    'ad slots',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Filter by availability" className="flex flex-wrap items-center gap-1">
            {STATUS_FILTERS.map(({ key, label }) => {
              const active = status === key;
              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatus(key)}
                  className={statusChipClass(active)}
                >
                  {label}
                  <span className={`font-numeric ${active ? 'text-white/60' : 'text-(--color-subtle)'}`}>
                    {statusCounts[key]}
                  </span>
                </button>
              );
            })}
          </div>

          <ViewToggle view={view} onChange={setView} />
        </div>

        <div role="tablist" aria-label="Filter by type" className="flex flex-wrap items-center gap-1">
          {TYPE_FILTERS.map(({ key, label }) => {
            const active = type === key;
            const Icon = key !== 'all' ? AD_SLOT_TYPE_META[key]?.icon : null;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setType(key)}
                className={typeChipClass(active)}
              >
                {Icon && <Icon size={14} stroke={1.8} aria-hidden />}
                {label}
                <span className={`font-numeric ${active ? 'text-(--color-muted)' : 'text-(--color-subtle)'}`}>
                  {typeCounts[key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-12 text-center text-sm text-(--color-muted)">
          No {emptyLabel}.
        </p>
      ) : view === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((slot) => (
            <MarketplaceCard key={slot.id} adSlot={slot} />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) overflow-hidden rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm)">
          {shown.map((slot) => (
            <MarketplaceRow key={slot.id} adSlot={slot} />
          ))}
        </ul>
      )}
    </div>
  );
}
