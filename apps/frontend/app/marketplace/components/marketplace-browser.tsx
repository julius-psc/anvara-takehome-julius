'use client';

import { useCallback, useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { ViewToggle } from '@/app/components/view-toggle';
import { FilterTabs } from '@/app/components/filter-tabs';
import { Modal } from '@/app/components/modal';
import { useViewPreference } from '@/lib/use-view-preference';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import { Pagination, usePagination } from '@/app/components/pagination';
import { EmptyState } from '@/app/components/empty-state';
import { AdSlotDetail } from '../[id]/components/ad-slot-detail';
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

// Client-side status + type filters and view toggle over server-fetched listings.
export function MarketplaceBrowser({ adSlots }: { adSlots: AdSlot[] }) {
  const [status, setStatus] = useState<StatusFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [view, setView] = useViewPreference('anvara.marketplace.view');
  const [selected, setSelected] = useState<AdSlot | null>(null);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  const closeModal = useCallback(() => setSelected(null), []);

  const withOverrides = adSlots.map((slot) =>
    slot.id in overrides ? { ...slot, isAvailable: overrides[slot.id] } : slot
  );

  const byStatus =
    status === 'available'
      ? withOverrides.filter((s) => s.isAvailable)
      : status === 'booked'
        ? withOverrides.filter((s) => !s.isAvailable)
        : withOverrides;
  const byType = type === 'all' ? withOverrides : withOverrides.filter((s) => s.type === type);

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

  const selectedLive = selected
    ? withOverrides.find((s) => s.id === selected.id) ?? selected
    : null;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            aria-label="Filter by availability"
            layoutId="marketplace-status-pill"
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
          layoutId="marketplace-type-pill"
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

      {shown.length === 0 ? (
        <EmptyState
          title="No matching ad slots"
          description="Try another availability or type filter to browse more placements."
        />
      ) : (
        <>
          {view === 'card' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((slot) => (
                <MarketplaceCard key={slot.id} adSlot={slot} onOpen={setSelected} />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) [&>li:first-child]:rounded-t-xl [&>li:last-child]:rounded-b-xl">
              {pageItems.map((slot) => (
                <MarketplaceRow key={slot.id} adSlot={slot} onOpen={setSelected} />
              ))}
            </ul>
          )}
          <Pagination page={page} pageSize={pageSize} total={shown.length} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={!!selectedLive}
        onClose={closeModal}
        title={selectedLive?.name ?? 'Ad slot'}
        hideTitle
        showClose
        panelClassName="relative z-10 w-full max-w-md animate-modal-in rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-md) outline-none"
      >
        {selectedLive && (
          <AdSlotDetail
            key={selectedLive.id}
            id={selectedLive.id}
            initialSlot={selectedLive}
            variant="modal"
            onAvailabilityChange={(isAvailable) => {
              setOverrides((prev) => ({ ...prev, [selectedLive.id]: isAvailable }));
            }}
          />
        )}
      </Modal>
    </div>
  );
}
