'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
    // Fetch ad slot
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));

    // Check user session and fetch role
    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.user) {
          const sessionUser = data.user as User;
          setUser(sessionUser);

          // Fetch role info from backend
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
    return <div className="py-12 text-center text-(--color-muted)">Loading...</div>;
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <Link href="/marketplace" className="text-(--color-primary) hover:underline">
          ← Back to Marketplace
        </Link>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  const typeMeta = AD_SLOT_TYPE_META[adSlot.type];
  const TypeIcon = typeMeta?.icon;

  return (
    <div className="space-y-6">
      <Link href="/marketplace" className="text-(--color-primary) hover:underline">
        ← Back to Marketplace
      </Link>

      <div className="rounded-lg border border-(--color-border) p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{adSlot.name}</h1>
            {adSlot.publisher && (
              <p className="text-(--color-muted)">
                by {adSlot.publisher.name}
                {adSlot.publisher.website && (
                  <>
                    {' '}
                    ·{' '}
                    <a
                      href={adSlot.publisher.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-(--color-primary) hover:underline"
                    >
                      {adSlot.publisher.website}
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

        {adSlot.description && <p className="mb-6 text-(--color-muted)">{adSlot.description}</p>}

        <div className="flex items-center justify-between border-t border-(--color-border) pt-4">
          <div className="flex items-center">
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
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
                  onClick={handleUnbook}
                  className="ml-3 text-sm text-(--color-primary) underline hover:opacity-80"
                >
                  Reset listing
                </button>
              )}
          </div>
          <div className="text-right">
            <p className="font-numeric text-2xl font-semibold text-(--color-foreground)">
              ${Number(adSlot.basePrice).toLocaleString()}
            </p>
            <p className="text-sm text-(--color-muted)">per month</p>
          </div>
        </div>

        {adSlot.isAvailable && !bookingSuccess && (
          <div className="mt-6 border-t border-(--color-border) pt-6">
            <h2 className="mb-4 text-lg font-semibold">Request This Placement</h2>

            {roleLoading ? (
              <div className="py-4 text-center text-(--color-muted)">Loading...</div>
            ) : roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-(--color-muted)">
                    Your Company
                  </label>
                  <p className="text-(--color-foreground)">{roleInfo.name || user?.name}</p>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-(--color-muted)"
                  >
                    Message to Publisher (optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the publisher about your campaign goals..."
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-background) px-3 py-2 text-(--color-foreground) placeholder:text-(--color-muted) focus:border-(--color-primary) focus:outline-none focus:ring-1 focus:ring-(--color-primary)"
                    rows={3}
                  />
                </div>
                {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
                <button
                  onClick={handleBooking}
                  disabled={booking}
                  className="w-full rounded-lg bg-(--color-primary) px-4 py-3 font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
                >
                  {booking ? 'Booking...' : 'Book This Placement'}
                </button>
              </div>
            ) : (
              <div>
                <button
                  disabled
                  className="w-full cursor-not-allowed rounded-lg bg-gray-300 px-4 py-3 font-semibold text-gray-500"
                >
                  Request This Placement
                </button>
                <p className="mt-2 text-center text-sm text-(--color-muted)">
                  {user
                    ? 'Only sponsors can request placements'
                    : 'Log in as a sponsor to request this placement'}
                </p>
              </div>
            )}
          </div>
        )}

        {bookingSuccess && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-800">Placement Booked!</h3>
            <p className="mt-1 text-sm text-green-700">
              Your request has been submitted. The publisher will be in touch soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
