import { getPublisherAdSlots } from '@/lib/data';
import { AdSlotCard } from './ad-slot-card';
import { AdSlotStats } from './ad-slot-stats';
import { AdSlotFormModal } from './ad-slot-form-modal';

// Async Server Component: fetches the publisher's own ad slots on the server.
// Rendered inside a <Suspense> boundary so the await below streams in.
export async function AdSlotList() {
  const adSlots = await getPublisherAdSlots();

  if (adSlots.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[--color-border-strong] bg-[--color-surface] px-6 py-16 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[--color-surface-hover] text-[--color-muted]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <h3 className="mt-4 text-sm font-medium">No ad slots yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-[--color-muted]">
          List your first ad slot to start earning from sponsors across the marketplace.
        </p>
        <div className="mt-5 flex justify-center">
          <AdSlotFormModal triggerLabel="Create ad slot" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdSlotStats adSlots={adSlots} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adSlots.map((slot) => (
          <AdSlotCard key={slot.id} adSlot={slot} />
        ))}
      </div>
    </div>
  );
}
