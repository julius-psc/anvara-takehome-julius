import type { AdSlot } from '@/lib/types';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import { AdSlotActions } from './ad-slot-actions';

export function AdSlotCard({
  adSlot,
  static: isStatic = false,
  glass = false,
}: {
  adSlot: AdSlot;
  /** Hide edit/delete actions — used in decorative previews. */
  static?: boolean;
  /** Frosted shell for hero overlays — leave false in dashboards. */
  glass?: boolean;
}) {
  const meta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = meta?.icon;
  // Decorative previews shouldn't inject headings into the document outline.
  const TitleTag = isStatic ? 'p' : 'h3';
  const shell = glass
    ? 'flex h-full flex-col gap-4 rounded-xl border border-(--color-border)/60 bg-(--color-background)/65 p-5 shadow-(--shadow-sm) backdrop-blur-xl backdrop-saturate-150'
    : 'flex h-full flex-col gap-4 rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-sm)';

  return (
    <div className={shell}>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
            <TitleTag className="min-h-7 text-balance font-medium leading-7 text-(--color-foreground)">
              {adSlot.name}
            </TitleTag>
            <Badge tone={meta?.tone ?? 'neutral'}>
              {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
              {meta?.label ?? adSlot.type}
            </Badge>
          </div>
          {!isStatic ? (
            <div className="flex h-7 shrink-0 items-center">
              <AdSlotActions adSlot={adSlot} />
            </div>
          ) : null}
        </div>

        {adSlot.description ? (
          <p className="line-clamp-2 text-pretty text-sm text-(--color-muted)">
            {adSlot.description}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex items-baseline justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-sm">
          <span
            className={`h-1.5 w-1.5 rounded-full ${adSlot.isAvailable ? 'bg-(--color-success)' : 'bg-(--color-subtle)'}`}
          />
          <span className={adSlot.isAvailable ? 'text-(--color-success)' : 'text-(--color-muted)'}>
            {adSlot.isAvailable ? 'Available' : 'Booked'}
          </span>
        </span>
        <span className="font-numeric text-lg font-semibold">
          ${Number(adSlot.basePrice).toLocaleString()}
          <span className="text-sm font-normal text-(--color-muted)">/mo</span>
        </span>
      </div>
    </div>
  );
}
