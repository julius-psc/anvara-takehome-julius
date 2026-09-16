'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adSlotSchema, type AdSlotInput, AD_SLOT_TYPES } from '@/lib/schemas';
import type { AdSlot } from '@/lib/types';
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
      onDone();
      return;
    }
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof AdSlotInput, { message });
      }
    }
    setServerError(result.error);
  });

  const inputCls =
    'mt-1 w-full rounded border border-[--color-border] bg-white px-3 py-2 text-sm text-gray-900';
  const errCls = 'mt-1 text-xs text-red-600';

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {serverError && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Name</label>
        <input {...register('name')} className={inputCls} />
        {errors.name && <p className={errCls}>{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select {...register('type')} className={inputCls}>
            {AD_SLOT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors.type && <p className={errCls}>{errors.type.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Base price ($/mo)</label>
          <input
            type="number"
            step="0.01"
            {...register('basePrice', { valueAsNumber: true })}
            className={inputCls}
          />
          {errors.basePrice && <p className={errCls}>{errors.basePrice.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea {...register('description')} rows={2} className={inputCls} />
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
