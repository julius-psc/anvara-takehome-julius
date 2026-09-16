import type { AdSlot } from '@/lib/types';
import { StatCard } from '@/app/components/stat-card';

export function AdSlotStats({ adSlots }: { adSlots: AdSlot[] }) {
  const available = adSlots.filter((s) => s.isAvailable).length;
  const avgPrice = adSlots.length
    ? Math.round(adSlots.reduce((sum, s) => sum + Number(s.basePrice), 0) / adSlots.length)
    : 0;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Ad slots" value={String(adSlots.length)} hint={`${available} available`} />
      <StatCard label="Available" value={String(available)} />
      <StatCard label="Avg. price" value={`$${avgPrice.toLocaleString()}`} hint="per month" />
    </div>
  );
}
