import crypto from 'node:crypto'
import { sql } from 'drizzle-orm'
import type { MigrationMeta } from 'drizzle-orm/migrator'
import { createDb } from './client'
import { EMBEDDED_MIGRATIONS } from './migrations.generated'
import * as schema from './schema'

export interface MgcDb {
  db: import('./client').MgcDatabase
  driver: import('./client').DbDriver
  /** True when the games table was empty and seed data was just inserted. */
  seeded: boolean
  close: () => Promise<void>
}

let initPromise: Promise<MgcDb> | undefined

/**
 * Singleton DB handle: opens the connection, applies migrations and seeds an
 * empty database with the starter catalog. Safe to call concurrently — the
 * work runs once and every caller awaits the same promise.
 */
export function getDb(): Promise<MgcDb> {
  if (!initPromise) {
    initPromise = init().catch((error) => {
      initPromise = undefined
      console.error('[mgc] database init failed:', error instanceof Error ? error.message : error)
      throw error
    })
  }
  return initPromise
}

async function init(): Promise<MgcDb> {
  const handle = await createDb()
  // Neon's HTTP driver can't run drizzle's migrator, and the Neon database is
  // migrated + seeded out-of-band from a Node host (DATABASE_URL=… pnpm
  // db:seed, the postgres.js path). Workers go straight to queries.
  if (handle.driver === 'neon-http') {
    return { ...handle, seeded: false }
  }
  await applyMigrations(handle)

  const [countRow] = await handle.db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.games)

  if ((countRow?.count ?? 0) > 0) {
    return { ...handle, seeded: false }
  }

  const { runSeed } = await import('./seed/run')
  await runSeed(handle.db)
  return { ...handle, seeded: true }
}

/**
 * Applies the embedded drizzle-kit migrations via drizzle's own
 * `dialect.migrate` (the layer the official migrator delegates to after
 * reading files). Migrations are embedded at `pnpm db:embed` time so nothing
 * reads the filesystem at runtime — drizzle's file-reading migrator breaks
 * under bundlers like Turbopack, which rewrite its path lookups.
 */
async function applyMigrations(handle: Awaited<ReturnType<typeof createDb>>): Promise<void> {
  const migrations: MigrationMeta[] = EMBEDDED_MIGRATIONS.map((migration) => {
    const query = migration.statements.join('\n--> statement-breakpoint\n')
    return {
      sql: migration.statements,
      bps: true,
      folderMillis: 0,
      hash: crypto.createHash('sha256').update(query).digest('hex'),
    }
  })

  // dialect/session exist at runtime on every drizzle instance but are not on
  // the public type — bridge them structurally for this one call.
  const migrationCapable = handle.db as unknown as {
    dialect: {
      migrate: (
        migrations: MigrationMeta[],
        session: unknown,
        config: Record<string, never>,
      ) => Promise<void>
    }
    session: unknown
  }
  await migrationCapable.dialect.migrate(migrations, migrationCapable.session, {})
}

export { schema }
export * from './queries'
