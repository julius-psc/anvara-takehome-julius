import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Backend Better Auth instance.
//
// It intentionally mirrors the frontend config (apps/frontend/auth.ts): same
// database and same secret. Better Auth stores its session/user tables in this
// shared Postgres, so a session cookie issued by the frontend can be validated
// here by looking it up in that shared table — the frontend does not need to be
// running for this to work.
//
// We only use this instance to READ sessions (auth.api.getSession); the frontend
// remains the source of truth for sign-in/sign-out.
export const auth = betterAuth({
  database: new Pool({ connectionString }),
  secret: process.env.BETTER_AUTH_SECRET || 'fallback-secret-for-dev',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3847',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  advanced: {
    disableCSRFCheck: true,
  },
});
