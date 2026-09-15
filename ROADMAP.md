ROADMAP.md is a document to track my progress across the different challenges.

---

### Challenge 1 -- Part 1

Status : Done

After running 'npm typecheck' here, 4 errors appeared in the terminal. These errors can be grouped into 2 categories: 

1) Tooling fix
'Cors' has no type definitions since it ships at plain JS. So it needs a @types/ package to know its shape. I just need to install the types here that go along with it. I just run this: pnpm --filter @anvara/backend add -D @types/cors; and the error disappears

2) Narrowing a type
So here I need to take the broad type and replace it by a more specific type.
- I add a check to the relevant POST under adSlots.ts to make sure ID is only a string, not [string]. Same for the two other errors with userId.

Done :-)

(NOticed that ESLint is going to crash before it even looks at my files until I fix the tooling for the bonus challenge)

---




