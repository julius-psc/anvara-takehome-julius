'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/auth-client';

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

  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-background)">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-[15px] font-semibold tracking-tight">
            Anvara
          </Link>
          <div className="flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-(--color-surface-hover) font-medium text-(--color-foreground)'
                      : 'text-(--color-muted) hover:text-(--color-foreground)'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isPending ? (
            <div className="h-5 w-20 animate-pulse rounded bg-(--color-border)" />
          ) : user ? (
            <>
              <span className="hidden text-sm text-(--color-muted) sm:inline">
                {user.name}
                {role && <span className="text-(--color-subtle)"> · {role}</span>}
              </span>
              <button
                onClick={async () => {
                  await authClient.signOut({
                    fetchOptions: {
                      onSuccess: () => {
                        window.location.href = '/';
                      },
                    },
                  });
                }}
                className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm font-medium transition-colors hover:bg-(--color-surface-hover)"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="btn-primary rounded-md px-3.5 py-1.5 text-sm font-medium"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
