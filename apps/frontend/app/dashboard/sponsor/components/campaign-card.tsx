import type { Campaign } from '@/lib/types';
import { Badge, type BadgeTone } from '@/app/components/badge';
import { CampaignActions } from './campaign-actions';

const statusTone: Record<string, BadgeTone> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  APPROVED: 'info',
  ACTIVE: 'success',
  PAUSED: 'warning',
  COMPLETED: 'info',
  CANCELLED: 'danger',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  const budget = Number(campaign.budget);
  const spent = Number(campaign.spent);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  return (
    <div className="flex flex-col rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-balance font-medium leading-snug text-(--color-foreground)">
          {campaign.name}
        </h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <Badge tone={statusTone[campaign.status] ?? 'neutral'}>
            {campaign.status.toLowerCase().replace('_', ' ')}
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
        <div className="flex items-baseline justify-between text-sm">
          <span className="font-numeric font-medium">${spent.toLocaleString()}</span>
          <span className="font-numeric text-(--color-muted)">of ${budget.toLocaleString()}</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-(--color-border)">
          <div
            className="h-full rounded-full bg-(--color-accent) transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <p className="mt-3 font-numeric text-xs text-(--color-muted)">
        {formatDate(campaign.startDate)} – {formatDate(campaign.endDate)}
      </p>
    </div>
  );
}
