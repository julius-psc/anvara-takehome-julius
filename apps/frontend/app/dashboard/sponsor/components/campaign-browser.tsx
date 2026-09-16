'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { ViewToggle } from '@/app/components/view-toggle';
import { FilterTabs } from '@/app/components/filter-tabs';
import { useViewPreference } from '@/lib/use-view-preference';
import { formatStatusLabel } from '@/lib/campaign-meta';
import { Pagination, usePagination } from '@/app/components/pagination';
import { EmptyState } from '@/app/components/empty-state';
import { CampaignCard } from './campaign-card';
import { CampaignRow } from './campaign-row';

type Filter = 'all' | Campaign['status'];

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ACTIVE', label: formatStatusLabel('ACTIVE') },
  { key: 'DRAFT', label: formatStatusLabel('DRAFT') },
  { key: 'PAUSED', label: formatStatusLabel('PAUSED') },
  { key: 'COMPLETED', label: formatStatusLabel('COMPLETED') },
];

// Client-side filter + view toggle over the already server-fetched campaigns.
// The data still streams from the Server Component; this only owns which subset
// is shown and how, so both controls are instant and need no refetch. The view
// choice persists across reloads.
export function CampaignBrowser({ campaigns }: { campaigns: Campaign[] }) {
  const [filter, setFilter] = useState<Filter>('all');
  const [view, setView] = useViewPreference('anvara.sponsor.view');

  const counts: Record<Filter, number> = {
    all: campaigns.length,
    ACTIVE: campaigns.filter((c) => c.status === 'ACTIVE').length,
    DRAFT: campaigns.filter((c) => c.status === 'DRAFT').length,
    PAUSED: campaigns.filter((c) => c.status === 'PAUSED').length,
    COMPLETED: campaigns.filter((c) => c.status === 'COMPLETED').length,
  };
  const shown = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);
  const { page, setPage, pageSize, slice } = usePagination(shown.length, filter);
  const pageItems = slice(shown);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          aria-label="Filter campaigns"
          layoutId="campaign-filter-pill"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map(({ key, label }) => ({
            key,
            label,
            count: counts[key],
          }))}
        />

        <ViewToggle view={view} onChange={setView} />
      </div>

      {shown.length === 0 ? (
        <EmptyState
          title={`No ${filter === 'all' ? '' : formatStatusLabel(filter).toLowerCase() + ' '}campaigns`}
          description="Try a different filter, or create a new campaign to get started."
        />
      ) : (
        <>
          {view === 'card' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm) [&>li:first-child]:rounded-t-xl [&>li:last-child]:rounded-b-xl">
              {pageItems.map((campaign) => (
                <CampaignRow key={campaign.id} campaign={campaign} />
              ))}
            </ul>
          )}
          <Pagination page={page} pageSize={pageSize} total={shown.length} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
