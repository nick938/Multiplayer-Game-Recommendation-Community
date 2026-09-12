import { sql } from 'drizzle-orm'
import { getDb } from '../index'
import * as t from '../schema'

const { db, driver, seeded, close } = await getDb()

const [gamesRow] = await db.select({ games: sql<number>`count(*)::int` }).from(t.games)
const [rulesRow] = await db.select({ rules: sql<number>`count(*)::int` }).from(t.crossplayRules)
const [locsRow] = await db.select({ locs: sql<number>`count(*)::int` }).from(t.gameLocalizations)

console.log(`driver=${driver} freshly_seeded=${seeded}`)
console.log(`games=${gamesRow?.games ?? 0} crossplay_rules=${rulesRow?.rules ?? 0} localizations=${locsRow?.locs ?? 0}`)

await close()
