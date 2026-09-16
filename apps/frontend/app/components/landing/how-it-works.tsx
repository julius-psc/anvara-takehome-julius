import { HOW_IT_WORKS } from './content';

export function LandingHowItWorks() {
  return (
    <section
      aria-labelledby="landing-how-title"
      className="border-t border-(--color-border) py-14 sm:py-16"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-(--color-accent)">How it works</p>
        <h2
          id="landing-how-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-3xl"
        >
          Three steps from signup to live placements.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-(--color-muted) text-pretty">
          No decks, no long sales cycles — list inventory or book it in the same flow.
        </p>
      </div>

      <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {HOW_IT_WORKS.map((step, index) => (
          <li key={step.title} className="relative min-w-0">
            {index < HOW_IT_WORKS.length - 1 && (
              <span
                className="pointer-events-none absolute top-5 left-[2.75rem] hidden h-px bg-(--color-border) sm:right-[-0.75rem] sm:left-11 sm:block"
                aria-hidden
              />
            )}
            <div className="flex items-start gap-3 sm:flex-col sm:gap-4">
              <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-accent-soft) text-sm font-semibold text-(--color-accent)">
                {index + 1}
              </span>
              <div>
                <h3 className="font-medium text-(--color-foreground)">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-(--color-muted) text-pretty">
                  {step.description}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
