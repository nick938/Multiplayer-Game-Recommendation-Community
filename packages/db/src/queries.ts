import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import type {
  CoopProfile,
  CrossplayStatus,
  GameCandidate,
  GenreId,
  PlatformId,
  TagId,
} from '@mgc/domain'
import type { MgcDatabase } from './client'
import * as t from './schema'

/**
 * Data access for the MVP catalog size (≤ a few hundred games): load the
 * whole published catalog with relations and aggregates, then filter/score in
 * the app. At 1,000+ games this moves to SQL filtering + a search provider
 * (Meilisearch per plan §46) — the GameCandidate shape won't change.
 */

/** Localization fallback: requested → zh-hans (for zh-hant) → en. */
export function localizationChain(locale: string): string[] {
  if (locale === 'en') return ['en']
  if (locale === 'zh-hant') return ['zh-hant', 'zh-hans', 'en']
  return [locale, 'en']
}

export interface GroupSizeStat {
  score: number
  count: number
  /** 'editor' until community votes reach EDITOR_OVERRIDE_THRESHOLD. */
  source: 'editor' | 'community'
}

/** Community votes needed before they outrank editorial scores. */
export const EDITOR_OVERRIDE_THRESHOLD = 3

export interface CatalogEntry {
  id: number
  slug: string
  name: string
  /** Localized name when available (game.name otherwise). */
  displayName: string
  shortDescription: string | null
  description: string | null
  releaseYear: number | null
  developer: string | null
  publisher: string | null
  popularity: number
  coverHue: number
  featured: boolean
  platforms: PlatformId[]
  genres: GenreId[]
  tags: TagId[]
  coop: CoopProfile | null
  crossplay: Array<{ a: PlatformId; b: PlatformId; status: CrossplayStatus; note: string | null }>
  crossSave: boolean
  communityRating: number | null
  ratingCount: number
  ratingSource: 'editor' | 'community'
  groupSizeRatings: Partial<Record<2 | 3 | 4 | 5, GroupSizeStat>>
}

/** Serverless Postgres resilience: retry transient connect/query failures. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)))
    }
  }
  throw lastError
}

export async function loadCatalog(db: MgcDatabase, locale: string): Promise<CatalogEntry[]> {
  const chain = localizationChain(locale)
  const platformsA = alias(t.platforms, 'pa')
  const platformsB = alias(t.platforms, 'pb')

  const [gameRows, locRows, platformRows, genreRows, tagRows, crossplayRows, crossSaveRows, ratingAgg, groupAgg] =
    await Promise.all([
      withRetry(() =>
        db
        .select({
          id: t.games.id,
          slug: t.games.slug,
          name: t.games.name,
          releaseYear: t.games.releaseYear,
          developer: t.games.developer,
          publisher: t.games.publisher,
          popularity: t.games.popularity,
          coverHue: t.games.coverHue,
          featured: t.games.featured,
          editorRating: t.games.editorRating,
          coop: t.gameCoopProfiles,
        })
        .from(t.games)
        .leftJoin(t.gameCoopProfiles, eq(t.gameCoopProfiles.gameId, t.games.id))
        .where(eq(t.games.published, true))
        .orderBy(asc(t.games.name))
      ),
      withRetry(() =>
        db
        .select({
          gameId: t.gameLocalizations.gameId,
          locale: t.gameLocalizations.locale,
          name: t.gameLocalizations.name,
          shortDescription: t.gameLocalizations.shortDescription,
          description: t.gameLocalizations.description,
        })
        .from(t.gameLocalizations)
        .where(inArray(t.gameLocalizations.locale, chain))
      ),
      withRetry(() =>
        db
        .select({ gameId: t.gamePlatforms.gameId, slug: t.platforms.slug })
        .from(t.gamePlatforms)
        .innerJoin(t.platforms, eq(t.platforms.id, t.gamePlatforms.platformId))
      ),
      withRetry(() =>
        db
        .select({ gameId: t.gameGenres.gameId, slug: t.genres.slug })
        .from(t.gameGenres)
        .innerJoin(t.genres, eq(t.genres.id, t.gameGenres.genreId))
      ),
      withRetry(() =>
        db
        .select({ gameId: t.gameTags.gameId, slug: t.tags.slug })
        .from(t.gameTags)
        .innerJoin(t.tags, eq(t.tags.id, t.gameTags.tagId))
      ),
      withRetry(() =>
        db
        .select({
          gameId: t.crossplayRules.gameId,
          a: platformsA.slug,
          b: platformsB.slug,
          status: t.crossplayRules.status,
          note: t.crossplayRules.note,
        })
        .from(t.crossplayRules)
        .innerJoin(platformsA, eq(platformsA.id, t.crossplayRules.platformAId))
        .innerJoin(platformsB, eq(platformsB.id, t.crossplayRules.platformBId))
      ),
      withRetry(() =>
        db
        .select({ gameId: t.crossSaveRules.gameId })
        .from(t.crossSaveRules)
        .where(eq(t.crossSaveRules.supported, true))
      ),
      withRetry(() =>
        db
        .select({
          gameId: t.ratings.gameId,
          avg: sql<number>`avg(${t.ratings.overall})::float`,
          count: sql<number>`count(*)::int`,
        })
        .from(t.ratings)
        .groupBy(t.ratings.gameId)
      ),
      withRetry(() =>
        db
        .select({
          gameId: t.groupSizeRatings.gameId,
          size: t.groupSizeRatings.groupSize,
          avg: sql<number>`avg(${t.groupSizeRatings.score})::float`,
          count: sql<number>`count(*)::int`,
        })
        .from(t.groupSizeRatings)
        .groupBy(t.groupSizeRatings.gameId, t.groupSizeRatings.groupSize)
      ),
    ])

  // Best available localization per game along the fallback chain.
  const locByGame = new Map<number, (typeof locRows)[number]>()
  for (const row of locRows) {
    const current = locByGame.get(row.gameId)
    if (!current || chain.indexOf(row.locale) < chain.indexOf(current.locale)) {
      locByGame.set(row.gameId, row)
    }
  }

  const platformsByGame = groupBy(platformRows, (r) => r.gameId, (r) => r.slug as PlatformId)
  const genresByGame = groupBy(genreRows, (r) => r.gameId, (r) => r.slug as GenreId)
  const tagsByGame = groupBy(tagRows, (r) => r.gameId, (r) => r.slug as TagId)
  const rulesByGame = groupBy(
    crossplayRows,
    (r) => r.gameId,
    (r) => ({ a: r.a as PlatformId, b: r.b as PlatformId, status: r.status, note: r.note }),
  )
  const crossSaveByGame = new Set(crossSaveRows.map((r) => r.gameId))
  const ratingByGame = new Map(ratingAgg.map((r) => [r.gameId, r]))
  const groupByGame = new Map<number, Partial<Record<2 | 3 | 4 | 5, GroupSizeStat>>>()
  for (const row of groupAgg) {
    const bucket = (row.size >= 5 ? 5 : row.size) as 2 | 3 | 4 | 5
    const existing = groupByGame.get(row.gameId) ?? {}
    existing[bucket] = { score: Math.round(row.avg * 10) / 10, count: row.count, source: 'community' }
    groupByGame.set(row.gameId, existing)
  }

  const entries: CatalogEntry[] = []
  for (const row of gameRows) {
    const loc = locByGame.get(row.id)
    const coop = row.coop
    const rating = ratingByGame.get(row.id)
    // Merge editorial + community: community wins once it has enough votes,
    // otherwise the editorial score stands (clearly labelled upstream).
    const editorGroup = (coop?.editorGroupRatings ?? {}) as Record<string, number | undefined>
    const mergedGroup: Partial<Record<2 | 3 | 4 | 5, GroupSizeStat>> = { ...groupByGame.get(row.id) }
    for (const size of [2, 3, 4, 5] as const) {
      const community = mergedGroup[size]
      const editorScore = editorGroup[String(size)]
      if ((!community || community.count < EDITOR_OVERRIDE_THRESHOLD) && editorScore != null) {
        mergedGroup[size] = { score: editorScore, count: community?.count ?? 0, source: 'editor' }
      }
    }

    const communityUsable = rating != null && rating.count >= EDITOR_OVERRIDE_THRESHOLD
    const overallRating = communityUsable ? Math.round(rating.avg * 10) / 10 : (row.editorRating ?? null)

    entries.push({
      id: row.id,
      slug: row.slug,
      name: row.name,
      displayName: loc?.name ?? row.name,
      shortDescription: loc?.shortDescription ?? null,
      description: loc?.description ?? null,
      releaseYear: row.releaseYear,
      developer: row.developer,
      publisher: row.publisher,
      popularity: row.popularity,
      coverHue: row.coverHue,
      featured: row.featured,
      platforms: [...(platformsByGame.get(row.id) ?? [])].sort((a, b) => platformOrder(a) - platformOrder(b)),
      genres: [...(genresByGame.get(row.id) ?? [])],
      tags: [...(tagsByGame.get(row.id) ?? [])],
      coop: coop ? mapCoop(coop) : null,
      crossplay: [...(rulesByGame.get(row.id) ?? [])],
      crossSave: crossSaveByGame.has(row.id),
      communityRating: overallRating,
      ratingCount: rating?.count ?? 0,
      ratingSource: communityUsable ? 'community' : 'editor',
      groupSizeRatings: mergedGroup,
    })
  }

  return entries
}

type CoopRow = typeof t.gameCoopProfiles.$inferSelect
function mapCoop(coop: CoopRow): CoopProfile {
  return {
    onlineCoop: coop.onlineCoop,
    localCoop: coop.localCoop,
    splitScreen: coop.splitScreen,
    lan: coop.lan,
    minOnlinePlayers: coop.minOnlinePlayers,
    maxOnlinePlayers: coop.maxOnlinePlayers,
    minLocalPlayers: coop.minLocalPlayers,
    maxLocalPlayers: coop.maxLocalPlayers,
    coopCampaign: coop.coopCampaign,
    dedicatedServer: coop.dedicatedServer,
    friendPass: coop.friendPass,
    copiesRequired: coop.copiesRequired,
    sessionLength: coop.sessionLength,
    difficulty: coop.difficulty,
    grind: coop.grind,
    communication: coop.communication,
    intensity: coop.intensity,
    sourceUrl: coop.sourceUrl,
    verifiedAt: coop.verifiedAt?.toISOString() ?? null,
    confidence: coop.confidence,
  }
}

export function toGameCandidate(entry: CatalogEntry): GameCandidate | null {
  const coop = entry.coop
  if (!coop) return null
  return {
    id: entry.id,
    slug: entry.slug,
    name: entry.displayName,
    releaseYear: entry.releaseYear,
    popularity: entry.popularity,
    platforms: entry.platforms,
    genres: entry.genres,
    tags: entry.tags,
    coop,
    crossplayRules: entry.crossplay.map((r) => ({ platformA: r.a, platformB: r.b, status: r.status, note: r.note })),
    crossSaveSupported: entry.crossSave,
    communityRating: entry.communityRating,
    groupSizeRatings: Object.fromEntries(
      Object.entries(entry.groupSizeRatings).map(([size, stat]) => [size, stat.score]),
    ) as Partial<Record<2 | 3 | 4 | 5, number>>,
  }
}

export async function getGameIdBySlug(db: MgcDatabase, slug: string): Promise<number | null> {
  const [row] = await db.select({ id: t.games.id }).from(t.games).where(eq(t.games.slug, slug)).limit(1)
  return row?.id ?? null
}

export interface ReviewRow {
  id: number
  author: string
  body: string
  groupSize: number | null
  createdAt: Date
}

export async function getReviews(db: MgcDatabase, gameId: number): Promise<ReviewRow[]> {
  const rows = await db
    .select({
      id: t.reviews.id,
      body: t.reviews.body,
      groupSize: t.reviews.groupSize,
      createdAt: t.reviews.createdAt,
      author: t.userProfiles.displayName,
      fallbackName: t.user.name,
    })
    .from(t.reviews)
    .innerJoin(t.user, eq(t.user.id, t.reviews.userId))
    .leftJoin(t.userProfiles, eq(t.userProfiles.userId, t.reviews.userId))
    .where(eq(t.reviews.gameId, gameId))
    .orderBy(desc(t.reviews.createdAt))
    .limit(50)
  return rows.map((r) => ({
    id: r.id,
    author: r.author ?? r.fallbackName,
    body: r.body,
    groupSize: r.groupSize,
    createdAt: r.createdAt,
  }))
}

export async function getUserGameStatuses(db: MgcDatabase, userId: string) {
  return db
    .select({ gameId: t.userGameStatus.gameId, status: t.userGameStatus.status })
    .from(t.userGameStatus)
    .where(eq(t.userGameStatus.userId, userId))
}

/** Games in the signed-in user's library, joined with catalog data. */
export async function getUserLibrary(db: MgcDatabase, userId: string, locale: string) {
  const catalog = await loadCatalog(db, locale)
  const statuses = new Map((await getUserGameStatuses(db, userId)).map((s) => [s.gameId, s.status]))
  return catalog
    .filter((entry) => statuses.has(entry.id))
    .map((entry) => ({ entry, status: statuses.get(entry.id)! }))
}

const PLATFORM_ORDER: PlatformId[] = ['pc', 'ps5', 'ps4', 'xbox-series', 'xbox-one', 'switch']
function platformOrder(p: PlatformId): number {
  const index = PLATFORM_ORDER.indexOf(p)
  return index === -1 ? 99 : index
}

function groupBy<T, K>(rows: T[], key: (row: T) => number, map: (row: T) => K): Map<number, Set<K>> {
  const out = new Map<number, Set<K>>()
  for (const row of rows) {
    const k = key(row)
    const set = out.get(k) ?? new Set<K>()
    set.add(map(row))
    out.set(k, set)
  }
  return out
}

// Re-export for convenience so callers don't import drizzle internals.
export { and, eq }
