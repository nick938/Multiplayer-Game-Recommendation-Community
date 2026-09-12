import { sql } from 'drizzle-orm'
import { getDb } from '@mgc/db'
import { games as gamesTable } from '@mgc/db/schema'
import { getRuntimeConfig } from '@mgc/config'

export const dynamic = 'force-dynamic'

/**
 * Health check: DB connectivity + catalog size. Used by uptime monitors and
 * the go-live checklist; also surfaces DB init errors as JSON in one place.
 */
export async function GET() {
  try {
    const { db } = await getDb()
    const [row] = await db.select({ games: sql<number>`count(*)::int` }).from(gamesTable).limit(1)
    return Response.json({ ok: true, region: getRuntimeConfig().region, games: row?.games ?? 0 })
  } catch (error) {
    const parts: string[] = []
    let current: unknown = error
    for (let depth = 0; depth < 4 && current; depth++) {
      if (current instanceof Error) {
        parts.push(`${current.name}: ${current.message}`)
        current = current.cause
      } else {
        parts.push(String(current))
        break
      }
    }
    return Response.json({ ok: false, error: parts.join('\n  caused by ') }, { status: 500 })
  }
}
