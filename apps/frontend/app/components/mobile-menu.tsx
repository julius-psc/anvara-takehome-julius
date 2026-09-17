'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Mirrors --ease-drawer: a decisive slide for the off-canvas panel.
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

type UserRole = 'sponsor' | 'publisher' | null;

interface MobileMenuProps {
  links: { href: string; label: string }[];
  pathname: string;
  user?: { name?: string | null } | null;
  role: UserRole;
  isPending: boolean;
  onSignOut: () => void;
}

// The sub-`sm` navigation: a hamburger that morphs into an X and opens a
// right-side drawer holding the nav links plus the auth action. Follows the same
// dialog contract as Modal — labelled role="dialog", Escape/overlay to dismiss,
// focus moved into the panel on open and restored to the trigger after it exits,
// background scroll locked with scrollbar compensation — so it feels native and
// doesn't shift the page. All motion collapses to a fade under reduced motion.
export function MobileMenu({ links, pathname, user, role, isPending, onSignOut }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  // Close on navigation. Tapping a link closes directly (below); this render-time
  // reset also covers browser back/forward so the drawer never lingers on a route
  // change. Adjusting state during render (vs. an effect) is React's recommended
  // pattern for "reset when a prop changes" and avoids a cascading re-render.
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (seenPathname !== pathname) {
    setSeenPathname(pathname);
    setOpen(false);
  }

  // While open: trap the page (scroll lock + scrollbar compensation), move focus
  // into the panel, and wire Escape. Everything is torn down on close.
  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  const panelTransition = { duration: reduceMotion ? 0.15 : 0.3, ease: EASE_DRAWER };
  const overlayTransition = { duration: reduceMotion ? 0.15 : 0.25, ease: EASE_OUT };

  const linkClass = (href: string) => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);
    return `flex min-h-11 items-center rounded-lg px-3 text-base transition-colors ${
      isActive
        ? 'bg-(--color-surface-hover) font-medium text-(--color-foreground)'
        : 'text-(--color-muted) hover:bg-(--color-surface-hover) hover:text-(--color-foreground)'
    }`;
  };

  return (
    <div className="sm:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="pressable grid size-9 place-items-center rounded-lg text-(--color-foreground) transition-colors hover:bg-(--color-surface-hover)"
      >
        {/* Two bars that translate together and rotate into an X. Driven by CSS
            classes (not Motion) so the transform is identical on the server and
            at hydration — `open` is false on both, so no mismatch. Transform-only
            for smoothness; reduced motion drops the transition. */}
        <span className="relative flex size-5 items-center justify-center" aria-hidden="true">
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out motion-reduce:transition-none ${
              open ? 'translate-y-0 rotate-45' : '-translate-y-1 rotate-0'
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ease-out motion-reduce:transition-none ${
              open ? 'translate-y-0 -rotate-45' : 'translate-y-1 rotate-0'
            }`}
          />
        </span>
      </button>

      <AnimatePresence
        onExitComplete={() => triggerRef.current?.focus({ preventScroll: true })}
      >
        {open ? (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-(--color-overlay)"
              onClick={() => setOpen(false)}
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={overlayTransition}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col border-l border-(--color-border) bg-(--color-background) pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(1rem,env(safe-area-inset-right))] pb-[max(1.5rem,env(safe-area-inset-bottom))] pl-4 shadow-(--shadow-md) outline-none"
              initial={reduceMotion ? { opacity: 0 } : { transform: 'translateX(100%)' }}
              animate={reduceMotion ? { opacity: 1 } : { transform: 'translateX(0%)' }}
              exit={reduceMotion ? { opacity: 0 } : { transform: 'translateX(100%)' }}
              transition={panelTransition}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="px-3 text-xs font-medium tracking-wide text-(--color-subtle) uppercase">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="pressable grid size-9 place-items-center rounded-lg text-(--color-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                    <path
                      d="M4 4l10 10M14 4L4 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Identity block: mirrors the desktop chip so signed-in state reads
                  the same across breakpoints. */}
              {!isPending && user ? (
                <div className="mb-2 flex items-center gap-2.5 rounded-lg bg-(--color-surface) px-3 py-2.5">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--color-primary) text-sm font-semibold text-(--color-on-primary)"
                    aria-hidden="true"
                  >
                    {(user.name?.trim().charAt(0) || '?').toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-(--color-foreground)">
                      {user.name}
                    </span>
                    {role && (
                      <span className="block text-xs capitalize text-(--color-muted)">{role}</span>
                    )}
                  </span>
                </div>
              ) : null}

              <nav className="flex flex-col gap-0.5" aria-label="Primary">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={
                      pathname === link.href || pathname.startsWith(`${link.href}/`)
                        ? 'page'
                        : undefined
                    }
                    className={linkClass(link.href)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-4">
                {isPending ? (
                  <div className="h-11 w-full animate-pulse rounded-lg bg-(--color-border)" />
                ) : user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      onSignOut();
                    }}
                    className="pressable flex min-h-11 w-full items-center justify-center rounded-lg border border-(--color-border) px-4 text-sm font-medium transition-colors hover:bg-(--color-surface-hover)"
                  >
                    Sign out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="btn-primary flex min-h-11 w-full items-center justify-center rounded-lg px-4 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
