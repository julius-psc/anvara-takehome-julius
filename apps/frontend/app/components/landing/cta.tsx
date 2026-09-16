import Link from 'next/link';
import { SOCIAL_PROOF } from './content';

export function LandingCta() {
  return (
    <section
      aria-labelledby="landing-cta-title"
      className="border-t border-(--color-border) py-14 sm:py-16"
    >
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-6 py-10 shadow-(--shadow-sm) sm:px-10 sm:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="landing-cta-title"
            className="text-2xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-3xl"
          >
            Ready to connect sponsors and publishers?
          </h2>
          <p className="mt-3 text-base leading-relaxed text-(--color-muted) text-pretty">
            Browse live inventory or list your first ad slot — the marketplace is the product.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/marketplace"
              className="btn-primary rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Browse marketplace
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-(--color-border) bg-(--color-background) px-5 py-2.5 text-sm font-medium text-(--color-foreground) transition-colors hover:bg-(--color-surface-hover)"
            >
              Sign in to get started
            </Link>
          </div>
        </div>

        <dl className="mx-auto mt-10 grid max-w-3xl gap-6 border-t border-(--color-border) pt-8 sm:grid-cols-3 sm:gap-4">
          {SOCIAL_PROOF.map((item) => (
            <div key={item.label} className="text-center">
              <dt className="sr-only">{item.label}</dt>
              <dd>
                <p className="font-numeric text-xl font-semibold tracking-tight text-(--color-foreground)">
                  {item.value}
                </p>
                <p className="mt-1 text-sm text-(--color-muted)">{item.label}</p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
