'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { Modal } from '@/app/components/modal';
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
        className={triggerClassName ?? 'btn-primary rounded-lg px-4 py-2 text-sm font-semibold'}
      >
        {triggerLabel}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={campaign ? 'Edit campaign' : 'Create campaign'}
      >
        <CampaignForm campaign={campaign} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
