'use client';

import { useState } from 'react';
import type { Audience } from './content';
import { LandingCta } from './cta';
import { LandingFeatures } from './features';
import { LandingHero } from './hero';
import { LandingHowItWorks } from './how-it-works';

/** Client shell so the hero can own audience toggle state. */
export function Landing() {
  const [audience, setAudience] = useState<Audience>('sponsor');

  return (
    <>
      <LandingHero audience={audience} onAudienceChange={setAudience} />
      <LandingFeatures audience={audience} />
      <LandingHowItWorks audience={audience} />
      <LandingCta />
    </>
  );
}
