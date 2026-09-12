import fs from 'node:fs'
import path from 'node:path'
import { drizzle as drizzlePostgresJs, type PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite'
import { PGlite } from '@electric-sql/pglite'
import * as schema from './schema'

/**
 * One database type for the whole app. On Cloudflare Workers every query is a
 * single HTTPS request via Neon's serverless driver (drizzle-orm/neon-http) —
 * workerd pins sockets to the request that opened them, so reusing a
 * long-lived postgres.js/pg Pool across requests hangs ("code had hung" →
 * 1101). Node hosts (local dev, seeding) keep postgres.js; with no connection
 * string we fall back to PGlite (PostgreSQL-in-WASM): same SQL, same schema,
 * zero external services. All three expose the same Drizzle API surface we
 * use, so the cast is safe for everything in queries.ts.
 */
export type MgcDatabase = PostgresJsDatabase<typeof schema>

export type DbDriver = 'pglite' | 'pg' | 'neon-http'

export interface DbHandle {
  db: MgcDatabase
  driver: DbDriver
  /** Close the underlying connection (PGlite holds a lock on its data dir). */
  close: () => Promise<void>
}

/**
 * Connection string injected by the host app when the DB config lives in a
 * runtime binding rather than process.env (e.g. Cloudflare Hyperdrive via
 * instrumentation). Stored on globalThis because Next bundles the
 * instrumentation entry and server entries as separate module instances —
 * a module-level variable would not be shared. Set once at startup.
 */
const INJECTED_CS_KEY = '__MGC_DB_CONNECTION_STRING__'

export function setInjectedConnectionString(connectionString: string): void {
  ;(globalThis as Record<string, unknown>)[INJECTED_CS_KEY] = connectionString
}

function getInjectedConnectionString(): string | null {
  const injected = (globalThis as Record<string, unknown>)[INJECTED_CS_KEY]
  return typeof injected === 'string' && injected.length > 0 ? injected : null
}

export async function createDb(): Promise<DbHandle> {
  // Connection source precedence:
  //   1. DATABASE_URL — secret on Workers, env var on Node hosts
  //   2. injected string — set at startup by host apps that pre-resolve bindings
  //   3. DATABASE_URL from the Cloudflare context — belt and braces; OpenNext
  //      already mirrors secrets into process.env. Resolved per request here
  //      because getCloudflareContext() is guaranteed available in request
  //      scope (unlike startup hooks).
  // This is the repo's single deliberate platform touchpoint.
  let onCloudflare = false
  let cloudflareDatabaseUrl: string | null = null
  try {
    const { getCloudflareContext } = await import('@opennextjs/cloudflare')
    const { env } = getCloudflareContext()
    onCloudflare = true
    cloudflareDatabaseUrl = (env as { DATABASE_URL?: string }).DATABASE_URL ?? null
  } catch {
    // Not running on Cloudflare Workers.
  }

  const databaseUrl =
    process.env.DATABASE_URL ?? getInjectedConnectionString() ?? cloudflareDatabaseUrl

  if (databaseUrl) {
    if (onCloudflare) {
      // HTTP SQL API: no socket lifecycle to hang across requests (see type
      // comment above). Requires Neon's pooled connection string (…-pooler…)
      // and a database migrated/seeded out-of-band — see getDb().
      const { drizzle: drizzleNeonHttp } = await import('drizzle-orm/neon-http')
      return {
        db: drizzleNeonHttp(databaseUrl, { schema }) as unknown as MgcDatabase,
        driver: 'neon-http',
        close: async () => {},
      }
    }
    const postgres = (await import('postgres')).default
    const client = postgres(databaseUrl, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
      // Pooler-friendly: no named prepared statements, and skip the
      // per-connect type introspection queries.
      prepare: false,
      fetch_types: false,
      onnotice: () => {},
    })
    return {
      db: drizzlePostgresJs(client, { schema }) as MgcDatabase,
      driver: 'pg',
      close: () => client.end({ timeout: 5 }),
    }
  }

  const dataDir = process.env.PGLITE_DATA_DIR
    ? path.resolve(process.env.PGLITE_DATA_DIR)
    : path.resolve(process.cwd(), '.pglite-data')
  if (onCloudflare) {
    throw new Error(
      'Database not configured on Workers: set the DATABASE_URL secret (Neon pooled URL). ' +
        'Refusing to start PGlite — it cannot persist on serverless runtimes.',
    )
  }
  fs.mkdirSync(dataDir, { recursive: true })
  const client = new PGlite(dataDir)
  return {
    db: drizzlePglite(client, { schema }) as unknown as MgcDatabase,
    driver: 'pglite',
    close: () => client.close(),
  }
}

/**
 * Locate the drizzle migrations folder whether we run from the repo root,
 * apps/web (next dev) or packages/db (seed script). Production deployments
 * can pin it via MIGRATIONS_DIR.
 */
export function resolveMigrationsDir(): string {
  if (process.env.MIGRATIONS_DIR) return path.resolve(process.env.MIGRATIONS_DIR)

  let dir = process.cwd()
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'packages/db/drizzle')
    if (fs.existsSync(path.join(candidate, 'meta', '_journal.json'))) return candidate
    // Seed script runs with cwd = packages/db itself.
    const local = path.join(dir, 'drizzle')
    if (fs.existsSync(path.join(local, 'meta', '_journal.json')) && path.basename(dir) === 'db') {
      return local
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(
    'Migrations folder not found. Run `pnpm db:generate` first, or set MIGRATIONS_DIR.',
  )
}
