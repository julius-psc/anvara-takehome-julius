'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { HOW_IT_WORKS } from './content';

/** Time each step holds focus before advancing. Marketing pace — deliberate. */
const STEP_MS = 2800;

export function LandingHowItWorks() {
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HOW_IT_WORKS.length);
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <section
      aria-labelledby="landing-how-title"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-12 xl:px-16"
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

      <ol className="how-steps mt-10 grid gap-5 sm:grid-cols-3 sm:gap-4 lg:gap-5">
        {HOW_IT_WORKS.map((step, index) => {
          const isActive = reduceMotion || index === activeIndex;

          return (
            <li
              key={step.title}
              className={`how-steps__card min-w-0${isActive ? ' how-steps__card--active' : ''}`}
              aria-current={isActive && !reduceMotion ? 'step' : undefined}
            >
              <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-sm)">
                {/* Illustration slot — swap this block for real art later */}
                <div className="relative aspect-4/3 bg-(--color-accent-soft)" aria-hidden>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-numeric text-4xl font-semibold tracking-tight text-(--color-accent)/35">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                  <h3 className="text-base font-semibold tracking-tight text-(--color-foreground)">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-(--color-muted) text-pretty">
                    {step.description}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
