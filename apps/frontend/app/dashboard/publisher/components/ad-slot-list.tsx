import { getPublisherAdSlots } from '@/lib/data';
import { AdSlotCard } from './ad-slot-card';

// Async Server Component: fetches the publisher's own ad slots on the server.
// Rendered inside a <Suspense> boundary so the await below streams in.
export async function AdSlotList() {
  const adSlots = await getPublisherAdSlots();

  if (adSlots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[--color-border] p-8 text-center text-[--color-muted]">
        No ad slots yet. Create your first ad slot to start earning.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} adSlot={slot} />
      ))}
    </div>
  );
}
