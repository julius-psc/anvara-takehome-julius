'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IconX } from '@tabler/icons-react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
// Mirrors --ease-drawer: a decisive slide for the mobile bottom sheet.
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

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

  // Below the `sm` breakpoint the dialog becomes a bottom sheet (slide up),
  // above it a centered dialog (scale in). Lazy-read so the first paint is
  // correct without a synchronous setState in an effect; the modal only renders
  // its content when open (post-hydration), so there's no SSR mismatch.
  const [isSheet, setIsSheet] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsSheet(mq.matches);
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

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

  const transition = {
    duration: reduceMotion ? 0.15 : isSheet ? 0.35 : 0.25,
    ease: isSheet ? EASE_DRAWER : EASE_OUT,
  };

  // Sheet slides up from the bottom; dialog scales in. Reduced motion just fades
  // (the overlay handles the fade) with no panel movement.
  const panelMotion = reduceMotion
    ? { initial: false as const, animate: {}, exit: undefined }
    : isSheet
      ? {
          initial: { transform: 'translateY(100%)' },
          animate: { transform: 'translateY(0%)' },
          exit: { transform: 'translateY(100%)' },
        }
      : {
          initial: { transform: 'scale(0.96)' },
          animate: { transform: 'scale(1)' },
          exit: { transform: 'scale(0.96)' },
        };

  const defaultPanelClass =
    'relative z-10 max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-(--color-border) bg-(--color-surface) p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-(--shadow-md) outline-none sm:max-w-md sm:rounded-xl sm:pb-6';

  const panelClass = panelClassName
    ? panelClassName.replace(/\banimate-modal-in\b/g, '').replace(/\s+/g, ' ').trim()
    : defaultPanelClass;

  return (
    <AnimatePresence onExitComplete={restoreFocus}>
      {open ? (
        <motion.div
          key="modal"
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
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
            initial={panelMotion.initial}
            animate={panelMotion.animate}
            exit={panelMotion.exit}
            transition={transition}
            className={`${panelClass} origin-center`}
          >
            {/* Grab handle affordance — bottom sheet on mobile only. */}
            <div
              aria-hidden
              className="mx-auto mb-4 h-1 w-9 rounded-full bg-(--color-border) sm:hidden"
            />
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
