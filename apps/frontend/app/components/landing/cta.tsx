'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';

type Cta = { label: string; href: string };
type UserRole = 'sponsor' | 'publisher';

function dashboardCta(role: UserRole | null): Cta | null {
  if (role === 'sponsor') return { label: 'My campaigns', href: '/dashboard/sponsor' };
  if (role === 'publisher') return { label: 'My ad slots', href: '/dashboard/publisher' };
  return null;
}

/** Closing CTA — text left, actions right, in a contained band. */
export function LandingCta() {
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const userId = user?.id ?? null;
  const [role, setRole] = useState<UserRole | null>(null);
  const [prevUserId, setPrevUserId] = useState(userId);

  // Reset role when the signed-in user changes — during render, not in an
  // effect, so a sync setState never triggers a cascading re-render.
  if (userId !== prevUserId) {
    setPrevUserId(userId);
    setRole(null);
  }

  useEffect(() => {
    if (!userId) return;

    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && (data.role === 'sponsor' || data.role === 'publisher')) {
          setRole(data.role);
        }
      })
      .catch(() => {
        if (active) setRole(null);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  const suppressLogin = isPending || !!user;
  const primary: Cta = { label: 'Browse marketplace', href: '/marketplace' };
  const secondary: Cta | null = suppressLogin
    ? dashboardCta(role)
    : { label: 'Sign in', href: '/login' };

  return (
    <section
      aria-labelledby="landing-cta-title"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-12 xl:px-16"
    >
      <div className="flex w-full flex-col items-start gap-6 rounded-2xl bg-(--color-surface) px-6 py-8 shadow-(--shadow-sm) sm:px-8 sm:py-9 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="min-w-0 max-w-xl">
          <p className="text-sm font-medium text-(--color-accent)">Get started</p>
          <h2
            id="landing-cta-title"
            className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-3xl"
          >
            Ready to book—or get booked?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-(--color-muted) text-pretty">
            Browse transparent inventory, or list your slots and let sponsors find you — same
            marketplace either way.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto md:items-stretch">
          <Link
            href={primary.href}
            className="btn-primary rounded-xl px-5 py-2.5 text-center text-sm font-semibold"
          >
            {primary.label}
          </Link>
          {secondary ? (
            <Link
              href={secondary.href}
              className="rounded-xl border border-(--color-border) bg-(--color-background) px-5 py-2.5 text-center text-sm font-medium text-(--color-foreground) transition-colors hover:bg-(--color-surface-hover)"
            >
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
