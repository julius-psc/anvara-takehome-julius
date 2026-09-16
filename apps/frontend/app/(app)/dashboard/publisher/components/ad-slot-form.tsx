'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adSlotSchema, type AdSlotInput, AD_SLOT_TYPES } from '@/lib/schemas';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import type { AdSlot } from '@/lib/types';
import { toast } from 'sonner';
import { createAdSlot, updateAdSlot } from '../actions';

interface AdSlotFormProps {
  adSlot?: AdSlot; // present => edit mode
  onDone: () => void;
}

export function AdSlotForm({ adSlot, onDone }: AdSlotFormProps) {
  const isEdit = Boolean(adSlot);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdSlotInput>({
    resolver: zodResolver(adSlotSchema),
    defaultValues: adSlot
      ? {
          name: adSlot.name,
          description: adSlot.description ?? '',
          type: adSlot.type,
          basePrice: Number(adSlot.basePrice),
          isAvailable: adSlot.isAvailable,
        }
      : { name: '', description: '', type: 'DISPLAY' },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const result = adSlot ? await updateAdSlot(adSlot.id, data) : await createAdSlot(data);

    if (result.success) {
      toast.success(isEdit ? 'Ad slot updated' : 'Ad slot created', {
        description: isEdit
          ? 'Your changes have been saved.'
          : 'Your new slot is listed for sponsors.',
      });
      onDone();
      return;
    }
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof AdSlotInput, { message });
      }
    }
    setServerError(result.error);
    toast.error(isEdit ? 'Could not update ad slot' : 'Could not create ad slot', {
      description: result.error || 'Please check the form and try again.',
    });
  });

  // text-base on mobile prevents iOS Safari's focus-zoom; sm:text-sm keeps the
  // intended density on larger screens.
  const inputCls =
    'mt-1 w-full rounded-md border border-(--color-border) bg-(--color-surface) px-3 py-2 text-base text-(--color-foreground) transition-colors focus:border-(--color-accent) focus:outline-none focus:ring-2 focus:ring-(--color-accent-soft) sm:text-sm';
  const errCls = 'mt-1 text-xs text-(--color-error)';

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded border border-(--color-error)/25 bg-(--color-error-soft) p-3 text-sm text-(--color-error)">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          {...register('name')}
          placeholder="e.g. Homepage top banner"
          className={inputCls}
        />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>

      <div>
        <span className="block text-sm font-medium">Type</span>
        {/* Radio group styled as icon chips: native radios keep it accessible and
            wired to RHF via register, while the label chips carry the visuals. */}
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {AD_SLOT_TYPES.map((t) => {
            const meta = AD_SLOT_TYPE_META[t];
            const Icon = meta.icon;
            return (
              <label key={t} className="cursor-pointer">
                <input type="radio" value={t} {...register('type')} className="peer sr-only" />
                <span className="flex flex-col items-center gap-1 rounded-lg border border-(--color-border) px-2 py-2.5 text-xs text-(--color-muted) transition-colors hover:border-(--color-border-strong) peer-checked:border-(--color-accent) peer-checked:bg-(--color-accent-soft) peer-checked:text-(--color-accent) peer-focus-visible:ring-2 peer-focus-visible:ring-(--color-accent-soft)">
                  <Icon size={18} stroke={1.5} />
                  {meta.label}
                </span>
              </label>
            );
          })}
        </div>
        {errors.type && <p className={errCls}>{errors.type.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Base price ($/mo)</label>
        <input
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('basePrice', { valueAsNumber: true })}
          className={inputCls}
        />
        {errors.basePrice && <p className={errCls}>{errors.basePrice.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder="e.g. Above-the-fold banner, 728×90, ~50k impressions/mo"
          className={inputCls}
        />
        {errors.description && <p className={errCls}>{errors.description.message}</p>}
      </div>

      {isEdit && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('isAvailable')} />
          Available for booking
        </label>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onDone} className="rounded px-4 py-2 text-sm">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary rounded-lg px-4 py-2 text-sm font-semibold"
        >
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create ad slot'}
        </button>
      </div>
    </form>
  );
}
