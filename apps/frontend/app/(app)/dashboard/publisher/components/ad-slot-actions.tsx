'use client';

import { useState, useTransition } from 'react';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { AdSlot } from '@/lib/types';
import { Modal } from '@/app/components/modal';
import { Menu, MenuItem } from '@/app/components/menu';
import { toast } from 'sonner';
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
      if (result.success) {
        setConfirmingDelete(false);
        toast.success('Ad slot deleted', {
          description: `"${adSlot.name}" has been removed.`,
        });
      } else {
        setError(result.error);
        toast.error('Could not delete ad slot', {
          description: result.error || 'Please try again.',
        });
      }
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
        {error && <p className="mt-2 text-sm text-(--color-error)">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setConfirmingDelete(false)}
            className="pressable rounded-lg px-4 py-2 text-sm font-medium text-(--color-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="pressable rounded-lg bg-(--color-error) px-4 py-2 text-sm font-semibold text-(--color-on-primary) transition-colors hover:bg-(--color-error-hover) disabled:opacity-50"
          >
            {pending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </Modal>
    </>
  );
}
