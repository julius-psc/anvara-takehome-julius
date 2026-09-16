'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';

export type FilterTabOption<T extends string> = {
  key: T;
  label: string;
  count?: number;
  icon?: ReactNode;
};

type FilterTabsProps<T extends string> = {
  options: FilterTabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name for the tablist. */
  'aria-label': string;
  /**
   * Shared across tabs in this list so the active pill morphs between them.
   * Must be unique per FilterTabs instance on the page.
   */
  layoutId: string;
  className?: string;
};

// Strong ease-in-out for on-screen morphing; strong ease-out for weight/color.
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

function TabLabelContent({
  icon,
  label,
  count,
  countClassName,
}: {
  icon?: ReactNode;
  label: string;
  count?: number;
  countClassName?: string;
}) {
  return (
    <>
      {icon}
      {label}
      {count !== undefined && <span className={`font-numeric ${countClassName ?? ''}`}>{count}</span>}
    </>
  );
}

// Segmented filter tabs: highlight pill follows hover; bold stays on the
// committed selection until click. One visible label (variable-font wght) +
// invisible semibold ghost avoids both reflow and dual-layer flicker.
export function FilterTabs<T extends string>({
  options,
  value,
  onChange,
  'aria-label': ariaLabel,
  layoutId,
  className = '',
}: FilterTabsProps<T>) {
  const [hovered, setHovered] = useState<T | null>(null);
  const [fineHover, setFineHover] = useState(false);
  const reduceMotion = useReducedMotion();
  const highlight = hovered ?? value;
  const pillTransition = reduceMotion
    ? { duration: 0 }
    : { type: 'tween' as const, duration: 0.2, ease: EASE_IN_OUT };
  // Reduced motion: keep a short weight cue; only the pill morph is zeroed.
  const weightTransition = reduceMotion
    ? { duration: 0.1, ease: EASE_OUT }
    : { duration: 0.14, ease: EASE_OUT };

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setFineHover(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const clearHover = () => setHovered(null);

  return (
    <LayoutGroup id={layoutId}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        onMouseLeave={clearHover}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) clearHover();
        }}
        className={`inline-flex flex-wrap items-center gap-1 rounded-lg border border-(--color-border) bg-(--color-surface) p-1 ${className}`}
      >
        {options.map(({ key, label, count, icon }) => {
          const selected = value === key;
          const highlighted = highlight === key;
          const tone = selected || highlighted ? 'text-(--color-foreground)' : 'text-(--color-muted)';
          const countTone = selected || highlighted ? 'text-(--color-muted)' : 'text-(--color-subtle)';

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(key)}
              onMouseEnter={() => {
                if (fineHover) setHovered(key);
              }}
              onFocus={() => setHovered(key)}
              className="relative inline-flex items-center rounded-sm px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-1"
            >
              {highlighted && (
                <motion.span
                  layoutId={layoutId}
                  initial={false}
                  className="pointer-events-none absolute inset-0 rounded-sm bg-(--color-surface-hover) shadow-(--shadow-sm)"
                  transition={pillTransition}
                />
              )}

              <span className="relative z-10 inline-grid">
                {/* Reserve semibold metrics so wght tween never shoves neighbors */}
                <span className="invisible inline-flex items-center gap-1.5 font-semibold select-none" aria-hidden>
                  <TabLabelContent icon={icon} label={label} count={count} />
                </span>
                <motion.span
                  className={`absolute inset-0 inline-flex items-center gap-1.5 transition-colors duration-150 ${tone}`}
                  initial={false}
                  animate={{ fontVariationSettings: selected ? '"wght" 600' : '"wght" 500' }}
                  transition={weightTransition}
                >
                  <TabLabelContent icon={icon} label={label} count={count} countClassName={countTone} />
                </motion.span>
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
