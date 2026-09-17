<div align="left" style="margin-bottom: 2rem;">
  <img src="https://anvara-production.nyc3.cdn.digitaloceanspaces.com/anvarabluetext.png" alt="Anvara" width="500" />
</div>

# Anvara Take-Home Test

```
## ⚠️ Important: Do NOT Fork This Repository

This is a take-home assessment. Please:

1. **Clone** (not fork) this repository
2. Work on it locally
3. Create your own **new public repository**
4. Push your work there
5. Send us the link to YOUR repository

Do not open pull requests to the original repo.
```

## Candidate Submission — What I Built

> Added by **Julius**. Everything below the [Table of Contents](#table-of-contents) is the original assessment README.

All **5 core challenges** are complete, plus the **entire bonus Design & UX track**, the **hidden challenges**, and two extra backend-hardening items. Commits are small and scoped; the reasoning behind each challenge is written by me in [`ROADMAP.md`](ROADMAP.md).

**Quality gate — all green:** `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build` · `pnpm format`. No `any` in application code, and the critical Next.js security advisory is patched.

### Core challenges

1. **Fix TypeScript errors** — added the missing `@types/*`, narrowed Express 5 `req.params` (`string | string[]` → a guarded `string`), and replaced every `any` with a precise type (a generic for `debounce`, `unknown` for the logger, a union for `cn`, `Record<string, string>` for the query helpers). Removed all dead code.
2. **Server-side data fetching** — the sponsor dashboard now fetches on the server and **streams** via `<Suspense>` (auth blocks, the list streams). I extended the same pattern to the **publisher dashboard** and the **marketplace**, each with an `error.tsx` boundary. The data layer forwards the session cookie, so it stayed correct once Challenge 3 locked the API down.
3. **Secure the API** — a backend Better Auth instance reads the _same_ Postgres session table the frontend writes. `requireAuth` (401) + `requireRole` (403); **ownership is always derived from the session, never the request**, and not-owned resources return 404 so existence is never leaked. Every campaign and ad-slot route is protected, including the `book`/`unbook` gap; CORS is pinned with credentials.
4. **CRUD operations** — `PUT`/`DELETE` for campaigns and ad-slots: ownership verified first, partial-update validation, ownership kept immutable (a smuggled `sponsorId`/`publisherId` is ignored), and correct `200/204/400/404` codes. Fixed the broken `POST /api/ad-slots` (it wrote fields that don't exist in the schema).
5. **Dashboards with Server Actions** — `'use server'` actions for create/update/delete that re-validate with Zod, forward the cookie, and call `revalidatePath()`. **One Zod schema validates on both client and server.** _Design decision:_ I used **React Hook Form + `zodResolver`** for client-side form state instead of `useFormState`/`useFormStatus` — they solve the same problem, RHF gives richer field-level UX and a built-in pending state, and `useFormState` is deprecated in React 19. The Server Action remains the real gate.

### Hidden challenges ("maybe there's more than five")

- Implemented the stubbed `GET /api/auth/me`.
- Fixed the broken `POST /api/ad-slots` (schema mismatch).
- Closed the unauthenticated `book`/`unbook` booking gap.

### Bonus — Design & UX track (complete)

- **Marketing landing page** — audience-toggled hero with image crossfade, an auto-advancing frosted card stack, features, an animated "how it works" (click-to-replay, per-role product miniatures), logo marquee, and closing CTA — plus full **SEO** (metadata, OG image, sitemap, robots, per-page titles).
- **Dashboard UI/UX** — stat cards, filter tabs, card/list views, Sonner toasts, confirmation modals, consistent empty states.
- **Animations & polish** — motion tokens, reusable enter/list primitives, a staggered blur-fade hero reveal, with `prefers-reduced-motion` honored throughout.
- **Mobile** — hamburger nav with an accessible slide-in drawer, bottom-sheet modals, safe-area insets, 44px touch targets.
- **Error & empty states** — shared `ErrorState`/`EmptyState`, route error boundaries, a branded 404, and `<Suspense>` skeletons.
- **Fix ESLint warnings** — repaired the broken lint toolchain and fixed every real warning (0 errors).
- **Pagination** — a shared control across both dashboards and the marketplace.
- **Dark mode (extra)** — OS-based semantic color tokens.

### Bonus — Backend hardening (extra)

- **Rate limiting** on all `/api` routes (`express-rate-limit`).
- **`PUT /api/sponsors/:id`** — completes the sponsor CRUD using the same session-ownership pattern (404 for others, 409 on duplicate email).

### Not attempted

The **Business** (marketplace conversions, newsletter, request-a-quote) and **Analytics** (GA, conversion tracking, A/B testing) bonus tracks — I chose to go deep on the design and engineering tracks instead.

---

## Table of Contents

- [Anvara Take-Home Test](#anvara-take-home-test)
  - [Table of Contents](#table-of-contents)
  - [tl;dr](#tldr)
  - [About This Assessment](#about-this-assessment)
  - [Tech Stack](#tech-stack)
  - [Assumptions](#assumptions)
  - [Project Structure](#project-structure)
  - [Quick Start](#quick-start)
    - [Clone Repository](#clone-repository)
    - [Automated Setup (Recommended)](#automated-setup-recommended)
    - [Manual Setup](#manual-setup)
  - [Development](#development)
  - [Database](#database)
  - [Authentication](#authentication)
  - [Documentation](#documentation)
    - [Individual Challenges](#individual-challenges)
    - [Bonus Challenges](#bonus-challenges)
  - [Resources](#resources)
  - [Need Help?](#need-help)

## tl;dr

- **�  New here? [Setup the Project](#quick-start)**
- **🎯 Ready to code? [Start the Challenges](#individual-challenges)**
- **❓ Need help? [Check the Docs](docs/README.md)**
- **📤 Done? [Submit Your Work](docs/submission.md)**

## About This Assessment

This take-home test is designed to evaluate your skills across multiple areas of full-stack development. **Complete as many challenges as you can** - you don't need to finish everything!

**Take your time.** Work at your own pace, and submit when you feel you've shown us your best work. Where you stop tells us about your current skill level, and that's perfectly okay. We'd rather see quality work on fewer challenges than rushed attempts at all of them.
A sponsorship marketplace connecting sponsors with publishers, built with modern best practices.

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS v4
- **Backend**: Express.js, Prisma ORM, PostgreSQL
- **Auth**: Better Auth
- **Monorepo**: PNPM workspaces
- **Testing**: Vitest
- **Linting**: ESLint 9

## Assumptions

- Node.js v20+
- PNPM v8+
- Docker installed and running

If not confident, see the [Setup Guide](docs/setup.md)

## Project Structure

```
apps/
├── frontend/                 # Next.js app (port 3847)
│   ├── app/
│   │   ├── components/       # Shared components
│   │   ├── api/auth/         # Better Auth routes
│   │   ├── dashboard/        # Role-based dashboards
│   │   │   ├── sponsor/
│   │   │   └── publisher/
│   │   └── marketplace/      # Public marketplace
│   └── lib/
│       ├── api.ts            # API client
│       ├── types.ts          # Type definitions
│       └── utils.ts          # Utilities
│
├── backend/                  # Express API (port 4291)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── index.ts          # API routes
│       ├── db.ts             # Prisma client
│       └── utils/
│           └── helpers.ts
│
└── packages/
    ├── config/               # Shared TypeScript config
    ├── eslint-config/        # Shared ESLint rules
    └── prettier-config/      # Shared Prettier config

scripts/
├── setup.ts                  # Automated setup script
└── tsconfig.json             # Scripts TypeScript config
```

## Quick Start

### Clone Repository

```bash
git clone https://github.com/anvara-project/take-home.git
cd take-home
```

### Automated Setup (Recommended)

```bash
pnpm setup-project
```

This runs the **complete setup** including dependency installation, Docker initialization, database setup, and seeding.

---

### Manual Setup

See the [Setup Guide](docs/setup.md) for detailed manual setup instructions.

## Development

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code with Prettier
pnpm format

# Open Prisma Studio
pnpm --filter @anvara/backend db:studio
```

## Database

PostgreSQL runs in Docker on port 5498:

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View Prisma Studio
pnpm --filter @anvara/backend db:studio
```

## Authentication

Better Auth is configured for role-based access:

- **Sponsors**: View campaigns, create placements
- **Publishers**: View ad slots, manage availability

**Demo accounts:**

- `sponsor@example.com` / `password`
- `publisher@example.com` / `password`

See the [setup guide](docs/setup.md) for configuration details.

## Documentation

| Document                                         | Description                     |
| ------------------------------------------------ | ------------------------------- |
| [Setup Guide](docs/setup.md)                     | Installation and configuration  |
| [Challenges Overview](docs/challenges/README.md) | All challenges and requirements |
| [Submission Guide](docs/submission.md)           | How to submit your work         |

### Individual Challenges

- [Challenge 1: Fix TypeScript Errors](docs/challenges/01-typescript.md)
- [Challenge 2: Server-Side Data Fetching](docs/challenges/02-server-components.md)
- [Challenge 3: Secure API Endpoints](docs/challenges/03-api-security.md)
- [Challenge 4: Complete CRUD Operations](docs/challenges/04-crud-operations.md)
- [Challenge 5: Dashboards with Server Actions](docs/challenges/05-server-actions.md)

### Bonus Challenges

Explore [all bonus challenges](docs/bonus-challenges/README.md) organized by category:

**🛒 Product & Business**

- [Improve Marketplace Conversions](docs/bonus-challenges/business/01-marketplace-conversions.md)
- [Newsletter Signup Form](docs/bonus-challenges/business/02-newsletter-signup.md)
- [Request a Quote Feature](docs/bonus-challenges/business/03-request-quote.md)

**🎨 Design & UX**

- [Marketing Landing Page](docs/bonus-challenges/design/01-landing-page.md)
- [Dashboard Redesign](docs/bonus-challenges/design/02-dashboard.md)
- [Campaign Builder Flow](docs/bonus-challenges/design/03-campaign-builder.md)
- [Mobile-First Experience](docs/bonus-challenges/design/04-mobile-responsive.md)
- [Dark Mode Support](docs/bonus-challenges/design/05-dark-mode.md)
- [Component Library](docs/bonus-challenges/design/06-component-library.md)
- [Data Table Pagination](docs/bonus-challenges/design/07-pagination.md)

**📊 Analytics & Testing**

- [Google Analytics Setup](docs/bonus-challenges/analytics/01-google-analytics.md)
- [Conversion Tracking](docs/bonus-challenges/analytics/02-conversion-tracking.md)
- [A/B Testing Framework](docs/bonus-challenges/analytics/03-ab-testing.md)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## Need Help?

- **Setup issues?** Check the [Setup Guide](docs/setup.md)
- **Challenge questions?** Review the [individual challenge pages](docs/challenges/README.md)
- **Submission questions?** See the [Submission Guide](docs/submission.md)
