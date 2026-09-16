'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { ViewToggle } from '@/app/components/view-toggle';
import { useViewPreference } from '@/lib/use-view-preference';
import { formatStatusLabel } from '@/lib/campaign-meta';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Filter campaigns" className="flex items-center gap-1">
          {FILTERS.map(({ key, label }) => {
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

        <ViewToggle view={view} onChange={setView} />
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-(--color-border-strong) bg-(--color-surface) px-6 py-12 text-center text-sm text-(--color-muted)">
          No {filter === 'all' ? '' : formatStatusLabel(filter).toLowerCase() + ' '}campaigns.
        </p>
      ) : view === 'card' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-(--color-border) rounded-xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm)">
          {shown.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </ul>
      )}
    </div>
  );
}
