'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

// Default trigger styling: the compact kebab (⋯) icon button.
const KEBAB_TRIGGER =
  'pressable grid h-7 w-7 place-items-center rounded-md text-(--color-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-foreground)';

interface MenuProps {
  /** Accessible label for the trigger button, e.g. "Ad slot actions". */
  label: string;
  /** Render the menu items; call `close` to dismiss the menu after an action. */
  children: (close: () => void) => ReactNode;
  /** Custom trigger content; defaults to the kebab (⋯) glyph. */
  trigger?: ReactNode;
  /** Overrides the trigger button classes (use with a custom `trigger`). */
  triggerClassName?: string;
  /** Which edge the panel aligns to. Kebabs sit top-right → 'right' (default). */
  align?: 'left' | 'right';
}

// Accessible dropdown following the WAI-ARIA menu-button pattern. The trigger
// toggles a role="menu" panel that closes on Escape, on outside click, and after
// an item runs. Focus moves to the first item on open and returns to the trigger
// on Escape; Arrow/Home/End move between items. Defaults to a kebab (⋯) trigger.
export function Menu({ label, children, trigger, triggerClassName, align = 'right' }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const items = () =>
      Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

    items()[0]?.focus();

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      const list = items();
      if (list.length === 0) return;
      const current = list.indexOf(document.activeElement as HTMLElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        list[(current + 1) % list.length]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        list[(current - 1 + list.length) % list.length]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        list[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        list[list.length - 1]?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const transition = reduceMotion
    ? { duration: 0.12, ease: EASE_OUT }
    : { duration: 0.18, ease: EASE_OUT };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={triggerClassName ?? KEBAB_TRIGGER}
      >
        {trigger ?? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="3" r="1.4" />
            <circle cx="8" cy="8" r="1.4" />
            <circle cx="8" cy="13" r="1.4" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="menu"
            role="menu"
            aria-label={label}
            // Anchored below the trigger; aligns to the requested edge so it grows
            // inward and never clips (right for corner kebabs, left for toolbars).
            className={`absolute top-full z-20 mt-1 min-w-40 rounded-lg border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-md) ${
              align === 'left' ? 'left-0 origin-top-left' : 'right-0 origin-top-right'
            }`}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'scale(0.96)' }
            }
            animate={
              reduceMotion
                ? { opacity: 1 }
                : { opacity: 1, transform: 'scale(1)' }
            }
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, transform: 'scale(0.96)' }
            }
            transition={transition}
          >
            {children(close)}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

interface MenuItemProps {
  onSelect: () => void;
  children: ReactNode;
  /** Red styling for destructive actions like delete. */
  danger?: boolean;
}

export function MenuItem({ onSelect, children, danger }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={`pressable flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
        danger
          ? 'text-(--color-error) hover:bg-(--color-error-soft)'
          : 'text-(--color-foreground) hover:bg-(--color-surface-hover)'
      }`}
    >
      {children}
    </button>
  );
}
