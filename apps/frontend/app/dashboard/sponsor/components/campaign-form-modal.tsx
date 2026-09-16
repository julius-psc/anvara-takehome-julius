'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { CampaignForm } from './campaign-form';

interface CampaignFormModalProps {
  campaign?: Campaign; // present => edit, absent => create
  triggerLabel: string;
  triggerClassName?: string;
}

// A button that opens a modal containing the campaign form. Reused for both
// "Create campaign" (in the page header) and "Edit" (on each card).
export function CampaignFormModal({
  campaign,
  triggerLabel,
  triggerClassName,
}: CampaignFormModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          'rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-semibold text-white hover:opacity-90'
        }
      >
        {triggerLabel}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold">
              {campaign ? 'Edit campaign' : 'Create campaign'}
            </h2>
            <CampaignForm campaign={campaign} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
