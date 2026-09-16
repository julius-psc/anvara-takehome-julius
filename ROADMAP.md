ROADMAP.md is a document to track my progress across the different challenges.

---

## Hidden challenges / extras found

Stuff I found and handled beyond the 5 numbered challenges:

- Implemented `GET /api/auth/me` — it was a TODO stub waiting for the Challenge 3 auth middleware, now it validates the session and returns the current user.
- Fixed the broken `POST /api/ad-slots` — it was writing `dimensions` and `pricingModel`, fields that don't exist in the Prisma schema. Removed them + added real validation.
- Flagged (not missed) the `book`/`unbook` auth gap — see the security note under Challenge 3.

(more to come as I go)

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

Done :-))

### Later: extended the same pattern to the marketplace

While polishing the marketplace UI I noticed it was still fetching client-side (useEffect in the grid) — the FIXME in page.tsx even called it out. So I gave it the same treatment as the dashboards: added getMarketplaceAdSlots() in lib/data.ts (server fetch of the public /api/ad-slots, no cookie needed, no-store so availability stays fresh), turned the grid into an async Server Component, wrapped it in <Suspense> with a matching skeleton, and added a marketplace error.tsx boundary. So the marketplace now streams server-rendered too. (The detail page [id] still fetches client-side — it has the book/unbook interactivity so it needs a server/client split; noted as follow-up.)

---

## Challenge 3

Now, let's move to the interesting part which is authentication and authorization. Currently the backend has no auth, authMiddleware just calls next(). 

The little issue: Better Auth is configured on the frontend but the backend is separate Express app. HOWEVER, Better Auth stores its session/user tables in the same Postgres, joined up by the same BETTER_AUTH_SECRET. So the backend can read a frontend's issued session, just by looking up that shared table. 

Basically, the frontend doesn't even need to be running.

### Part 1

I need to create a Better Auth instance on the backend that's the same as the frontend config, same DB and same secret.

This is only used to read sessions while the frontend stays the sole source of truth for signing in/out.

Noticed the same type tooling error as in Challenge 1 for pg with no type declarations so i installed it with  @types/pg

### Part 2

So I start by bridging the Express Node headers object into the Web Headers object Better Auth expects. (line 30-32).

So if there's no valid session, 401.

The Better Auth users table doesn't know about sponsors/publishers because they live in the domain tables. That's where the role + the ownership id come from. 

So if it's a valid session, it looks up the Sponsor and Publisher records in parallel by userId to get the user's role and sponsorId/publisherId which is then attached to req.user.

requireRole() is a new addition where it returns 403 for the wrong role

So overall here the concept to retain from this is : requireAuth is authentication (hmm,, who are you?) while the ownership scoping in the routes is authorization ("what are you allowed to do ?")

Found a hidden challenge with  GET /api/auth/me so it's requireAuth and then returns req.user.

### Part 3

So now I apply to requireAuth to the whole router and I found three security patterns : 

1.The list of all campaigns:  GET /api/campaigns
The risk: returning everyone's campaigns or letting the caller pick anyone's campaign to see.
The old implementation trusted a query param :  /api/campaigns?sponsorId=<anyone> o basically i could put anyone's id in the URL and read the person's campaigns.

The pattern here : scope the query to the SESSION

const sponsorId = req.user?.sponsorId;        // this is from the logged in session
if (!sponsorId) { res.status(403)...; return; }

const campaigns = await prisma.campaign.findMany({
  where: { sponsorId },                        // so i should only show THIS sponsor's rows. 
});

Basically the sponsorId comes from who you are (the session) and not what you asked (the URL)

2. One single campaign: GET /api/campaigns/:id
The risk: I know a campaign's id so i request /api/campaigns/<your-campaign-id> and read it even thouh it's not mine. 

The pattern here: put ownership INSIDE the lookup, then 404 if it's not found. 

const campaign = await prisma.campaign.findFirst({
  where: { id, sponsorId },                    // must match id AND be mine
});

if (!campaign) {
  res.status(404).json({ error: 'Campaign not found' }); // missing OR not mine
  return;
}

Since now the query requires both my id AND my sponsorId, someone else's campaign never matches so reads as "404 not found". 

3. Create a campaign : POST /api/campaigns
The risk: I send { name: "...", sponsorId: "<your-id>" } in the body and create a campaign under your account.

The pattern here: ignore sponsorId that's in the body and set it from the session.

const { name, budget, startDate, endDate /* I didn't include sponsorId */ } = req.body;

await prisma.campaign.create({
  data: {
    name, budget, /* ... */
    sponsorId,                                 // from session, not from body
  },
});

So the key idea from all these 3 patterns is that : Ownership should be decided by the session, not by the request. Whether reading a list, an item or creating one, the sponsorId comes from the person who's logged in, not the client's input (ex: query param)

### Part 4

So we want a marketplace that is browsable without login so GET /api/ad-slots and GET /:id stay public. I added  GET /api/ad-slots/mine which will return ONLY the publisher's own slots. I placed it before /:id so that Express doesn't read "mine" as an id. 

POST /api/ad-slots had unexisting fields that don't exist in the Prisma schema. So I removed them and then publisherId is now from the session, with validation.

Here, I implemented the same 3 pattern security as campaigns, but just with publisherId. If a sponsor tries a publisher action, 403.

### Security note I want to flag (book/unbook)

While securing the ad-slots I noticed POST /api/ad-slots/:id/book and /unbook are still unauthenticated and trust a sponsorId from the request body, so technically anyone could mark a slot (un)available. I deliberately scoped these out for now: the booking flow is a stub (it doesn't create a real Placement record yet) and locking it down properly means designing that model + it touches the public marketplace "book" action. I flagged it directly in the code with a SECURITY TODO comment. The fix would follow the exact same pattern as everything else: require an authenticated sponsor and take sponsorId from the session, not the body. So this is a KNOWN + identified gap, not a missed one.

**Update — closed the /book gap.** Came back and secured POST /api/ad-slots/:id/book properly: it now runs through requireAuth and derives sponsorId from the session (403 for non-sponsors), instead of trusting the body. Two supporting changes were needed to make a cross-origin authenticated request actually work: (1) CORS had to stop using the wildcard default — a wildcard origin can't be combined with credentials — so I pinned it to the frontend origin (BETTER_AUTH_URL) with credentials: true (this also cleared the CORS FIXME); (2) the frontend booking fetch now sends credentials: 'include' and no longer passes sponsorId in the body. Booking still just flips availability (Placement model is still a stub) — but the security-critical "who is booking" is now trustworthy.

**Also closed /unbook.** Went ahead and locked down /unbook too so there are no open auth holes left. Authorization model: only the **owning publisher** can reset a slot — resetting availability is editing your own inventory, so it reuses the exact ownership check as PUT/DELETE (requireAuth + findFirst on { id, publisherId }, 404 if not yours). Frontend: the unbook fetch sends credentials, the "Reset listing" link now only renders for the publisher who owns the slot (roleInfo.publisherId === adSlot.publisher.id), and I removed the old sponsor-facing "reset for testing" button (a sponsor legitimately can't reset a publisher's inventory, so it would've just 403'd). Net result: both book and unbook are fully authenticated + authorized, no SECURITY TODOs left in the codebase.

### Part 5

Now I need to make the frontend reflect the new security model. Before, the sponsor dashboard was sending /api/campaigns?sponsorId=X, but the backend now ignores that and scopes by the session, so sending it is basically "wrong" now (it implies the client controls the scoping when it shouldn't).

So I dropped sponsorId everywhere on the frontend: lib/data.ts just fetches /api/campaigns (cookie only), CampaignList doesn't take a sponsorId prop anymore, and page.tsx only checks the role (it no longer passes an id down). The client just asks "give me MY campaigns" and the server decides who "my" is.

Done :-)))

---

## Challenge 4

### Part 1

Here i'm going to deal with PUT/DELETE for campaigns (routes/campaigns.ts) which I added and both are behind requireAuth and scoped to the session.

Slight issue : Prisma's update() and delete() only accept a UNIQUE selector - for campaigns that's just the id. 
So I can't write where: { id, sponsorId } on the update itself. The pattern is:
1. findFirst({ where: { id, sponsorId } }) to verify ownership,
2. 404 if it's missing or not mine,
3. then update/delete by id.

PUT specifcis : 
- Partial update with spreading of ...(field !== undefined && { field }). Basically only the fields actually sent get changed. (ex: a campaign can be renamed without resending everything)

- Validation of provided fields : ex: name must be non-empty, budget a positive number, status must be a valid CampaignStatus enum if sent.

- Ownership is as always IMMUTABLE, but there's a subtle diff between create and update: on CREATE i set sponsorId FROM the session (a new row needs an owner), but on UPDATE i just leave sponsorId OUT of the data object entirely. So even if the client sneaks a sponsorId into the body it's ignored and the campaign stays with its original owner. (Proved it: I PUT a TechStartup sponsorId onto Acme's campaign, the name changed but the sponsorId stayed Acme's.)

- Returns 200+ the updated record

DELETE specifics: 
- Same ownership verif
- Returns 204 but No Content

### Part 2

Here I'm going to deal with PUT/DELETE for ad-slots.

Same pattern as campaigns, but with publisherId instead of sponsorId. However, the ad-slots router keeps public browse routes, PUT/DELETE get requireAuth PER ROUTE (unlike campaigns which has it on the WHOLE router)

- Same ownership immutability: publisherId is left out of the update data, so a sneaky publisherId in the body is ignored (tested it with "publisherId":"HACK" and it got ignored).
- Validation on the provided fields: valid enum type, positive basePrice, boolean isAvailable.

- PUT → 200, DELETE → 204.
- Bonus: the DELETE endpoint cleaned up the leftover "Test Slot" from Ch3 testing (publisher's slot count went 5 to 4).


### Testing both resources

Ran the full matrix on campaigns + ad-slots: no auth -> 401, wrong role -> 403, own -> 200/204, invalid input -> 400, someone else's -> 404, ownership injection -> ignored.

Lesson learnt: my first cross-owner 404 test was a FALSE POSITIVE - a shell bug left the id empty, so the 404 came from hitting a non-existent route, not from ownership. I re-ran it against a real other-owner slot AND confirmed that slot still returns 200 publicly, which proves the 404 meant "denied", not "gone". So i should always double-check that a test is actually exercising what i think it is.

Done :-))))

---

## Challenge 5

Setup Done: installed zod (v4) + react-hook-form + @hookform/resolvers, and created apps/frontend/lib/schemas.ts with shared campaignSchema and adSlotSchema.

### Part 1

Let's setup the Server Actions for campaigns with create/update and delete.

Here i create an actions.ts with 'use server' for the three Server Actions. For each,

- re-validate with campaignSchema.safeParse because I should never trust the client, the server should be the gatekeeper.
- it forwards the cookie to the backend so requireAuth passes
- calls revalidatePath('/dashboard/sponsor') so that the server-rendered list refreshes after the change
- returns a structured { success | error, fieldErrors }

### Part 2

Here we are using React Hook Form +  zodResolver(campaignSchema) so that the same schema validates on the client. One schema, but in two places.

I implemented clean number typing, avoiding a string/number coercion clash

Submit -> call the action -> success closes the modal. otherwise, failure shows a banner and maps fieldErrors back to their respective inputs.

One modal is used for creating/editing campaigns.

### Part 3

Now let's deal with the publisher dashboard. However it currently uses 'use client' and useEffect + useState. So I need to refactor it to stream Server Components, using the new /api/ad-slots/mine from Challenge 3.

Oh yeah and there's a little bug that I fixed:  lib/types.ts's AdSlot union was missing 'NATIVE'.

Only error.tsx should be client. 

### Part 4

Now that the publisher dashboard is fully server-rendered and streaming, let's build the ad-slot actions + forms, so that it mirrors the sponsor dashb. 

I started by the shared action helpers into one module (lib/action-utils.ts used by both dashboards) and then the ad-slot form UI with RHF/ZOd forms. 

Amazing, after testing it all seems to work perfectly !!

So i made a quick design decision: the docs suggest to use  useFormState/useFormStatus but I decided to use React Hook Form and Zod instead because they both solve the same problem, so it's redundant. RHF owns client-side form state + validation and gives isSubmitting for the pending state. The Server Action re-validates with the same Zod schema (so basically client= UX and server= the real gate). 

## Fixing the ESLint toolchain (ESLint bonus)

pnpm lint was crashing before it even read my code: typescript-eslint 8.66 doesn't support TS 7.0. So i fixed it by pinning TypeScript to 5.7.3 (a supported version) - typecheck still passes. A second crash was eslint-plugin-react's version auto-detect calling context.getFilename(), removed in ESLint 10, so I pinned react.version to "19.0" to skip detection.

Once lint actually ran, I fixed the real errors: turned off no-undef for TS files (typescript-eslint's own recommendation - TS catches undefined refs, no-undef just misfires on process/RequestInit/React), typed the remaining `any` in lib/api.ts + the marketplace grid, removed dead code/unused imports, and fixed a genuine react-hooks/set-state-in-effect issue in nav.tsx (made the role fetch cancellation-safe). Result: pnpm lint passes, 0 errors.

Done :-)))))

---
