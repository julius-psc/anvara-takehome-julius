'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { getAdSlot } from '@/lib/api';
import { authClient } from '@/auth-client';
import { Badge } from '@/app/components/badge';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';

interface AdSlot {
  id: string;
  name: string;
  description?: string;
  type: string;
  basePrice: number;
  isAvailable: boolean;
  publisher?: {
    id: string;
    name: string;
    website?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface RoleInfo {
  role: 'sponsor' | 'publisher' | null;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

interface Props {
  id: string;
}

export function AdSlotDetail({ id }: Props) {
  const [adSlot, setAdSlot] = useState<AdSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));

    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.user) {
          const sessionUser = data.user as User;
          setUser(sessionUser);

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${sessionUser.id}`
          )
            .then((res) => res.json())
            .then((data) => setRoleInfo(data))
            .catch(() => setRoleInfo(null))
            .finally(() => setRoleLoading(false));
        } else {
          setRoleLoading(false);
        }
      })
      .catch(() => setRoleLoading(false));
  }, [id]);

  const handleBooking = async () => {
    if (!roleInfo?.sponsorId || !adSlot) return;

    setBooking(true);
    setBookingError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/book`,
        {
          method: 'POST',
          // Send the Better Auth session cookie; the backend derives the sponsor
          // from it, so we no longer pass sponsorId in the body.
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: message || undefined }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book placement');
      }

      setBookingSuccess(true);
      setAdSlot({ ...adSlot, isAvailable: false });
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book placement');
    } finally {
      setBooking(false);
    }
  };

  const handleUnbook = async () => {
    if (!adSlot) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/unbook`,
        {
          method: 'POST',
          // Owning-publisher-only on the backend, so send the session cookie.
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reset booking');
      }

      setBookingSuccess(false);
      setAdSlot({ ...adSlot, isAvailable: true });
      setMessage('');
    } catch (err) {
      console.error('Failed to unbook:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-hidden="true">
        <div className="h-4 w-36 animate-pulse rounded bg-(--color-border)" />
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-sm)">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-2">
              <div className="h-6 w-48 animate-pulse rounded bg-(--color-border)" />
              <div className="h-4 w-28 animate-pulse rounded bg-(--color-border)" />
            </div>
            <div className="h-5 w-16 animate-pulse rounded-full bg-(--color-border)" />
          </div>
          <div className="mt-6 h-4 w-full animate-pulse rounded bg-(--color-border)" />
          <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-(--color-border)" />
          <div className="mt-6 flex items-center justify-between border-t border-(--color-border) pt-4">
            <div className="h-4 w-20 animate-pulse rounded bg-(--color-border)" />
            <div className="h-7 w-24 animate-pulse rounded bg-(--color-border)" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="rounded-xl border border-(--color-error)/20 bg-(--color-error-soft) px-4 py-3 text-sm text-(--color-error)">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  const typeMeta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = typeMeta?.icon;

  return (
    <div className="space-y-6">
      <BackLink />

      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-sm)">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-balance text-xl font-semibold tracking-tight text-(--color-foreground)">
              {adSlot.name}
            </h1>
            {adSlot.publisher && (
              <p className="mt-1 text-sm text-(--color-muted)">
                by {adSlot.publisher.name}
                {adSlot.publisher.website && (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      href={adSlot.publisher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--color-accent) transition-colors duration-150 ease-out hover:text-(--color-accent-hover)"
                    >
                      {adSlot.publisher.website.replace(/^https?:\/\//, '')}
                    </a>
                  </>
                )}
              </p>
            )}
          </div>
          <Badge tone={typeMeta?.tone ?? 'neutral'}>
            {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
            {typeMeta?.label ?? adSlot.type}
          </Badge>
        </div>

        {adSlot.description && (
          <p className="mt-4 text-pretty text-sm leading-relaxed text-(--color-muted)">
            {adSlot.description}
          </p>
        )}

        <div className="mt-6 flex items-end justify-between border-t border-(--color-border) pt-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-sm">
              <span
                className={`h-1.5 w-1.5 rounded-full ${adSlot.isAvailable ? 'bg-(--color-success)' : 'bg-(--color-subtle)'}`}
              />
              <span className={adSlot.isAvailable ? 'text-(--color-success)' : 'text-(--color-muted)'}>
                {adSlot.isAvailable ? 'Available' : 'Booked'}
              </span>
            </span>
            {/* Reset is publisher inventory management, so only show it to the
                publisher who owns this slot (the backend enforces the same). */}
            {!adSlot.isAvailable &&
              !bookingSuccess &&
              roleInfo?.publisherId &&
              roleInfo.publisherId === adSlot.publisher?.id && (
                <button
                  type="button"
                  onClick={handleUnbook}
                  className="text-sm font-medium text-(--color-accent) transition-colors duration-150 ease-out hover:text-(--color-accent-hover)"
                >
                  Reset listing
                </button>
              )}
          </div>
          <p className="font-numeric text-2xl font-semibold tracking-tight text-(--color-foreground)">
            ${Number(adSlot.basePrice).toLocaleString()}
            <span className="text-sm font-normal text-(--color-muted)">/mo</span>
          </p>
        </div>

        {adSlot.isAvailable && !bookingSuccess && (
          <div className="mt-6 border-t border-(--color-border) pt-6">
            <h2 className="text-sm font-semibold tracking-tight text-(--color-foreground)">
              Request this placement
            </h2>

            {roleLoading ? (
              <div className="mt-4 space-y-3" aria-hidden="true">
                <div className="h-4 w-24 animate-pulse rounded bg-(--color-border)" />
                <div className="h-20 w-full animate-pulse rounded-lg bg-(--color-border)" />
                <div className="h-11 w-full animate-pulse rounded-lg bg-(--color-border)" />
              </div>
            ) : roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-(--color-foreground)">Your company</p>
                  <p className="mt-0.5 text-sm text-(--color-muted)">
                    {roleInfo.name || user?.name}
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1.5 block text-sm font-medium text-(--color-foreground)"
                  >
                    Message to publisher{' '}
                    <span className="font-normal text-(--color-muted)">(optional)</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the publisher about your campaign goals…"
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm text-(--color-foreground) placeholder:text-(--color-subtle) transition-[border-color,box-shadow] duration-150 ease-out focus:border-(--color-accent) focus:outline-none focus:ring-1 focus:ring-(--color-accent)"
                    rows={3}
                  />
                </div>
                {bookingError && (
                  <p className="rounded-lg bg-(--color-error-soft) px-3 py-2 text-sm text-(--color-error)">
                    {bookingError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={booking}
                  className="btn-primary w-full rounded-lg px-4 py-3 text-sm font-semibold"
                >
                  {booking ? 'Booking…' : 'Book this placement'}
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-(--color-surface-hover) px-4 py-3 text-sm font-semibold text-(--color-subtle)"
                >
                  Request this placement
                </button>
                <p className="mt-2 text-center text-sm text-(--color-muted)">
                  {user
                    ? 'Only sponsors can request placements.'
                    : 'Log in as a sponsor to request this placement.'}
                </p>
              </div>
            )}
          </div>
        )}

        {bookingSuccess && (
          <div className="mt-6 rounded-xl border border-(--color-success)/20 bg-(--color-success-soft) px-4 py-3">
            <h3 className="text-sm font-semibold text-(--color-success)">Placement booked</h3>
            <p className="mt-0.5 text-sm text-(--color-success)/80">
              Your request has been submitted. The publisher will be in touch soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/marketplace"
      className="inline-flex items-center gap-1.5 text-sm font-medium text-(--color-muted) transition-colors duration-150 ease-out hover:text-(--color-foreground)"
    >
      <IconArrowLeft size={16} stroke={1.5} aria-hidden />
      Back to Marketplace
    </Link>
  );
}
