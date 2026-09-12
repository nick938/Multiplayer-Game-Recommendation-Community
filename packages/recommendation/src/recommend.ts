import type { GameCandidate, GroupPreferences, RecommendationResult } from '@mgc/domain'
import { hardFilter } from './filters'
import { buildReasons } from './reasons'
import { scoreGame, weightedTotal } from './score'

export interface RecommendOptions {
  /** Only return the top N results (default 12). */
  limit?: number
}

export interface RecommendOutput {
  results: RecommendationResult[]
  /** How many games passed every hard filter before limiting. */
  totalMatches: number
  /** Candidates eliminated by each hard filter — useful for finder UX ("为什么没有结果"). */
  filteredOut: Record<string, number>
}

/**
 * Recommendation v1: hard filters + weighted scoring (plan §31–33).
 * No AI, no collaborative filtering — those are v2/v3 and depend on data
 * this MVP doesn't have yet.
 */
export function recommend(games: GameCandidate[], prefs: GroupPreferences, options: RecommendOptions = {}): RecommendOutput {
  const filteredOut: Record<string, number> = {}
  const scored: RecommendationResult[] = []

  for (const game of games) {
    const outcome = hardFilter(game, prefs)
    if (!outcome.ok) {
      filteredOut[outcome.failure!] = (filteredOut[outcome.failure!] ?? 0) + 1
      continue
    }

    const breakdown = scoreGame(game, prefs)
    const total = weightedTotal(breakdown)

    const { strengths, caveats } = buildReasons(game, prefs, outcome.compatibility, breakdown)
    scored.push({
      game,
      matchPercent: Math.round(total * 100),
      breakdown,
      strengths,
      caveats,
      playableOn: outcome.compatibility.playableOn,
      needsCrossplay: outcome.compatibility.needsCrossplay,
    })
  }

  scored.sort((a, b) => b.matchPercent - a.matchPercent || b.game.popularity - a.game.popularity || a.game.name.localeCompare(b.game.name))

  const limit = options.limit ?? 12
  return { results: scored.slice(0, limit), totalMatches: scored.length, filteredOut }
}
