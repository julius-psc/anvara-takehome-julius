'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** One-shot opacity enter for skeleton → content (not for filter swaps). */
export function FadeIn({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.18, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
