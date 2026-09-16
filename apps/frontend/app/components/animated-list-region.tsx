'use client';

import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Opacity crossfade for filter / view / page list swaps. Pagination stays outside. */
export function AnimatedListRegion({
  regionKey,
  children,
}: {
  regionKey: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0.01, ease: EASE_OUT }
    : { duration: 0.18, ease: EASE_OUT };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={regionKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
