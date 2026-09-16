'use client';

import { useState, useTransition } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { AdSlot } from '@/lib/types';
import { Modal } from '@/app/components/modal';
import { Menu, MenuItem } from '@/app/components/menu';
import { AdSlotForm } from './ad-slot-form';
import { deleteAdSlot } from '../actions';

// Per-card actions: a kebab menu whose items open the edit form modal or a
// delete-confirmation dialog. The Server Action's revalidatePath refreshes the
// list on success, so we only close the dialog here.
export function AdSlotActions({ adSlot }: { adSlot: AdSlot }) {
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteAdSlot(adSlot.id);
      if (result.success) setConfirmingDelete(false);
      else setError(result.error);
    });
  };

  return (
    <>
      <Menu label="Ad slot actions">
        {(close) => (
          <>
            <MenuItem
              onSelect={() => {
                close();
                setEditing(true);
              }}
            >
              <IconPencil size={16} stroke={1.5} aria-hidden />
              Edit
            </MenuItem>
            <MenuItem
              danger
              onSelect={() => {
                close();
                setConfirmingDelete(true);
              }}
            >
              <IconTrash size={16} stroke={1.5} aria-hidden />
              Delete
            </MenuItem>
          </>
        )}
      </Menu>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit ad slot">
        <AdSlotForm adSlot={adSlot} onDone={() => setEditing(false)} />
      </Modal>

      <Modal
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        title="Delete ad slot?"
      >
        <p className="text-sm text-(--color-muted)">
          &ldquo;{adSlot.name}&rdquo; will be permanently removed. This can&rsquo;t be undone.
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-(--color-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}
