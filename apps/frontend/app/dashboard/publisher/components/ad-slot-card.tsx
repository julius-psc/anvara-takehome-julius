import type { AdSlot } from '@/lib/types';
import { Badge, type BadgeTone } from '@/app/components/badge';
import { AdSlotFormModal } from './ad-slot-form-modal';
import { DeleteAdSlotButton } from './delete-ad-slot-button';

const typeTone: Record<string, BadgeTone> = {
  DISPLAY: 'info',
  VIDEO: 'danger',
  NATIVE: 'neutral',
  NEWSLETTER: 'warning',
  PODCAST: 'success',
};

export function AdSlotCard({ adSlot }: { adSlot: AdSlot }) {
  return (
    <div className="flex flex-col rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-[--shadow-sm] transition-all duration-200 hover:border-[--color-border-strong] hover:shadow-[--shadow-md]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug text-[--color-foreground]">{adSlot.name}</h3>
        <Badge tone={typeTone[adSlot.type] ?? 'neutral'}>{adSlot.type.toLowerCase()}</Badge>
      </div>

      {adSlot.description && (
        <p className="mt-1.5 line-clamp-2 text-sm text-[--color-muted]">{adSlot.description}</p>
      )}

      <div className="mt-4 flex items-end justify-between">
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${adSlot.isAvailable ? 'bg-[--color-success]' : 'bg-[--color-subtle]'}`}
          />
          <span className={adSlot.isAvailable ? 'text-[--color-success]' : 'text-[--color-muted]'}>
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
        </span>
        <span className="font-numeric text-lg font-semibold">
          ${Number(adSlot.basePrice).toLocaleString()}
          <span className="text-sm font-normal text-[--color-muted]">/mo</span>
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[--color-border] pt-3">
        <AdSlotFormModal
          adSlot={adSlot}
          triggerLabel="Edit"
          triggerClassName="rounded-md px-2.5 py-1.5 text-sm font-medium text-[--color-muted] transition-colors hover:bg-[--color-surface-hover] hover:text-[--color-foreground]"
        />
        <DeleteAdSlotButton id={adSlot.id} />
      </div>
    </div>
  );
}
