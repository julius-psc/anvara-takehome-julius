'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';
import type { AudienceCopy } from './content';

type Cta = { label: string; href: string };
type UserRole = 'sponsor' | 'publisher';

function renderTitle(title: string, serifWord?: string) {
  if (!serifWord) return title;
  const index = title.indexOf(serifWord);
  if (index === -1) return title;
  return (
    <>
      {title.slice(0, index)}
      <span className="font-serif font-medium text-(--color-accent)">{serifWord}</span>
      {title.slice(index + serifWord.length)}
    </>
  );
}

function dashboardCta(role: UserRole | null): Cta | null {
  if (role === 'sponsor') return { label: 'My campaigns', href: '/dashboard/sponsor' };
  if (role === 'publisher') return { label: 'My ad slots', href: '/dashboard/publisher' };
  return null;
}

/** Drop / remap /login CTAs when the user is signed in (or session still loading). */
function resolveCtas(
  copy: AudienceCopy,
  { suppressLogin, role }: { suppressLogin: boolean; role: UserRole | null }
): Cta[] {
  const remap = (cta: Cta): Cta | null => {
    if (cta.href !== '/login') return cta;
    if (!suppressLogin) return cta;
    return dashboardCta(role);
  };

  const seen = new Set<string>();
  const out: Cta[] = [];
  for (const raw of [copy.primaryCta, copy.secondaryCta]) {
    const cta = remap(raw);
    if (!cta || seen.has(cta.href)) continue;
    seen.add(cta.href);
    out.push(cta);
  }

  if (out.length === 0) {
    out.push({ label: 'Browse marketplace', href: '/marketplace' });
  }
  return out;
}

export function HeroCopy({
  copy,
  titleId,
  asHeading = true,
  className = '',
}: {
  copy: AudienceCopy;
  titleId?: string;
  /** Only the visible audience should render the page's single h1. */
  asHeading?: boolean;
  className?: string;
}) {
  const TitleTag = asHeading ? 'h1' : 'p';
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
  const ctas = resolveCtas(copy, { suppressLogin, role });

  return (
    <div className={className}>
      <TitleTag
        id={titleId}
        className="text-3xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]"
      >
        {renderTitle(copy.title, copy.titleSerif)}
      </TitleTag>
      <p className="mt-4 max-w-md text-base leading-relaxed text-(--color-muted) text-pretty sm:text-[17px]">
        {copy.subtext}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {ctas.map((cta, i) =>
          i === 0 ? (
            <Link
              key={cta.href}
              href={cta.href}
              className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold"
            >
              {cta.label}
            </Link>
          ) : (
            <Link
              key={cta.href}
              href={cta.href}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm font-medium text-(--color-foreground) transition-colors hover:bg-(--color-surface-hover)"
            >
              {cta.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
