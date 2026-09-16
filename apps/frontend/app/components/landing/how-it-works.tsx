'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { HOW_IT_WORKS } from './content';
import {
  AccountIllustration,
  CampaignIllustration,
  InventoryIllustration,
} from './how-it-works-illustrations';

/** Spotlight dwell — long enough to read one step's transition, then hold. */
const STEP_MS = 3600;

export function LandingHowItWorks() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Advance the spotlight only while visible; parked at step 0 otherwise.
  useEffect(() => {
    if (reduceMotion || !inView) return;

    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % HOW_IT_WORKS.length);
    }, STEP_MS);

    return () => window.clearInterval(id);
  }, [reduceMotion, inView]);

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
          Three steps from signup to live placements.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-(--color-muted) text-pretty">
          No decks, no long sales cycles — list inventory or book it in the same flow.
        </p>
      </div>

      <ol className="how-steps mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        {HOW_IT_WORKS.map((step, index) => {
          // Reduced motion keeps every card lit; otherwise the in-view section
          // spotlights one step at a time. Only that step's miniature animates.
          const isActive = reduceMotion || (inView && index === activeIndex);
          const playing = !reduceMotion && inView && index === activeIndex;

          return (
            <li
              key={step.title}
              className={`how-steps__card min-w-0${isActive ? ' how-steps__card--active' : ''}`}
              aria-current={isActive && !reduceMotion ? 'step' : undefined}
            >
              <article className="flex h-full flex-col">
                <div className="relative flex aspect-4/3 items-center justify-center" aria-hidden>
                  {index === 0 && <AccountIllustration playing={playing} />}
                  {index === 1 && <InventoryIllustration playing={playing} />}
                  {index === 2 && <CampaignIllustration playing={playing} />}
                </div>

                <div className="flex flex-1 flex-col gap-2 pt-1">
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
