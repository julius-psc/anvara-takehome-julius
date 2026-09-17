import { cn } from '@/lib/utils';
import { FEATURES, type Audience, type FeatureItem } from './content';

function FeatureIcon({ name }: { name: FeatureItem['icon'] }) {
  const common = 'h-6 w-6';
  switch (name) {
    case 'browse':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="2.5" y="3.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2.5 7.5h15" stroke="currentColor" strokeWidth="1.5" />
          <path d="M6 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'budget':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 6.5v7M7.75 8.25c.4-.7 1.15-1 2.25-1 1.35 0 2.25.6 2.25 1.6 0 .85-.6 1.35-2 1.7-1.5.4-2.25.9-2.25 1.85 0 1.05 1 1.6 2.35 1.6 1.15 0 1.9-.35 2.3-1.05"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'list':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 5.5h12M4 10h12M4 14.5h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'discover':
      return (
        <svg className={common} viewBox="0 0 20 20" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}

export function LandingFeatures({ audience }: { audience: Audience }) {
  const sponsorFeatures = FEATURES.filter((f) => f.audience === 'sponsor');
  const publisherFeatures = FEATURES.filter((f) => f.audience === 'publisher');

  return (
    <section
      aria-labelledby="landing-features-title"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-12 xl:px-16"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-(--color-accent)">Why Anvara</p>
        <h2
          id="landing-features-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-3xl"
        >
          Built for both sides of the sponsorship deal.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-(--color-muted) text-pretty">
          Sponsors get discoverable inventory. Publishers get inbound demand. Same marketplace —
          different jobs.
        </p>
      </div>

      <div className="mt-10 grid gap-12 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        <FeatureGroup
          label="For Sponsors"
          items={sponsorFeatures}
          active={audience === 'sponsor'}
        />
        <FeatureGroup
          label="For Publishers"
          items={publisherFeatures}
          active={audience === 'publisher'}
        />
      </div>
    </section>
  );
}

function FeatureGroup({
  label,
  items,
  active,
}: {
  label: string;
  items: FeatureItem[];
  active: boolean;
}) {
  return (
    <div
      className={cn(
        'transition-opacity duration-300 ease-out',
        active ? 'opacity-100' : 'opacity-40',
      )}
      aria-current={active ? 'true' : undefined}
    >
      <h3 className="text-base font-medium text-(--color-muted)">{label}</h3>
      <ul className="mt-5 space-y-5 ps-5 sm:ps-6">
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-(--color-surface) text-(--color-accent)">
              <FeatureIcon name={item.icon} />
            </span>
            <div className="min-w-0">
              <p className="font-medium text-(--color-foreground)">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-(--color-muted) text-pretty">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
