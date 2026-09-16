// Shared helpers for Server Actions (used by both dashboards).
// Server-only: this reads request cookies via next/headers.

import { cookies } from 'next/headers';
import { z } from 'zod';

// The shape every action returns; forms use it to show success or errors.
export type ActionResult =
  { success: true } | { success: false; error: string; fieldErrors?: Record<string, string> };

// Forward the caller's cookies so the backend can authenticate the session.
export async function authHeaders(): Promise<Record<string, string>> {
  const cookie = (await cookies()).toString();
  return { 'Content-Type': 'application/json', cookie };
}

// Turn a ZodError into a flat { field: message } map for the form.
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    fieldErrors[key] ??= issue.message;
  }
  return fieldErrors;
}

// Pull the backend's { error: "..." } message out of a failed response.
export async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.error === 'string' ? data.error : `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
}
