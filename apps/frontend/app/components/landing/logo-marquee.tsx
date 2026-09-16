'use client';

import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type PlaceholderLogo = {
  name: string;
  glyph: ReactNode;
};

const ICON_CLASS = 'size-11 sm:size-12';

/** Fictional marks — social-proof placeholders, not real brands. */
const LOGOS: PlaceholderLogo[] = [
  {
    name: 'Northpeak',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <path
          fill="currentColor"
          d="M10 2.5 17.5 16H13l-3-5.5L7 16H2.5L10 2.5Z"
        />
      </svg>
    ),
  },
  {
    name: 'Meridian',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path fill="currentColor" d="M10 4.5v11M4.5 10h11" />
      </svg>
    ),
  },
  {
    name: 'Cascade',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          d="M4 6c2.5 0 2.5 3 5 3s2.5-3 5-3M4 11c2.5 0 2.5 3 5 3s2.5-3 5-3"
        />
      </svg>
    ),
  },
  {
    name: 'Folio',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <rect
          x="3.5"
          y="4.5"
          width="13"
          height="11"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path stroke="currentColor" strokeWidth="1.75" d="M7 4.5v11" />
      </svg>
    ),
  },
  {
    name: 'Harbor',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          d="M10 3.5v8M5 8.5c0 4 2.2 6.5 5 6.5s5-2.5 5-6.5"
        />
      </svg>
    ),
  },
  {
    name: 'Nimbus',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <path
          fill="currentColor"
          d="M7.2 13.5c-2.1 0-3.7-1.6-3.7-3.5S5.1 6.5 7.2 6.5c.4-1.8 2-3 3.9-3 2.3 0 4.1 1.7 4.3 3.9 1.7.3 3 1.7 3 3.5 0 2-1.6 3.6-3.6 3.6H7.2Z"
        />
      </svg>
    ),
  },
  {
    name: 'Solstice',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <circle cx="10" cy="10" r="3.25" fill="currentColor" />
        <path
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          d="M10 2.75v1.5M10 15.75v1.5M2.75 10h1.5M15.75 10h1.5M4.9 4.9l1.06 1.06M14.04 14.04l1.06 1.06M4.9 15.1l1.06-1.06M14.04 5.96l1.06-1.06"
        />
      </svg>
    ),
  },
  {
    name: 'Vertex',
    glyph: (
      <svg viewBox="0 0 20 20" className={ICON_CLASS} aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
          d="M4 15.5 10 4.5l6 11H4Z"
        />
      </svg>
    ),
  },
];

const EDGE_MASK =
  'linear-gradient(to right, transparent, black 14%, black 86%, transparent)';

function LogoTrack({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10 text-(--color-subtle) sm:gap-12 sm:pr-12"
      aria-hidden={ariaHidden}
    >
      {LOGOS.map((logo) => (
        <li key={logo.name} className="shrink-0" aria-label={logo.name}>
          {logo.glyph}
        </li>
      ))}
    </ul>
  );
}

/** Infinite logo strip under the hero CTA — fades at the edges. */
export function LogoMarquee() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mt-16" role="region" aria-label="Brands using Anvara">
      <div
        className="overflow-hidden"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
        }}
      >
        {reduceMotion ? (
          <div className="flex w-max">
            <LogoTrack />
          </div>
        ) : (
          <motion.div
            className="flex w-max"
            animate={{ transform: 'translateX(-50%)' }}
            transition={{ duration: 36, ease: 'linear', repeat: Infinity }}
          >
            <LogoTrack />
            <LogoTrack ariaHidden />
          </motion.div>
        )}
      </div>
    </div>
  );
}
