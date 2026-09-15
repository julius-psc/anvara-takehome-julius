// Server-side data fetching helpers.
// These run ONLY on the server (they read the incoming request's cookies via
// next/headers), so the API URL and auth cookie never reach the browser.

import { headers } from 'next/headers';
import type { Campaign } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

/**
 * Fetch a sponsor's campaigns on the server.
 *
 * Forwards the incoming request's cookies to the backend so the session can be
 * authenticated (required once Challenge 3 secures the API). Uses `no-store`
 * because this is per-user data that must always be fresh.
 *
 * Throws on a non-OK response so the nearest error boundary (error.tsx) can
 * render a graceful error state.
 */
export async function getSponsorCampaigns(sponsorId: string): Promise<Campaign[]> {
  const cookie = (await headers()).get('cookie') ?? '';

  const res = await fetch(`${API_URL}/api/campaigns?sponsorId=${sponsorId}`, {
    headers: { cookie },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load campaigns (${res.status})`);
  }

  return res.json() as Promise<Campaign[]>;
}
