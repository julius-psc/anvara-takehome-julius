export type Audience = 'sponsor' | 'publisher';

export type AudienceCopy = {
  eyebrow: string;
  title: string;
  /** Word in `title` rendered with the display serif for emphasis. */
  titleSerif?: string;
  subtext: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  illustrationLabel: string;
  illustrationHint: string;
};

export const AUDIENCE_COPY: Record<Audience, AudienceCopy> = {
  sponsor: {
    eyebrow: 'For sponsors',
    title: 'Book premium placements without the deck.',
    titleSerif: 'premium',
    subtext:
      'Browse publisher inventory with clear rates, set a budget, and launch campaigns that reach the audiences you already care about — in one marketplace.',
    primaryCta: { label: 'Browse marketplace', href: '/marketplace' },
    secondaryCta: { label: 'Sign in', href: '/login' },
    illustrationLabel: 'Sponsor view',
    illustrationHint: 'Campaign · budget · placements',
  },
  publisher: {
    eyebrow: 'For publishers',
    title: 'Turn your inventory into inbound demand.',
    titleSerif: 'inbound',
    subtext:
      'List ad slots with transparent pricing, get discovered by sponsors, and fill placements without chasing outreach or rebuilding the same pitch deck.',
    primaryCta: { label: 'Get started', href: '/login' },
    secondaryCta: { label: 'See marketplace', href: '/marketplace' },
    illustrationLabel: 'Publisher view',
    illustrationHint: 'Slots · rates · inbound offers',
  },
};

export const AUDIENCE_OPTIONS: { key: Audience; label: string }[] = [
  { key: 'sponsor', label: 'Sponsors' },
  { key: 'publisher', label: 'Publishers' },
];

export type FeatureItem = {
  title: string;
  description: string;
  icon: 'browse' | 'budget' | 'list' | 'discover';
  audience: Audience;
};

export const FEATURES: FeatureItem[] = [
  {
    audience: 'sponsor',
    icon: 'browse',
    title: 'Transparent inventory',
    description:
      'See formats, rates, and availability up front — no back-and-forth just to learn what a placement costs.',
  },
  {
    audience: 'sponsor',
    icon: 'budget',
    title: 'Campaigns with clear budgets',
    description:
      'Set a budget, pick placements that fit, and keep spend tied to the inventory you actually booked.',
  },
  {
    audience: 'publisher',
    icon: 'list',
    title: 'List slots once',
    description:
      'Publish your formats and pricing in a marketplace sponsors already browse — stop rewriting the same pitch.',
  },
  {
    audience: 'publisher',
    icon: 'discover',
    title: 'Inbound demand',
    description:
      'Get discovered by sponsors looking for your audience, instead of cold-outbound that never compounds.',
  },
];

export type HowItWorksStep = {
  title: string;
  description: string;
};

export type HowItWorksCopy = {
  title: string;
  subtext: string;
  steps: HowItWorksStep[];
};

export const HOW_IT_WORKS: Record<Audience, HowItWorksCopy> = {
  sponsor: {
    title: 'From login to a live campaign.',
    subtext: 'The same screens you’d use — pick a role, browse a slot, book it.',
    steps: [
      {
        title: 'Sign in as a sponsor',
        description: 'Choose Sponsor on login. The campaigns dashboard is the one that unlocks.',
      },
      {
        title: 'Browse inventory',
        description:
          'Marketplace cards show format, publisher, rate, and availability before you send a thing.',
      },
      {
        title: 'Book the placement',
        description:
          'Request the slot. It flips to Booked — the publisher gets the inbound request.',
      },
    ],
  },
  publisher: {
    title: 'From login to inbound demand.',
    subtext: 'List a slot once. Sponsors find it. The placement fills without the chase.',
    steps: [
      {
        title: 'Sign in as a publisher',
        description:
          'Choose Publisher on login. Your ad slots dashboard is the inventory you list.',
      },
      {
        title: 'List a slot with a rate',
        description:
          'Name, format, and price. The listing goes live in the marketplace sponsors already browse.',
      },
      {
        title: 'Get booked',
        description:
          'A booking request lands on that slot. Available becomes Booked — no outbound deck.',
      },
    ],
  },
};

export const SOCIAL_PROOF = [
  { value: '2 roles', label: 'Sponsors & publishers' },
  { value: '1 marketplace', label: 'Shared inventory' },
  { value: 'Minutes', label: 'From signup to listing' },
] as const;
