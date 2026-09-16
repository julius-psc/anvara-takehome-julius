export type Audience = 'sponsor' | 'publisher';

export type AudienceCopy = {
  eyebrow: string;
  title: string;
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

export const HOW_IT_WORKS: HowItWorksStep[] = [
  {
    title: 'Create your account',
    description: 'Sign in as a sponsor or publisher — each role unlocks the right dashboard.',
  },
  {
    title: 'List or browse inventory',
    description: 'Publishers add ad slots with rates. Sponsors explore the marketplace with clear pricing.',
  },
  {
    title: 'Book and run campaigns',
    description: 'Sponsors book placements and manage budgets. Publishers fill inventory without the chase.',
  },
];

export const SOCIAL_PROOF = [
  { value: '2 roles', label: 'Sponsors & publishers' },
  { value: '1 marketplace', label: 'Shared inventory' },
  { value: 'Minutes', label: 'From signup to listing' },
] as const;
