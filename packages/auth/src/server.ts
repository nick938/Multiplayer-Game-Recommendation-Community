import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { getDb } from '@mgc/db'
import { authTables } from '@mgc/db/schema'

export type MgcAuth = ReturnType<typeof createAuth>

function createAuth(db: Awaited<ReturnType<typeof getDb>>['db']) {
  // Social providers activate only when credentials exist in the environment —
  // never commit literals (CN builds must not depend on Google/Discord anyway).
  const socialProviders: Record<string, unknown> = {}
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    socialProviders.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
  }
  if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
    socialProviders.discord = {
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }
  }

  return betterAuth({
    // Fail fast in production when no secret is configured; values come from
    // the environment only — never literals (see .env.example).
    secret: process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: drizzleAdapter(db, { provider: 'pg', schema: authTables }),
    emailAndPassword: { enabled: true },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    socialProviders,
  })
}

let authPromise: Promise<MgcAuth> | undefined

/** Lazily-initialized Better Auth instance bound to the app database. */
export function getAuth(): Promise<MgcAuth> {
  if (!authPromise) {
    authPromise = getDb().then(({ db }) => createAuth(db)).catch((error) => {
      authPromise = undefined
      throw error
    })
  }
  return authPromise
}

/** Server-side session lookup for server components and actions. */
export async function getSession(headers: Headers) {
  const auth = await getAuth()
  return auth.api.getSession({ headers })
}
