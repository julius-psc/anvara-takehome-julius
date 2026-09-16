'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { ViewToggle } from '@/app/components/view-toggle';
import { FilterTabs } from '@/app/components/filter-tabs';
import { useViewPreference } from '@/lib/use-view-preference';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import { Pagination, usePagination } from '@/app/components/pagination';
import { EmptyState } from '@/app/components/empty-state';
import { AnimatedListRegion } from '@/app/components/animated-list-region';
import { AdSlotCard } from './ad-slot-card';
import { AdSlotRow } from './ad-slot-row';

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

// Client-side status + type filters and view toggle over server-fetched ad slots.
export function AdSlotBrowser({ adSlots }: { adSlots: AdSlot[] }) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [view, setView] = useViewPreference('anvara.publisher.view');

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
  const { page, setPage, pageSize, slice } = usePagination(shown.length, `${status}:${type}`);
  const pageItems = slice(shown);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            aria-label="Filter by availability"
            layoutId="publisher-status-pill"
            value={status}
            onChange={setStatus}
            options={STATUS_FILTERS.map(({ key, label }) => ({
              key,
              label,
              count: statusCounts[key],
            }))}
          />

          <ViewToggle view={view} onChange={setView} />
        </div>

        <FilterTabs
          aria-label="Filter by type"
          layoutId="publisher-type-pill"
          value={type}
          onChange={setType}
          options={TYPE_FILTERS.map(({ key, label }) => {
            const Icon = key !== 'all' ? AD_SLOT_TYPE_META[key]?.icon : null;
            return {
              key,
              label,
              count: typeCounts[key],
              icon: Icon ? <Icon size={14} stroke={1.8} aria-hidden /> : undefined,
            };
          })}
        />
      </div>

      <AnimatedListRegion regionKey={`${status}:${type}:${view}:${page}`}>
        {shown.length === 0 ? (
          <EmptyState
            title="No matching ad slots"
            description="Try a different availability or type filter to see more of your inventory."
          />
        ) : view === 'card' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((slot) => (
              <AdSlotCard key={slot.id} adSlot={slot} />
            ))}
          </div>
        ) : (
          <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) [&>li:first-child]:rounded-t-xl [&>li:last-child]:rounded-b-xl">
            {pageItems.map((slot) => (
              <AdSlotRow key={slot.id} adSlot={slot} />
            ))}
          </ul>
        )}
      </AnimatedListRegion>
      {shown.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={shown.length} onPageChange={setPage} />
      )}
    </div>
  );
}
