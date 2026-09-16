'use server';

import { revalidatePath } from 'next/cache';
import { campaignSchema, type CampaignInput } from '@/lib/schemas';
import { authHeaders, readError, toFieldErrors, type ActionResult } from '@/lib/action-utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

export async function createCampaign(input: CampaignInput): Promise<ActionResult> {
  // Re-validate on the server — the client's validation is only for UX.
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const res = await fetch(`${API_URL}/api/campaigns`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return { success: false, error: await readError(res) };

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<ActionResult> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: 'Please fix the errors below',
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(parsed.data),
  });
  if (!res.ok) return { success: false, error: await readError(res) };

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  if (!res.ok) return { success: false, error: await readError(res) };

  revalidatePath('/dashboard/sponsor');
  return { success: true };
}
