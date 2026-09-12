import type { GameCandidate, GroupPreferences, ScoreBreakdown } from '@mgc/domain'

/**
 * Preference scoring (plan §32 layer 2). Weights mirror the plan's v1 table.
 * Every part returns 0–1; missing data scores a neutral 0.5 rather than 0 so
 * that an unrated game isn't buried — but also never inflated (no fake
 * precision, cf. plan §24).
 */
export const WEIGHTS = {
  genreSimilarity: 0.25,
  groupSizeFit: 0.2,
  communityRating: 0.15,
  playStyle: 0.15,
  sessionLength: 0.1,
  difficulty: 0.05,
  popularity: 0.05,
  freshness: 0.05,
} as const

export type ScorePart = keyof typeof WEIGHTS

const NEUTRAL = 0.5

export function scoreGame(game: GameCandidate, prefs: GroupPreferences): ScoreBreakdown {
  return {
    genreSimilarity: genreSimilarity(game, prefs),
    groupSizeFit: groupSizeFit(game, prefs),
    communityRating: game.communityRating != null ? clamp01(game.communityRating / 10) : NEUTRAL,
    playStyle: playStyleMatch(game, prefs),
    sessionLength: sessionLengthMatch(game, prefs),
    difficulty: difficultyMatch(game, prefs),
    popularity: Math.sqrt(clamp01(game.popularity / 100)),
    freshness: freshness(game),
  }
}

export function weightedTotal(breakdown: ScoreBreakdown): number {
  let total = 0
  for (const [part, weight] of Object.entries(WEIGHTS)) {
    total += breakdown[part as ScorePart] * weight
  }
  return clamp01(total)
}

function genreSimilarity(game: GameCandidate, prefs: GroupPreferences): number {
  const wanted = new Set([...prefs.genres, ...prefs.likedTags])
  if (wanted.size === 0) return NEUTRAL
  const have = new Set([...game.genres, ...game.tags])
  let overlap = 0
  for (const item of wanted) {
    if (have.has(item)) overlap += 1
  }
  // Dice coefficient over the union vocabularies.
  return clamp01((2 * overlap) / (wanted.size + have.size))
}

function groupSizeFit(game: GameCandidate, prefs: GroupPreferences): number {
  const bucket = (prefs.players >= 5 ? 5 : prefs.players) as 2 | 3 | 4 | 5
  const rating = game.groupSizeRatings[bucket]
  if (rating != null) return clamp01(rating / 10)
  // Fall back to overall rating so a game can't win on a dimension it has
  // no data for — but only at 80% strength, below an explicitly rated fit.
  if (game.communityRating != null) return clamp01((game.communityRating / 10) * 0.8)
  return NEUTRAL
}

const INTENSITY_ORDER = ['casual', 'medium', 'hardcore'] as const

function playStyleMatch(game: GameCandidate, prefs: GroupPreferences): number {
  if (prefs.intensity === 'any') return NEUTRAL
  return proximityScore(INTENSITY_ORDER.indexOf(game.coop.intensity), INTENSITY_ORDER.indexOf(prefs.intensity))
}

const SESSION_ORDER = ['short', 'medium', 'long'] as const

function sessionLengthMatch(game: GameCandidate, prefs: GroupPreferences): number {
  if (prefs.sessionLength === 'any') return NEUTRAL
  return proximityScore(SESSION_ORDER.indexOf(game.coop.sessionLength), SESSION_ORDER.indexOf(prefs.sessionLength))
}

function proximityScore(a: number, b: number): number {
  if (a < 0 || b < 0) return NEUTRAL
  const distance = Math.abs(a - b)
  if (distance === 0) return 1
  if (distance === 1) return 0.6
  return 0.2
}

/** Casual groups want low difficulty; hardcore groups want the opposite. */
function difficultyMatch(game: GameCandidate, prefs: GroupPreferences): number {
  if (game.coop.difficulty == null || prefs.intensity === 'any') return NEUTRAL
  const target = prefs.intensity === 'casual' ? 2.5 : prefs.intensity === 'medium' ? 5 : 8
  return clamp01(1 - Math.abs(game.coop.difficulty - target) / 5)
}

const CURRENT_YEAR = 2026
const AGE_DECAY_YEARS = 15

function freshness(game: GameCandidate): number {
  if (game.releaseYear == null) return NEUTRAL
  const age = CURRENT_YEAR - game.releaseYear
  return clamp01(1 - age / AGE_DECAY_YEARS)
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}
