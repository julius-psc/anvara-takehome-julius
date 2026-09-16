'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconArrowLeft } from '@tabler/icons-react';
import { getAdSlot } from '@/lib/api';
import { authClient } from '@/auth-client';
import { Badge } from '@/app/components/badge';
import { toast } from 'sonner';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import type { AdSlot } from '@/lib/types';

interface DetailSlot extends AdSlot {
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
  /** Prefill from the marketplace grid so the modal opens without a blank flash. */
  initialSlot?: DetailSlot;
  variant?: 'page' | 'modal';
  onAvailabilityChange?: (isAvailable: boolean) => void;
}

export function AdSlotDetail({
  id,
  initialSlot,
  variant = 'page',
  onAvailabilityChange,
}: Props) {
  const [adSlot, setAdSlot] = useState<DetailSlot | null>(initialSlot ?? null);
  const [loading, setLoading] = useState(!initialSlot);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAdSlot(id)
      .then((slot) => {
        if (!cancelled) setAdSlot(slot as DetailSlot);
      })
      .catch(() => {
        if (!cancelled && !initialSlot) setError('Failed to load ad slot details');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    authClient
      .getSession()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.user) {
          const sessionUser = data.user as User;
          setUser(sessionUser);

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${sessionUser.id}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (!cancelled) setRoleInfo(data);
            })
            .catch(() => {
              if (!cancelled) setRoleInfo(null);
            })
            .finally(() => {
              if (!cancelled) setRoleLoading(false);
            });
        } else {
          setRoleLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setRoleLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, initialSlot]);

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
      onAvailabilityChange?.(false);
      toast.success('Placement booked', {
        description: 'Your request was submitted. The publisher will follow up soon.',
      });
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'Failed to book placement';
      setBookingError(errMessage);
      toast.error('Could not book placement', {
        description: errMessage,
      });
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
      onAvailabilityChange?.(true);
      setMessage('');
      toast.success('Listing reset', {
        description: 'This ad slot is available again.',
      });
    } catch (err) {
      console.error('Failed to unbook:', err);
      toast.error('Could not reset listing', {
        description: 'Please try again in a moment.',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3" aria-hidden="true">
        <div className="h-5 w-44 animate-pulse rounded bg-(--color-border)" />
        <div className="h-4 w-28 animate-pulse rounded bg-(--color-border)" />
        <div className="h-4 w-full animate-pulse rounded bg-(--color-border)" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-(--color-border)" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 w-20 animate-pulse rounded bg-(--color-border)" />
          <div className="h-6 w-24 animate-pulse rounded bg-(--color-border)" />
        </div>
      </div>
    );
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-3">
        {variant === 'page' && <BackLink />}
        <p className="text-sm text-(--color-error)">{error || 'Ad slot not found'}</p>
      </div>
    );
  }

  const typeMeta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = typeMeta?.icon;

  const body = (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Modal already exposes the name via aria-labelledby, so keep this visual-only. */}
          {variant === 'modal' ? (
            <p className="pr-6 text-balance text-lg font-semibold tracking-tight text-(--color-foreground)">
              {adSlot.name}
            </p>
          ) : (
            <h1 className="text-balance text-xl font-semibold tracking-tight text-(--color-foreground)">
              {adSlot.name}
            </h1>
          )}
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
        <p className="text-pretty text-sm leading-relaxed text-(--color-muted)">{adSlot.description}</p>
      )}

      <div className="flex items-end justify-between gap-3">
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
        <div className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-(--color-foreground)">
            Request this placement
          </h2>

          {roleLoading ? (
            <div className="space-y-3" aria-hidden="true">
              <div className="h-4 w-24 animate-pulse rounded bg-(--color-border)" />
              <div className="h-20 w-full animate-pulse rounded-lg bg-(--color-border)" />
              <div className="h-11 w-full animate-pulse rounded-lg bg-(--color-border)" />
            </div>
          ) : roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-(--color-foreground)">Your company</p>
                <p className="mt-0.5 text-sm text-(--color-muted)">{roleInfo.name || user?.name}</p>
              </div>
              <div>
                <label
                  htmlFor={`message-${adSlot.id}`}
                  className="mb-1.5 block text-sm font-medium text-(--color-foreground)"
                >
                  Message to publisher{' '}
                  <span className="font-normal text-(--color-muted)">(optional)</span>
                </label>
                <textarea
                  id={`message-${adSlot.id}`}
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
                className="btn-primary w-full rounded-lg px-4 py-2.5 text-sm font-semibold"
              >
                {booking ? 'Booking…' : 'Book this placement'}
              </button>
            </div>
          ) : (
            <div>
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-(--color-surface-hover) px-4 py-2.5 text-sm font-semibold text-(--color-subtle)"
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
        <div className="rounded-lg bg-(--color-success-soft) px-3 py-2.5">
          <h3 className="text-sm font-semibold text-(--color-success)">Placement booked</h3>
          <p className="mt-0.5 text-sm text-(--color-success)/80">
            Your request has been submitted. The publisher will be in touch soon.
          </p>
        </div>
      )}
    </div>
  );

  if (variant === 'modal') {
    return body;
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <BackLink />
      {body}
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
