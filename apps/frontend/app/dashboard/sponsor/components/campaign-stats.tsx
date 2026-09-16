import type { Campaign } from '@/lib/types';
import { StatCard } from '@/app/components/stat-card';

export function CampaignStats({ campaigns }: { campaigns: Campaign[] }) {
  const totalBudget = campaigns.reduce((sum, c) => sum + Number(c.budget), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + Number(c.spent), 0);
  const active = campaigns.filter((c) => c.status === 'ACTIVE').length;
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Campaigns" value={String(campaigns.length)} hint={`${active} active`} />
      <StatCard label="Total budget" value={`$${totalBudget.toLocaleString()}`} />
      <StatCard label="Spent" value={`$${totalSpent.toLocaleString()}`} hint={`${spentPct}% of budget`} />
    </div>
  );
}
