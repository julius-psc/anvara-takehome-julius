// Server-side data fetching helpers.
// These run ONLY on the server (they read the incoming request's cookies via
// next/headers), so the API URL and auth cookie never reach the browser.

import { headers } from 'next/headers';
import type { Campaign, AdSlot } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

/**
 * Fetch the authenticated sponsor's campaigns on the server.
 *
 * Forwards the incoming request's cookies so the backend can authenticate the
 * session. The backend derives the sponsor from that session and scopes the
 * results itself — the client never sends a sponsorId. Uses `no-store` because
 * this is per-user data that must always be fresh.
 *
 * Throws on a non-OK response so the nearest error boundary (error.tsx) can
 * render a graceful error state.
 */
export async function getSponsorCampaigns(): Promise<Campaign[]> {
  const cookie = (await headers()).get('cookie') ?? '';

  const res = await fetch(`${API_URL}/api/campaigns`, {
    headers: { cookie },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load campaigns (${res.status})`);
  }

  return res.json() as Promise<Campaign[]>;
}

/**
 * Fetch the authenticated publisher's own ad slots on the server.
 *
 * Uses the auth-scoped /api/ad-slots/mine endpoint (the public /api/ad-slots is
 * for the marketplace). Cookie is forwarded so the backend can identify the
 * publisher; no-store keeps per-user data fresh.
 */
export async function getPublisherAdSlots(): Promise<AdSlot[]> {
  const cookie = (await headers()).get('cookie') ?? '';

  const res = await fetch(`${API_URL}/api/ad-slots/mine`, {
    headers: { cookie },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load ad slots (${res.status})`);
  }

  return res.json() as Promise<AdSlot[]>;
}

/**
 * Fetch all publicly listed ad slots for the marketplace (server-side).
 *
 * Hits the public /api/ad-slots endpoint, so no auth cookie is required — this
 * is data anyone can browse. no-store keeps availability fresh as slots get
 * booked/unbooked. Throws on failure so the route's error boundary can render.
 */
export async function getMarketplaceAdSlots(): Promise<AdSlot[]> {
  const res = await fetch(`${API_URL}/api/ad-slots`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load marketplace (${res.status})`);
  }

  return res.json() as Promise<AdSlot[]>;
}
