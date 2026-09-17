'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import anvaraLogo from '@/app/assets/icons/anvara-logo.svg';
import { authClient } from '@/auth-client';
import { MobileMenu } from './mobile-menu';

type UserRole = 'sponsor' | 'publisher' | null;

export function Nav() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;
  const [role, setRole] = useState<UserRole>(null);

  // Fetch the user's role from the backend when logged in (cancellation-safe:
  // state is only set in async callbacks and ignored after unmount).
  useEffect(() => {
    if (!user?.id) return;

    let active = true;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setRole(data.role);
      })
      .catch(() => {
        if (active) setRole(null);
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const links = [
    { href: '/marketplace', label: 'Marketplace' },
    ...(role === 'sponsor' ? [{ href: '/dashboard/sponsor', label: 'My Campaigns' }] : []),
    ...(role === 'publisher' ? [{ href: '/dashboard/publisher', label: 'My Ad Slots' }] : []),
  ];

  const isHome = pathname === '/';

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = '/';
        },
      },
    });
  };

  const linkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return `rounded-lg px-3 py-1.5 text-sm transition-colors ${
      isActive
        ? 'bg-(--color-surface-hover) font-medium text-(--color-foreground)'
        : 'text-(--color-muted) hover:text-(--color-foreground)'
    }`;
  };

  const navInner = (
    <>
      <div className="flex items-center gap-5">
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-lg px-1 py-0.5"
          aria-label="Anvara home"
        >
          <Image
            src={anvaraLogo}
            alt=""
            width={36}
            height={36}
            className="size-9"
            unoptimized
            priority={isHome}
          />
        </Link>
        <div className="hidden items-center gap-1 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 pr-1">
        <div className="hidden items-center gap-3 sm:flex">
          {isPending ? (
            <div className="h-5 w-20 animate-pulse rounded-lg bg-(--color-border)" />
          ) : user ? (
            <>
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-(--color-surface) py-0.5 pr-2.5 pl-0.5"
                title={user.name}
                aria-label={role ? `${user.name}, ${role}` : user.name}
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-xs font-semibold text-(--color-on-primary)"
                  aria-hidden
                >
                  {(user.name?.trim().charAt(0) || '?').toUpperCase()}
                </span>
                {role && (
                  <span className="text-xs font-medium capitalize text-(--color-muted)">
                    {role}
                  </span>
                )}
              </span>
              <button
                onClick={signOut}
                className="rounded-lg border border-(--color-border) px-3 py-1.5 text-sm font-medium transition-colors hover:bg-(--color-surface-hover)"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary rounded-lg px-4 py-2 text-sm font-medium">
              Sign in
            </Link>
          )}
        </div>

        <MobileMenu
          links={links}
          pathname={pathname}
          user={user}
          role={role}
          isPending={isPending}
          onSignOut={signOut}
        />
      </div>
    </>
  );

  if (isHome) {
    // Outer rounded-xl (12) = inner rounded-lg (8) + p-1 (4).
    return (
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 p-3 sm:p-4 lg:px-12 lg:pt-5 xl:px-16">
        <nav className="pointer-events-auto flex w-full items-center justify-between gap-4 rounded-xl border border-(--color-border)/60 bg-(--color-background)/65 p-1 shadow-(--shadow-sm) backdrop-blur-xl backdrop-saturate-150">
          {navInner}
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border)/40 bg-(--color-background)/80 backdrop-blur-md">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {navInner}
      </nav>
    </header>
  );
}
