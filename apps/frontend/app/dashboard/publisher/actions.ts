'use server';

import { revalidatePath } from 'next/cache';
import { adSlotSchema, type AdSlotInput } from '@/lib/schemas';
import { authHeaders, readError, toFieldErrors, type ActionResult } from '@/lib/action-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function createAdSlot(input: AdSlotInput): Promise<ActionResult> {
  const parsed = adSlotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const res = await fetch(`${API_URL}/api/ad-slots`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return { success: false, error: await readError(res) };

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

export async function updateAdSlot(id: string, input: AdSlotInput): Promise<ActionResult> {
  const parsed = adSlotSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return { success: false, error: await readError(res) };

  revalidatePath('/dashboard/publisher');
  return { success: true };
}

export async function deleteAdSlot(id: string): Promise<ActionResult> {
  const res = await fetch(`${API_URL}/api/ad-slots/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) return { success: false, error: await readError(res) };

  revalidatePath('/dashboard/publisher');
  return { success: true };
}
