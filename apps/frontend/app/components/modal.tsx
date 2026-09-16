'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconX } from '@tabler/icons-react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

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
// on open and restored after exit, background scroll locked with scrollbar
// compensation so the page doesn't shift. Enter/exit via Motion (no double-rAF
// flash) — opacity + scale; reduced-motion drops movement.
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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      panelRef.current?.focus({ preventScroll: true });
    });

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [open, onClose]);

  const restoreFocus = () => {
    restoreFocusRef.current?.focus({ preventScroll: true });
    restoreFocusRef.current = null;
  };

  const transition = reduceMotion
    ? { duration: 0.15, ease: EASE_OUT }
    : { duration: 0.25, ease: EASE_OUT };

  const defaultPanelClass =
    'relative z-10 w-full max-w-md rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-md) outline-none';

  const panelClass = panelClassName
    ? panelClassName.replace(/\banimate-modal-in\b/g, '').replace(/\s+/g, ' ').trim()
    : defaultPanelClass;

  return (
    <AnimatePresence onExitComplete={restoreFocus}>
      {open ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
        >
          <div
            className="absolute inset-0 bg-(--color-overlay)"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={
              reduceMotion ? false : { transform: 'scale(0.96)' }
            }
            animate={{ transform: 'scale(1)' }}
            exit={reduceMotion ? undefined : { transform: 'scale(0.96)' }}
            transition={transition}
            className={`${panelClass} origin-center`}
          >
            {showClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="pressable absolute top-3 right-3 rounded-md p-1 text-(--color-subtle) transition-colors duration-150 ease-out hover:bg-(--color-surface-hover) hover:text-(--color-foreground)"
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
