import type { Audience } from './content';
import { AUDIENCE_COPY } from './content';

/** Product-sketch visual — distinct per audience until a real illustration lands. */
export function HeroIllustration({
  audience,
  className = '',
}: {
  audience: Audience;
  className?: string;
}) {
  const copy = AUDIENCE_COPY[audience];
  const isSponsor = audience === 'sponsor';

  return (
    <div
      className={`relative flex aspect-[4/3] w-full flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 sm:p-6 ${className}`}
      role="img"
      aria-label={`${copy.illustrationLabel}: ${copy.illustrationHint}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium tracking-wide text-(--color-muted) uppercase">
          {copy.illustrationLabel}
        </span>
        <span className="rounded-full bg-(--color-accent-soft) px-2.5 py-0.5 text-[11px] font-medium text-(--color-accent)">
          Preview
        </span>
      </div>

      <div className="flex flex-1 items-center justify-center py-6">
        {isSponsor ? <SponsorSketch /> : <PublisherSketch />}
      </div>

      <p className="text-sm text-(--color-muted)">{copy.illustrationHint}</p>
    </div>
  );
}

function SponsorSketch() {
  return (
    <svg viewBox="0 0 240 140" className="h-auto w-full max-w-[280px]" aria-hidden>
      <rect x="16" y="20" width="120" height="88" rx="10" fill="var(--color-accent-soft)" />
      <rect x="28" y="36" width="72" height="8" rx="4" fill="var(--color-accent)" opacity="0.85" />
      <rect x="28" y="52" width="96" height="6" rx="3" fill="var(--color-border-strong)" />
      <rect x="28" y="66" width="84" height="6" rx="3" fill="var(--color-border)" />
      <rect x="28" y="84" width="48" height="12" rx="6" fill="var(--color-primary)" />
      <rect
        x="148"
        y="28"
        width="76"
        height="32"
        rx="8"
        fill="var(--color-surface-hover)"
        stroke="var(--color-border)"
      />
      <rect
        x="148"
        y="72"
        width="76"
        height="32"
        rx="8"
        fill="var(--color-surface-hover)"
        stroke="var(--color-border)"
      />
      <circle cx="164" cy="44" r="6" fill="var(--color-primary)" />
      <circle cx="164" cy="88" r="6" fill="var(--color-secondary)" />
    </svg>
  );
}

function PublisherSketch() {
  return (
    <svg viewBox="0 0 240 140" className="h-auto w-full max-w-[280px]" aria-hidden>
      <rect x="20" y="24" width="200" height="28" rx="8" fill="var(--color-accent-soft)" />
      <rect x="32" y="34" width="56" height="8" rx="4" fill="var(--color-accent)" opacity="0.9" />
      <rect
        x="20"
        y="64"
        width="92"
        height="52"
        rx="10"
        fill="var(--color-surface-hover)"
        stroke="var(--color-border)"
      />
      <rect
        x="128"
        y="64"
        width="92"
        height="52"
        rx="10"
        fill="var(--color-surface-hover)"
        stroke="var(--color-border)"
      />
      <rect x="32" y="78" width="48" height="6" rx="3" fill="var(--color-border-strong)" />
      <rect x="32" y="92" width="36" height="10" rx="5" fill="var(--color-secondary)" />
      <rect x="140" y="78" width="48" height="6" rx="3" fill="var(--color-border-strong)" />
      <rect x="140" y="92" width="36" height="10" rx="5" fill="var(--color-primary)" />
    </svg>
  );
}
