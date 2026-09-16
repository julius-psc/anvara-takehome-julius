import { IconCalendar } from '@tabler/icons-react';
import type { Campaign } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { CAMPAIGN_STATUS_TONE, formatStatusLabel } from '@/lib/campaign-meta';
import { CampaignActions } from './campaign-actions';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const spendPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div className="flex flex-col rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-balance font-medium leading-snug text-(--color-foreground)">
          {campaign.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge tone={CAMPAIGN_STATUS_TONE[campaign.status] ?? 'neutral'}>
            {formatStatusLabel(campaign.status)}
          </Badge>
          <CampaignActions campaign={campaign} />
        </div>
      </div>

      {campaign.description && (
        <p className="mt-1.5 line-clamp-2 text-pretty text-sm text-(--color-muted)">
          {campaign.description}
        </p>
      )}

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-numeric text-lg font-semibold text-(--color-foreground)">
            ${spent.toLocaleString()}
            <span className="ml-1.5 text-sm font-normal text-(--color-muted)">spent</span>
          </span>
          <span className="font-numeric text-xs text-(--color-muted)">
            of ${budget.toLocaleString()}
          </span>
        </div>
        <div
          className="mt-2 h-1 w-full overflow-hidden rounded-full bg-(--color-border)"
          role="progressbar"
          aria-valuenow={Math.round(spendPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${Math.round(spendPct)}% of budget spent`}
        >
          <div
            className="h-full rounded-full bg-(--color-accent) transition-[width] duration-300 ease-out"
            style={{ width: `${spendPct}%` }}
          />
        </div>
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 font-numeric text-sm text-(--color-muted)">
        <IconCalendar size={14} stroke={1.5} aria-hidden />
        {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
      </span>
    </div>
  );
}
