'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { IconX } from '@tabler/icons-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Hide the visible title (still used for aria-labelledby). */
  hideTitle?: boolean;
  showClose?: boolean;
  panelClassName?: string;
}

// Accessible modal dialog: labelled dialog role, Escape to close, focus moved in
// on open and restored on close, background scroll locked, and an animated
// entrance (which respects prefers-reduced-motion via globals.css).
export function Modal({
  open,
  onClose,
  title,
  children,
  hideTitle = false,
  showClose = false,
  panelClassName,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 animate-fade-in bg-(--color-overlay)"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={
          panelClassName ??
          'relative z-10 w-full max-w-md animate-modal-in rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-md) outline-none'
        }
      >
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 rounded-md p-1 text-(--color-subtle) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
          >
            <IconX size={16} stroke={1.8} />
          </button>
        )}
        <h2
          id={titleId}
          className={
            hideTitle
              ? 'sr-only'
              : 'mb-4 pr-8 text-lg font-semibold tracking-tight text-(--color-foreground)'
          }
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
