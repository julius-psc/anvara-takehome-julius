'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { AdSlotForm } from './ad-slot-form';

interface AdSlotFormModalProps {
  adSlot?: AdSlot; // present => edit, absent => create
  triggerLabel: string;
  triggerClassName?: string;
}

export function AdSlotFormModal({ adSlot, triggerLabel, triggerClassName }: AdSlotFormModalProps) {
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
            <h2 className="mb-4 text-lg font-bold">{adSlot ? 'Edit ad slot' : 'Create ad slot'}</h2>
            <AdSlotForm adSlot={adSlot} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
