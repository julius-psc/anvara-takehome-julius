'use client';

import { useState, useTransition } from 'react';
import { deleteCampaign } from '../actions';

// Two-step delete: click once to arm, confirm to delete. useTransition gives us
// the pending state while the Server Action runs (and revalidatePath refreshes
// the list automatically on success).
export function DeleteCampaignButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 text-sm">
      <span className="text-[--color-muted]">Sure?</span>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteCampaign(id);
            if (!result.success) setError(result.error);
          })
        }
        className="rounded bg-red-600 px-2 py-1 text-white disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Yes'}
      </button>
      <button onClick={() => setConfirming(false)} className="rounded px-2 py-1">
        No
      </button>
      {error && <span className="text-red-600">{error}</span>}
    </span>
  );
}
