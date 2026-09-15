ROADMAP.md is a document to track my progress across the different challenges.

---

## Challenge 1

### Part 1

After running 'pnpm typecheck' here, 4 errors appeared in the terminal. These errors can be grouped into 2 categories:

1) Tooling fix
'Cors' has no type definitions since it ships at plain JS. So it needs a @types/ package to know its shape. I just need to install the types here that go along with it. I just run this: pnpm --filter @anvara/backend add -D @types/cors; and the error disappears

2) Narrowing a type
So here I need to take the broad type and replace it by a more specific type. In Express 5, `req.params` values are typed as `string | string[]`, but Prisma's `where` clauses expect a plain `string`.
- I add a type-guard check to the `POST /:id/unbook` route in adSlots.ts to make sure the `req.params` ID is a string, not a string[] (returning a 400 otherwise). Same for the two other errors with `userId` in auth.ts.

(Noticed that ESLint is going to crash before it even looks at my files until I fix the tooling for the bonus challenge)

### Part 2

Here, my job is to replace vague types with more specific types.

I've divided it into these categories:

- Cat 1: Replace any with a more specific type for functions like formatPrice, formatCurrency, etc.
  - The formatRelativeTime and formatDate functions took any for their date param; I typed it as string | number | Date (what the Date constructor accepts).
  - The sleep function was missing a return type; typing the promise as Promise<void> makes it return Promise<void> instead of the inferred Promise<unknown>.
- Cat 2: Remove useless (dead) code such as the unused variables unusedFormatter and unusedCheck (utils.ts), and unusedVariable (helpers.ts).
- Cat 3:
The debounce function has multiple any types. I should AVOID any at all costs. So I decided to replace any with a generic TArgs that captures the original function's argument types and reuses them for the debounced function.

The logger function currently uses any but I should use unknown instead. Why? Because any is too permissive in TS and says "Don't check anything" while the other unknown says "Idk what this is, but I KNOW I don't know so i need to prove it before I use it".

The cn function is a helper that combines CSS classes. the types that 'classes' can contain are at minimum string or false. So we want a type with both possibilities so thats a union type: string | false | null | undefined. And since it's an array: (string | false | null | undefined)[]

The parseQueryString function has two occurences where there is any. Need to use Record<string, string> instead.
Same thing for parsePagination.
Idem for buildFilters.
- Cat 4:
I believe this here is a false claim comment because the functionality of the current code is the same as what the comment wants me to change.

Done :-)

---

## Challenge 2

Here, I am working on the sponsor dashboard and more precisely making the data fetching server-side instead of the current client side fetch via useEffect.

sponsor/page.tsx is already doing the fetching as a Server Component for the auth/role . But the issue here is that <CampaignList> doesn't take it into account and RE-FETCHES it client side. So i need to push the data fetch up to the server and then stream it. 

Key point I noted here: await BEFORE the <Suspense> blocks the whole page while await INSIDE a Suspense child streams JUST that piece. Auth must block here (so that a logged out user can't see the dashb) but the campaigns list can stream. 

### Part 1

This is the foundation (server data fetching + making the card a Server Component).

lib/data.ts is the server data fetcher. 

I orchestrated 4 choices:
- headers() from next/headers: this API only exists server-side so it will make the whole module server exclusive (the API URL and auth cookie won't leak). (So i don't use "use client" since Server Component is the default).

- Cookie forwarding: So it grabs the cookie off the request that's incoming and passes it to the backend fetch. Rn, the backend ignores them but once Challenge 3 secures the API, it will read the BetterAuth session cookie from here. Built in rn so that Challenge 3 is a breeze. 

- cache: no-store: Next caches fetch by default but the per-user campaign data must be fresh each time so we disable it. 

- throw on a non-OK response: if the fetch fails, I throw instead of silently returning nothing, so the error bubbles up to the nearest error boundary (error.tsx) which renders a graceful error state.

Separately, campaign-card.tsx is now a Server Component. No need for "use client" since there's 0 interactivity, it ships no JS as a Server Component. I want a single source of truth so i put a shared Campaign type instead of the duplicated inline prop type. 

### Part 2

I made CampaignList an async Server Component. Removed useState, useEffect, etc. and the manual loading/error states since Suspense now owns the loading and error.tsx owns errors (error.tsx must be a "use client" component since error boundaries run in the browser). So I only keep the empty state where it takes sponsorId as a prop right from the server.

The skeleton is the <Suspense fallback> which mimics the card layout.

page.tsx wraps the list in <Suspense> so the header instantly renders allowing the list to stream. 
sponsorId is made a guaranteed string when passed down.

After these changes, and checking the sponsor dashboard page's source, Q1 Product Launch indeed appears in the source HTML which means it was fetched server-side. This is confirmed by the network tab too. 

