'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { campaignSchema, type CampaignInput, CAMPAIGN_STATUSES } from '@/lib/schemas';
import type { Campaign } from '@/lib/types';
import { createCampaign, updateCampaign } from '../actions';

// <input type="date"> needs a yyyy-mm-dd value; the API returns full ISO strings.
function toDateInputValue(iso: string): string {
  return iso ? new Date(iso).toISOString().slice(0, 10) : '';
}

interface CampaignFormProps {
  campaign?: Campaign; // present => edit mode
  onDone: () => void; // called after a successful submit (closes the modal)
}

export function CampaignForm({ campaign, onDone }: CampaignFormProps) {
  const isEdit = Boolean(campaign);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CampaignInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: campaign
      ? {
          name: campaign.name,
          description: campaign.description ?? '',
          budget: Number(campaign.budget),
          startDate: toDateInputValue(campaign.startDate),
          endDate: toDateInputValue(campaign.endDate),
          status: campaign.status,
        }
      : { name: '', description: '', startDate: '', endDate: '' },
  });

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const result = campaign ? await updateCampaign(campaign.id, data) : await createCampaign(data);

    if (result.success) {
      onDone();
      return;
    }
    // Push server-side field errors back onto the matching inputs.
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof CampaignInput, { message });
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

      <div>
        <label className="block text-sm font-medium">Budget ($)</label>
        <input
          type="number"
          step="0.01"
          {...register('budget', { valueAsNumber: true })}
          className={inputCls}
        />
        {errors.budget && <p className={errCls}>{errors.budget.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea {...register('description')} rows={2} className={inputCls} />
        {errors.description && <p className={errCls}>{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Start date</label>
          <input type="date" {...register('startDate')} className={inputCls} />
          {errors.startDate && <p className={errCls}>{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">End date</label>
          <input type="date" {...register('endDate')} className={inputCls} />
          {errors.endDate && <p className={errCls}>{errors.endDate.message}</p>}
        </div>
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select {...register('status')} className={inputCls}>
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
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
          {isSubmitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create campaign'}
        </button>
      </div>
    </form>
  );
}
