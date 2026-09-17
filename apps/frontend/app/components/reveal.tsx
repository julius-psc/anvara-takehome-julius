'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds before this block starts entering. */
  delay?: number;
  /**
   * Skip opacity/filter — required for ancestors of backdrop-blur cards
   * (parent opacity or filter isolates the frost layer).
   */
  transformOnly?: boolean;
};

/** One-shot load-in: blur + fade + rise (or transform-only for frosted shells). */
export function Reveal({
  children,
  className,
  delay = 0,
  transformOnly = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <motion.div
        className={className}
        initial={transformOnly ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    );
  }

  const hidden = transformOnly
    ? { transform: 'translateY(20px)' }
    : {
        filter: 'blur(8px)',
        opacity: 0,
        transform: 'translateY(16px)',
      };

  const visible = transformOnly
    ? { transform: 'translateY(0px)' }
    : {
        filter: 'blur(0px)',
        opacity: 1,
        transform: 'translateY(0px)',
      };

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={visible}
      transition={{ delay, duration: 0.65, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
