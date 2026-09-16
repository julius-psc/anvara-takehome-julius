import { IconCalendar } from '@tabler/icons-react';
import type { Campaign } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { CAMPAIGN_STATUS_TONE, formatStatusLabel } from '@/lib/campaign-meta';
import { CampaignActions } from './campaign-actions';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CampaignCard({
  campaign,
  static: isStatic = false,
}: {
  campaign: Campaign;
  /** Hide edit/delete actions — used in decorative previews. */
  static?: boolean;
}) {
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const spendPct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)">
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-h-7 text-balance font-medium leading-7 text-(--color-foreground)">
              {campaign.name}
            </h3>
            <Badge tone={CAMPAIGN_STATUS_TONE[campaign.status] ?? 'neutral'}>
              {formatStatusLabel(campaign.status)}
            </Badge>
          </div>
          {!isStatic ? (
            <div className="flex h-7 shrink-0 items-center">
              <CampaignActions campaign={campaign} />
            </div>
          ) : null}
        </div>

        {campaign.description ? (
          <p className="line-clamp-2 text-pretty text-sm text-(--color-muted)">
            {campaign.description}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <div>
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
              className="progress-fill h-full w-full rounded-full bg-(--color-accent)"
              style={{
                transform: `scaleX(${Math.max(0, Math.min(spendPct / 100, 1))})`,
              }}
            />
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 font-numeric text-sm text-(--color-muted)">
          <IconCalendar size={14} stroke={1.5} aria-hidden />
          {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
        </span>
      </div>
    </div>
  );
}
