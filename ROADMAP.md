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
