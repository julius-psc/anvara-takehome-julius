'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface MenuProps {
  /** Accessible label for the trigger button, e.g. "Ad slot actions". */
  label: string;
  /** Render the menu items; call `close` to dismiss the menu after an action. */
  children: (close: () => void) => ReactNode;
}

// Accessible kebab (⋯) dropdown following the WAI-ARIA menu-button pattern.
// The trigger toggles a role="menu" panel that closes on Escape, on outside
// click, and after an item runs. Focus moves to the first item on open and
// returns to the trigger on Escape; Arrow/Home/End move between items.
export function Menu({ label, children }: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-7 w-7 place-items-center rounded-md text-(--color-muted) transition-colors hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.4" />
          <circle cx="8" cy="8" r="1.4" />
          <circle cx="8" cy="13" r="1.4" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={label}
          // Anchored below the trigger and aligned to its right edge: expands
          // down-and-into the card, so it never clips on the right of the grid.
          className="absolute right-0 top-full z-20 mt-1 min-w-36 animate-fade-in rounded-lg border border-(--color-border) bg-(--color-surface) p-1 shadow-(--shadow-md)"
        >
          {children(close)}
        </div>
      )}
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
      className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
        danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-(--color-foreground) hover:bg-(--color-surface-hover)'
      }`}
    >
      {children}
    </button>
  );
}
