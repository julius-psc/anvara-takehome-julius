'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { AdSlotCard } from './ad-slot-card';

type Filter = 'all' | 'available' | 'booked';

// Client-side filter over the already server-fetched ad slots. The data still
// streams in from the Server Component; this only owns which subset is shown, so
// switching filters is instant and needs no refetch.
export function AdSlotBrowser({ adSlots }: { adSlots: AdSlot[] }) {
  const [filter, setFilter] = useState<Filter>('all');

  const available = adSlots.filter((s) => s.isAvailable);
  const booked = adSlots.filter((s) => !s.isAvailable);
  const avgPrice = adSlots.length
    ? Math.round(adSlots.reduce((sum, s) => sum + Number(s.basePrice), 0) / adSlots.length)
    : 0;

  const counts: Record<Filter, number> = {
    all: adSlots.length,
    available: available.length,
    booked: booked.length,
  };
  const shown = filter === 'available' ? available : filter === 'booked' ? booked : adSlots;

  const tabs: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available' },
    { key: 'booked', label: 'Booked' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter ad slots" className="flex items-center gap-1">
          {tabs.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-(--color-foreground) text-white'
                    : 'text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-foreground)'
                }`}
              >
                {label}
                <span className={`font-numeric ${active ? 'text-white/60' : 'text-(--color-subtle)'}`}>
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-(--color-muted)">
          Avg. <span className="font-numeric text-(--color-foreground)">${avgPrice.toLocaleString()}</span>/mo
        </p>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-12 text-center text-sm text-(--color-muted)">
          No {filter} ad slots.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((slot) => (
            <AdSlotCard key={slot.id} adSlot={slot} />
          ))}
        </div>
      )}
    </div>
  );
}
