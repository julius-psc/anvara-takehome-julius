'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { Modal } from '@/app/components/modal';
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
        className={triggerClassName ?? 'btn-primary rounded-lg px-4 py-2 text-sm font-semibold'}
      >
        {triggerLabel}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={adSlot ? 'Edit ad slot' : 'Create ad slot'}
      >
        <AdSlotForm adSlot={adSlot} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
