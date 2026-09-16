'use client';

import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import type { Audience } from './content';
import { AUDIENCE_OPTIONS } from './content';

const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

type AudienceToggleProps = {
  value: Audience;
  onChange: (audience: Audience) => void;
  className?: string;
};

export function AudienceToggle({ value, onChange, className = '' }: AudienceToggleProps) {
  const reduceMotion = useReducedMotion();
  const pillTransition = reduceMotion
    ? { type: 'tween' as const, duration: 0, ease: EASE_IN_OUT }
    : { type: 'tween' as const, duration: 0.2, ease: EASE_IN_OUT };

  return (
    <LayoutGroup id="landing-audience">
      <div
        role="tablist"
        aria-label="Audience"
        className={`inline-flex items-center gap-1 rounded-xl border border-(--color-border) bg-(--color-surface) p-1 ${className}`}
      >
        {AUDIENCE_OPTIONS.map(({ key, label }) => {
          const selected = value === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(key)}
              className="relative rounded-lg px-3.5 py-1.5 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-1"
            >
              {selected && (
                <motion.span
                  layoutId="landing-audience-pill"
                  initial={false}
                  className="pointer-events-none absolute inset-0 rounded-lg bg-(--color-surface-hover) shadow-(--shadow-sm)"
                  transition={pillTransition}
                />
              )}
              <span
                className={`relative z-10 transition-colors ${
                  selected
                    ? 'text-(--color-foreground)'
                    : 'text-(--color-muted) hover:text-(--color-foreground)'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
