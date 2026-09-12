'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'
import { getDb, getGameIdBySlug } from '@mgc/db'
import { userGameStatus, ratings, groupSizeRatings, reviews, gameCorrections, auditLogs } from '@mgc/db/schema'
import { currentUser } from '@/lib/session'
import { getRuntimeConfig } from '@mgc/config'

export type LibraryStatus = 'played' | 'playing' | 'want_to_play' | 'dropped'

export interface ActionResult {
  ok: boolean
  error?: string
}

async function gameIdBySlug(slug: string): Promise<number | null> {
  const { db } = await getDb()
  return getGameIdBySlug(db, slug)
}

async function audit(actorId: string | null, action: string, targetType: string, targetId: string) {
  const { db } = await getDb()
  await db.insert(auditLogs).values({ actorId, action, targetType, targetId })
}

export async function setGameStatus(slug: string, status: LibraryStatus | null): Promise<ActionResult> {
  const features = getRuntimeConfig().features
  if (!features.ugc) return { ok: false, error: 'ugc_disabled' }
  const user = await currentUser()
  if (!user) return { ok: false, error: 'unauthorized' }
  const gameId = await gameIdBySlug(slug)
  if (!gameId) return { ok: false, error: 'not_found' }

  const { db } = await getDb()
  if (status == null) {
    await db
      .delete(userGameStatus)
      .where(and(eq(userGameStatus.userId, user.id), eq(userGameStatus.gameId, gameId)))
  } else {
    await db
      .insert(userGameStatus)
      .values({ userId: user.id, gameId, status })
      .onConflictDoUpdate({
        target: [userGameStatus.userId, userGameStatus.gameId],
        set: { status, updatedAt: new Date() },
      })
  }
  await audit(user.id, 'game_status_set', 'game', slug)
  revalidatePath(`/game/${slug}`)
  return { ok: true }
}

export async function rateGame(
  slug: string,
  input: { overall: number; groupSize?: number | null; difficulty?: number | null; grind?: number | null; communication?: number | null },
): Promise<ActionResult> {
  const features = getRuntimeConfig().features
  if (!features.ugc) return { ok: false, error: 'ugc_disabled' }
  const user = await currentUser()
  if (!user) return { ok: false, error: 'unauthorized' }
  const gameId = await gameIdBySlug(slug)
  if (!gameId) return { ok: false, error: 'not_found' }
  if (!Number.isInteger(input.overall) || input.overall < 1 || input.overall > 10) {
    return { ok: false, error: 'invalid_rating' }
  }

  const { db } = await getDb()
  await db
    .insert(ratings)
    .values({
      userId: user.id,
      gameId,
      overall: input.overall,
      difficulty: input.difficulty ?? null,
      grind: input.grind ?? null,
      communication: input.communication ?? null,
    })
    .onConflictDoUpdate({
      target: [ratings.userId, ratings.gameId],
      set: { overall: input.overall, updatedAt: new Date() },
    })

  if (input.groupSize != null && [2, 3, 4, 5].includes(input.groupSize)) {
    if (!Number.isInteger(input.overall) || input.overall < 1 || input.overall > 10) {
      return { ok: false, error: 'invalid_rating' }
    }
    await db
      .insert(groupSizeRatings)
      .values({ userId: user.id, gameId, groupSize: input.groupSize, score: input.overall })
      .onConflictDoUpdate({
        target: [groupSizeRatings.userId, groupSizeRatings.gameId, groupSizeRatings.groupSize],
        set: { score: input.overall },
      })
  }

  await audit(user.id, 'game_rated', 'game', slug)
  revalidatePath(`/game/${slug}`)
  return { ok: true }
}

export async function createReview(slug: string, body: string, groupSize: number | null): Promise<ActionResult> {
  const features = getRuntimeConfig().features
  if (!features.ugc) return { ok: false, error: 'ugc_disabled' }
  const user = await currentUser()
  if (!user) return { ok: false, error: 'unauthorized' }
  const gameId = await gameIdBySlug(slug)
  if (!gameId) return { ok: false, error: 'not_found' }

  const trimmed = body.trim()
  if (trimmed.length < 2 || trimmed.length > 280) {
    return { ok: false, error: 'invalid_body' }
  }

  const { db } = await getDb()
  await db
    .insert(reviews)
    .values({ userId: user.id, gameId, body: trimmed, groupSize })
    .onConflictDoUpdate({
      target: [reviews.userId, reviews.gameId],
      set: { body: trimmed, groupSize, createdAt: new Date() },
    })
  await audit(user.id, 'review_created', 'game', slug)
  revalidatePath(`/game/${slug}`)
  return { ok: true }
}

/** User corrections enter a review queue — never applied automatically (plan §30). */
export async function submitCorrection(
  slug: string | null,
  field: string,
  message: string,
): Promise<ActionResult> {
  const trimmed = message.trim()
  if (trimmed.length < 4 || trimmed.length > 1000) {
    return { ok: false, error: 'invalid_message' }
  }
  if (field.length > 100) return { ok: false, error: 'invalid_field' }

  const user = await currentUser()
  const { db } = await getDb()
  const gameId = slug ? await getGameIdBySlug(db, slug) : null
  await db.insert(gameCorrections).values({
    gameId,
    field: field.trim() || 'unknown',
    message: trimmed,
    createdBy: user?.id ?? null,
  })
  await audit(user?.id ?? null, 'correction_submitted', 'game', slug ?? 'site')
  return { ok: true }
}
