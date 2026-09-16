import { IconCalendar } from '@tabler/icons-react';
import type { Campaign } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { CAMPAIGN_STATUS_TONE, formatStatusLabel } from '@/lib/campaign-meta';
import { CampaignActions } from './campaign-actions';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Compact horizontal row for the list view — same data as CampaignCard, denser.
export function CampaignRow({ campaign }: { campaign: Campaign }) {
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const spendPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const spendLabel = `$${spent.toLocaleString()} spent of $${budget.toLocaleString()}`;
  const dateLabel = `${formatDate(campaign.startDate)} – ${formatDate(campaign.endDate)}`;

  return (
    <li className="flex items-center gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-(--color-foreground)">{campaign.name}</h3>
          <Badge tone={CAMPAIGN_STATUS_TONE[campaign.status] ?? 'neutral'}>
            {formatStatusLabel(campaign.status)}
          </Badge>
        </div>
        {campaign.description && (
          <p className="mt-0.5 truncate text-sm text-(--color-muted)">{campaign.description}</p>
        )}
      </div>

      <div className="group relative hidden sm:block">
        <button
          type="button"
          aria-label={dateLabel}
          className="grid h-7 w-7 place-items-center rounded-md text-(--color-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
        >
          <IconCalendar size={16} stroke={1.5} aria-hidden />
        </button>
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-(--color-tooltip) px-2 py-1 font-numeric text-xs whitespace-nowrap text-(--color-tooltip-fg) opacity-0 shadow-(--shadow-sm) transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {dateLabel}
        </div>
      </div>

      <div className="group relative w-20 shrink-0">
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-border)"
          role="progressbar"
          aria-valuenow={Math.round(spendPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={spendLabel}
        >
          <div
            className="progress-fill h-full w-full rounded-full bg-(--color-accent)"
            style={{
              transform: `scaleX(${Math.max(0, Math.min(spendPct / 100, 1))})`,
            }}
          />
        </div>
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-md bg-(--color-tooltip) px-2 py-1 font-numeric text-xs whitespace-nowrap text-(--color-tooltip-fg) opacity-0 shadow-(--shadow-sm) transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-within:opacity-100"
        >
          {spendLabel}
        </div>
      </div>

      <div className="flex h-7 shrink-0 items-center">
        <CampaignActions campaign={campaign} />
      </div>
    </li>
  );
}
