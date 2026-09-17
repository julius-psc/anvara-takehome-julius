'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { getAdSlot } from '@/lib/api';
import { authClient } from '@/auth-client';
import { Badge } from '@/app/components/badge';
import { FadeIn } from '@/app/components/fade-in';
import { toast } from 'sonner';
import { AD_SLOT_TYPE_META } from '@/lib/ad-slot-meta';
import { logger } from '@/lib/utils';
import type { AdSlot } from '@/lib/types';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

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
  /** Inline close control when shown inside the marketplace modal. */
  onClose?: () => void;
}

export function AdSlotDetail({
  id,
  initialSlot,
  variant = 'page',
  onAvailabilityChange,
  onClose,
}: Props) {
  const reduceMotion = useReducedMotion();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const sessionUser = (session?.user as User | undefined) ?? null;

  const [adSlot, setAdSlot] = useState<DetailSlot | null>(initialSlot ?? null);
  const [loading, setLoading] = useState(!initialSlot);
  const [error, setError] = useState<string | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  // Start pending when a session user is already cached so the form mounts immediately.
  const [rolePending, setRolePending] = useState(() => !!sessionUser);
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

    return () => {
      cancelled = true;
    };
  }, [id, initialSlot]);

  const userId = sessionUser?.id ?? null;
  const [prevUserId, setPrevUserId] = useState(userId);

  // Reset role state when the signed-in user changes (adjust during render, so
  // logging out clears the role immediately without a synchronous setState in
  // an effect). The effect below only touches state around the actual fetch.
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setRoleInfo(null);
    setRolePending(!!userId);
  }

  useEffect(() => {
    if (!userId) return;

    // Pending is already true here — set by the initial state for a cached user,
    // or by the during-render reset when the user changes — so the effect only
    // performs the fetch and settles state in its async callbacks.
    let cancelled = false;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setRoleInfo(data);
      })
      .catch(() => {
        if (!cancelled) setRoleInfo(null);
      })
      .finally(() => {
        if (!cancelled) setRolePending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const user = sessionUser;
  const isSponsor = roleInfo?.role === 'sponsor' && !!roleInfo?.sponsorId;
  // Keep the textarea form mounted for signed-in users so role resolve doesn’t swap layout.
  const showSponsorForm = !!user && (rolePending || isSponsor);
  const formReady = isSponsor && !rolePending;
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
      logger.error('Failed to unbook:', err);
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
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {variant === 'modal' ? (
              // Modal already exposes the name via aria-labelledby, so keep this visual-only.
              <p className="text-balance text-lg font-semibold tracking-tight text-(--color-foreground)">
                {adSlot.name}
              </p>
            ) : (
              <h1 className="text-balance text-xl font-semibold tracking-tight text-(--color-foreground)">
                {adSlot.name}
              </h1>
            )}
            <Badge tone={typeMeta?.tone ?? 'neutral'}>
              {TypeIcon && <TypeIcon size={13} stroke={1.8} />}
              {typeMeta?.label ?? adSlot.type}
            </Badge>
          </div>
          {adSlot.publisher && (
            <p className="mt-1 truncate text-sm text-(--color-muted)">
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
        {variant === 'modal' && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="pressable mt-0.5 shrink-0 rounded-md p-1 text-(--color-subtle) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
          >
            <IconX size={16} stroke={1.8} />
          </button>
        )}
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

      <AnimatePresence mode="wait" initial={false}>
        {bookingSuccess ? (
          <motion.div
            key="success"
            className="rounded-lg bg-(--color-success-soft) px-3 py-2.5"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'translateY(4px) scale(0.98)' }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, transform: 'translateY(0px) scale(1)' }
            }
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0.1 : 0.2,
              ease: EASE_OUT,
            }}
          >
            <h3 className="text-sm font-semibold text-(--color-success)">Placement booked</h3>
            <p className="mt-0.5 text-sm text-(--color-success)/80">
              Your request has been submitted. The publisher will be in touch soon.
            </p>
          </motion.div>
        ) : adSlot.isAvailable ? (
          <motion.div
            key="form"
            className="space-y-3 border-t border-dotted border-(--color-border) pt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0.1 : 0.18,
              ease: EASE_OUT,
            }}
          >
            {showSponsorForm ? (
              <div className="space-y-3">
                <h2 className="text-base font-semibold tracking-tight text-(--color-foreground)">
                  Request this placement
                </h2>
                <div>
                  <p className="text-sm font-medium text-(--color-foreground)">Your company</p>
                  <p className="mt-0.5 text-sm leading-5 text-(--color-muted)">
                    {formReady ? (
                      roleInfo?.name || user?.name
                    ) : (
                      <span className="inline-block h-5 w-32 animate-pulse rounded bg-(--color-border) align-middle" />
                    )}
                  </p>
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
                    disabled={!formReady || booking}
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-3 py-2 text-sm leading-5 text-(--color-foreground) placeholder:text-(--color-subtle) transition-[border-color,box-shadow] duration-150 ease-out focus:border-(--color-accent) focus:outline-none focus:ring-1 focus:ring-(--color-accent) disabled:cursor-wait disabled:opacity-70"
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
                  disabled={!formReady || booking}
                  className="btn-primary h-11 w-full rounded-lg px-4 text-sm font-semibold"
                >
                  {booking ? 'Booking…' : 'Book this placement'}
                </button>
              </div>
            ) : (
              <div className="flex min-h-[12.5rem] flex-col justify-end">
                <button
                  type="button"
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-(--color-surface-hover) px-4 py-2.5 text-sm font-semibold text-(--color-subtle)"
                >
                  Request this placement
                </button>
                <p className="mt-2 text-center text-sm text-(--color-muted)">
                  {sessionPending ? (
                    <span className="inline-block h-4 w-56 animate-pulse rounded bg-(--color-border)" />
                  ) : user ? (
                    'Only sponsors can request placements.'
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="font-medium text-(--color-accent) transition-colors duration-150 ease-out hover:text-(--color-accent-hover)"
                      >
                        Log in
                      </Link>{' '}
                      as a sponsor to request this placement.
                    </>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );

  // Modal already runs the enter transition on the panel — a nested FadeIn
  // would stack opacities and make the open feel muddy.
  if (variant === 'modal') {
    return body;
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-4">
      <BackLink />
      <FadeIn>{body}</FadeIn>
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
