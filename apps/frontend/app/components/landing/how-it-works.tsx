'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import type { Audience } from './content';
import { HOW_IT_WORKS } from './content';
import { HowStepIllustration } from './how-it-works-illustrations';

/**
 * Per-step dwell. Sponsor browse matches `--duration-how-browse` (2s) so the
 * book step follows the click; other steps hold past `--duration-how-story`.
 */
const STEP_MS: Record<Audience, number[]> = {
  sponsor: [4000, 2000, 4000],
  publisher: [4000, 4000, 4000],
};

const EMPTY_PLAY_GEN = [0, 0, 0] as const;

export function LandingHowItWorks({ audience }: { audience: Audience }) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  /** Bumped when a step is user-focused so an already-playing step can remount. */
  const [playGen, setPlayGen] = useState<number[]>(() => [...EMPTY_PLAY_GEN]);
  const copy = HOW_IT_WORKS[audience];

  // Only run the story while the section is on screen. Reset to the first step
  // whenever it re-enters so the sequence always plays from the beginning.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setActiveIndex(0);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // A role change is a new story — start at step one. Resetting during render
  // (vs. an effect) is React's pattern for "reset state when a prop changes" and
  // avoids the extra commit-then-re-render an effect would cause.
  const [seenAudience, setSeenAudience] = useState(audience);
  if (seenAudience !== audience) {
    setSeenAudience(audience);
    setActiveIndex(0);
    setPlayGen([...EMPTY_PLAY_GEN]);
  }

  // Advance the spotlight while visible (including reduced motion — opacity only).
  // Timeout (not interval) so each step can dwell a different length.
  useEffect(() => {
    if (!inView) return;

    const dwell = STEP_MS[audience][activeIndex] ?? 4000;
    const id = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % copy.steps.length);
    }, dwell);

    return () => window.clearTimeout(id);
  }, [inView, audience, activeIndex, copy.steps.length]);

  function focusStep(index: number) {
    setActiveIndex(index);
    setPlayGen((gens) => {
      const next = [...gens];
      next[index] = (next[index] ?? 0) + 1;
      return next;
    });
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="landing-how-title"
      className="px-4 py-14 sm:px-6 sm:py-16 lg:px-12 xl:px-16"
    >
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-(--color-accent)">How it works</p>
        <h2
          id="landing-how-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground) text-balance sm:text-3xl"
        >
          {copy.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-(--color-muted) text-pretty">{copy.subtext}</p>
      </div>

      <ol className="how-steps mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        {copy.steps.map((step, index) => {
          // Spotlight one step at a time (opacity). Miniatures only animate when
          // motion is allowed — under reduced motion they stay on the finished frame.
          const isActive = inView && index === activeIndex;
          const playing = !reduceMotion && isActive;

          return (
            <li
              key={step.title}
              className={`how-steps__card min-w-0${isActive ? ' how-steps__card--active' : ''}`}
            >
              <button
                type="button"
                className="how-steps__hit flex h-full w-full flex-col text-left"
                onClick={() => focusStep(index)}
                aria-current={isActive ? 'step' : undefined}
              >
                <div
                  className="relative flex min-h-64 items-center justify-center sm:min-h-72"
                  aria-hidden
                >
                  <HowStepIllustration
                    key={
                      playing
                        ? `${audience}-${index}-play-${playGen[index] ?? 0}`
                        : `${audience}-${index}-rest`
                    }
                    audience={audience}
                    step={index}
                    playing={playing}
                  />
                </div>

                <div className="flex flex-1 flex-col gap-2 pt-1">
                  <h3 className="text-base font-semibold tracking-tight text-(--color-foreground)">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-(--color-muted) text-pretty">
                    {step.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
