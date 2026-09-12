import { eq } from 'drizzle-orm'
import { PLATFORM_FAMILIES, PLATFORM_IDS, type CrossplayStatus, type PlatformId } from '@mgc/domain'
import type { MgcDatabase } from '../client'
import * as t from '../schema'
import { SEED_GAMES, type SeedGame } from './data'

const VERIFIED_AT = new Date('2026-09-01T00:00:00Z')

/** All ordered pairs (a < b) of a platform list. */
function pairs(list: PlatformId[]): Array<[PlatformId, PlatformId]> {
  const out: Array<[PlatformId, PlatformId]> = []
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      out.push([list[i]!, list[j]!])
    }
  }
  return out
}

/**
 * Expand a game's crossplay spec into canonical pair rules.
 * 'full' = every pair SUPPORTED; 'family' = same console family only;
 * 'none' = every pair NOT_SUPPORTED. Explicit pair arrays are used verbatim
 * and any unmentioned pair defaults to NOT_SUPPORTED.
 */
export function expandCrossplay(game: SeedGame): Array<{
  platformA: PlatformId
  platformB: PlatformId
  status: CrossplayStatus
  note: string | null
}> {
  const platforms = game.platforms
  const all = pairs(platforms)
  const spec = game.crossplay

  if (!spec || spec === 'none') {
    return all.map(([a, b]) => ({ platformA: a, platformB: b, status: 'NOT_SUPPORTED' as const, note: null }))
  }

  if (spec === 'full' || spec === 'family') {
    return all.map(([a, b]) => {
      if (spec === 'full') return { platformA: a, platformB: b, status: 'SUPPORTED' as const, note: null }
      const sameFamily = PLATFORM_FAMILIES[a] === PLATFORM_FAMILIES[b]
      return {
        platformA: a,
        platformB: b,
        status: (sameFamily ? 'SUPPORTED' : 'NOT_SUPPORTED') as CrossplayStatus,
        note: sameFamily ? null : '不支持跨平台家族联机',
      }
    })
  }

  const explicit = new Map<string, { status: CrossplayStatus; note: string | null }>()
  for (const [a, b, status, note] of spec) {
    const key = [a, b].sort().join('#')
    explicit.set(key, { status, note: note ?? null })
  }
  return all.map(([a, b]) => {
    const key = [a, b].sort().join('#')
    const found = explicit.get(key)
    return { platformA: a, platformB: b, status: found?.status ?? 'NOT_SUPPORTED', note: found?.note ?? null }
  })
}

export async function runSeed(db: MgcDatabase): Promise<void> {
  await db.transaction(async (tx) => {
    // --- dictionaries -----------------------------------------------------
    for (const [index, slug] of PLATFORM_IDS.entries()) {
      await tx
        .insert(t.platforms)
        .values({ slug, family: PLATFORM_FAMILIES[slug], sortOrder: index })
        .onConflictDoUpdate({ target: t.platforms.slug, set: { family: PLATFORM_FAMILIES[slug], sortOrder: index } })
    }
    const genreSlugs = [...new Set(SEED_GAMES.flatMap((g) => g.genres))]
    for (const slug of genreSlugs) {
      await tx.insert(t.genres).values({ slug }).onConflictDoNothing({ target: t.genres.slug })
    }
    const tagSlugs = [...new Set(SEED_GAMES.flatMap((g) => g.tags))]
    for (const slug of tagSlugs) {
      await tx.insert(t.tags).values({ slug }).onConflictDoNothing({ target: t.tags.slug })
    }

    const platformRows = await tx.select({ id: t.platforms.id, slug: t.platforms.slug }).from(t.platforms)
    const genreRows = await tx.select({ id: t.genres.id, slug: t.genres.slug }).from(t.genres)
    const tagRows = await tx.select({ id: t.tags.id, slug: t.tags.slug }).from(t.tags)
    const platformId = new Map(platformRows.map((r) => [r.slug, r.id]))
    const genreId = new Map(genreRows.map((r) => [r.slug, r.id]))
    const tagId = new Map(tagRows.map((r) => [r.slug, r.id]))

    // --- games --------------------------------------------------------------
    for (const game of SEED_GAMES) {
      const [gameRow] = await tx
        .insert(t.games)
        .values({
          slug: game.slug,
          name: game.name,
          releaseYear: game.releaseYear,
          developer: game.developer,
          publisher: game.publisher,
          popularity: game.popularity,
          editorRating: game.communityRating,
          coverHue: game.hue,
          featured: game.featured ?? false,
        })
        .onConflictDoUpdate({
          target: t.games.slug,
          set: {
            name: game.name,
            releaseYear: game.releaseYear,
            developer: game.developer,
            publisher: game.publisher,
            popularity: game.popularity,
            editorRating: game.communityRating,
            coverHue: game.hue,
            featured: game.featured ?? false,
            updatedAt: new Date(),
          },
        })
        .returning({ id: t.games.id })
      const gameId = gameRow!.id

      // Localizations (upsert; en is the canonical fallback).
      const localizations = [
        { locale: 'en', name: game.name, short: game.descEn.short, long: game.descEn.long },
        { locale: 'zh-hans', name: game.descZh.short ? game.name : game.name, short: game.descZh.short, long: game.descZh.long },
      ]
      for (const loc of localizations) {
        await tx
          .insert(t.gameLocalizations)
          .values({
            gameId,
            locale: loc.locale,
            name: loc.name,
            shortDescription: loc.short,
            description: loc.long,
            seoTitle: `${loc.name} — 联机 / Crossplay / 推荐人数`,
          })
          .onConflictDoUpdate({
            target: [t.gameLocalizations.gameId, t.gameLocalizations.locale],
            set: { name: loc.name, shortDescription: loc.short, description: loc.long },
          })
      }

      // Relations: rebuild fresh on re-seed.
      await tx.delete(t.gamePlatforms).where(eq(t.gamePlatforms.gameId, gameId))
      await tx.delete(t.gameGenres).where(eq(t.gameGenres.gameId, gameId))
      await tx.delete(t.gameTags).where(eq(t.gameTags.gameId, gameId))
      for (const p of game.platforms) {
        await tx.insert(t.gamePlatforms).values({ gameId, platformId: platformId.get(p)! }).onConflictDoNothing()
      }
      for (const g of game.genres) {
        await tx.insert(t.gameGenres).values({ gameId, genreId: genreId.get(g)! }).onConflictDoNothing()
      }
      for (const tag of game.tags) {
        await tx.insert(t.gameTags).values({ gameId, tagId: tagId.get(tag)! }).onConflictDoNothing()
      }

      // Coop profile.
      await tx
        .insert(t.gameCoopProfiles)
        .values({
          gameId,
          onlineCoop: game.onlineMax >= 2,
          localCoop: game.local != null,
          splitScreen: game.splitScreen ?? false,
          lan: game.lan ?? false,
          minOnlinePlayers: game.onlineMin,
          maxOnlinePlayers: game.onlineMax,
          minLocalPlayers: game.local?.[0] ?? 1,
          maxLocalPlayers: game.local?.[1] ?? 1,
          coopCampaign: true,
          dedicatedServer: game.dedicated ?? null,
          friendPass: game.friendPass ?? false,
          copiesRequired: game.copies ?? 'each_own_copy',
          sessionLength: game.session,
          difficulty: game.difficulty ?? null,
          grind: game.grind ?? null,
          communication: game.communication ?? null,
          intensity: game.intensity,
          editorGroupRatings: game.groupRatings ?? {},
          sourceUrl: game.sourceUrl ?? null,
          verifiedAt: VERIFIED_AT,
          verifiedBy: 'seed-editor',
          confidence: 'editor',
        })
        .onConflictDoUpdate({
          target: t.gameCoopProfiles.gameId,
          set: {
            onlineCoop: game.onlineMax >= 2,
            localCoop: game.local != null,
            splitScreen: game.splitScreen ?? false,
            lan: game.lan ?? false,
            minOnlinePlayers: game.onlineMin,
            maxOnlinePlayers: game.onlineMax,
            minLocalPlayers: game.local?.[0] ?? 1,
            maxLocalPlayers: game.local?.[1] ?? 1,
            dedicatedServer: game.dedicated ?? null,
            friendPass: game.friendPass ?? false,
            copiesRequired: game.copies ?? 'each_own_copy',
            sessionLength: game.session,
            difficulty: game.difficulty ?? null,
            grind: game.grind ?? null,
            communication: game.communication ?? null,
            intensity: game.intensity,
            editorGroupRatings: game.groupRatings ?? {},
            verifiedAt: VERIFIED_AT,
          },
        })

      // Crossplay rules: rebuild fresh.
      await tx.delete(t.crossplayRules).where(eq(t.crossplayRules.gameId, gameId))
      for (const rule of expandCrossplay(game)) {
        await tx.insert(t.crossplayRules).values({
          gameId,
          platformAId: platformId.get(rule.platformA)!,
          platformBId: platformId.get(rule.platformB)!,
          status: rule.status,
          note: rule.note,
          verifiedAt: VERIFIED_AT,
          verifiedBy: 'seed-editor',
          confidence: 'editor',
        })
      }

      // Cross-save: store a supported row per pair when the game supports it.
      await tx.delete(t.crossSaveRules).where(eq(t.crossSaveRules.gameId, gameId))
      if (game.crossSave) {
        for (const [a, b] of pairs(game.platforms)) {
          await tx.insert(t.crossSaveRules).values({
            gameId,
            platformAId: platformId.get(a)!,
            platformBId: platformId.get(b)!,
            supported: true,
            verifiedAt: VERIFIED_AT,
          })
        }
      }

      // Editorial source.
      if (game.sourceUrl) {
        await tx.insert(t.gameSources).values({
          gameId,
          sourceType: 'official_site',
          sourceUrl: game.sourceUrl,
          notes: 'Seed import 2026-09',
        })
      }
    }
  })
}
