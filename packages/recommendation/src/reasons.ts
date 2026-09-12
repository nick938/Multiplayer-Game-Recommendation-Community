import type { GameCandidate, GroupPreferences, ReasonDescriptor } from '@mgc/domain'
import type { CompatibilityResult } from './compatibility'
import type { ScoreBreakdown } from '@mgc/domain'

/**
 * Reasons are produced as locale-free descriptors ({key, params}); the UI
 * translates them via next-intl so the engine never hardcodes a language.
 * Strengths render with ✓, caveats with △ (plan §14).
 */
export function buildReasons(
  game: GameCandidate,
  prefs: GroupPreferences,
  compatibility: CompatibilityResult,
  breakdown: ScoreBreakdown,
): { strengths: ReasonDescriptor[]; caveats: ReasonDescriptor[] } {
  const strengths: ReasonDescriptor[] = []
  const caveats: ReasonDescriptor[] = []

  if (compatibility.needsCrossplay && !compatibility.partialCrossplay) {
    strengths.push({
      kind: 'strength',
      key: 'crossplayFull',
      params: { platforms: compatibility.playableOn.join('|') },
    })
  }
  if (compatibility.needsCrossplay && compatibility.partialCrossplay) {
    caveats.push({
      kind: 'caveat',
      key: 'partialCrossplay',
      params: { platforms: compatibility.playableOn.join('|') },
    })
  }
  const bucket = (prefs.players >= 5 ? 5 : prefs.players) as 2 | 3 | 4 | 5
  const groupRating = game.groupSizeRatings[bucket]
  if (groupRating != null && groupRating >= 8) {
    strengths.push({ kind: 'strength', key: 'groupSizeFit', params: { players: bucket, score: groupRating } })
  }
  if (game.coop.maxOnlinePlayers === prefs.players && prefs.players >= 2) {
    strengths.push({ kind: 'strength', key: 'exactPlayerCount', params: { players: prefs.players } })
  } else if (game.coop.maxOnlinePlayers > prefs.players) {
    strengths.push({
      kind: 'strength',
      key: 'supportsUpTo',
      params: { players: game.coop.maxOnlinePlayers },
    })
  }

  const matchedGenres = prefs.genres.filter((g) => game.genres.includes(g))
  for (const genre of matchedGenres.slice(0, 2)) {
    strengths.push({ kind: 'strength', key: 'genreMatch', params: { genre } })
  }
  const matchedTags = prefs.likedTags.filter((t) => game.tags.includes(t))
  for (const tag of matchedTags.slice(0, 2)) {
    strengths.push({ kind: 'strength', key: 'tagMatch', params: { tag } })
  }

  if (prefs.sessionLength !== 'any' && game.coop.sessionLength === prefs.sessionLength) {
    strengths.push({ kind: 'strength', key: 'sessionMatch', params: { session: prefs.sessionLength } })
  }
  if (prefs.intensity !== 'any' && game.coop.intensity === prefs.intensity) {
    strengths.push({ kind: 'strength', key: 'intensityMatch', params: { intensity: game.coop.intensity } })
  }

  if (game.coop.friendPass) {
    strengths.push({ kind: 'strength', key: 'friendPass' })
  }
  if (game.coop.dedicatedServer) {
    strengths.push({ kind: 'strength', key: 'dedicatedServer' })
  }
  if (game.crossSaveSupported) {
    strengths.push({ kind: 'strength', key: 'crossSave' })
  }
  if (game.communityRating != null && game.communityRating >= 8.5) {
    strengths.push({ kind: 'strength', key: 'communityFavorite', params: { score: Math.round(game.communityRating * 10) / 10 } })
  }

  if (game.coop.grind != null && game.coop.grind >= 7 && !prefs.likedTags.includes('grindy')) {
    caveats.push({ kind: 'caveat', key: 'grindy', params: { grind: game.coop.grind } })
  }
  if (game.coop.communication != null && game.coop.communication >= 7) {
    caveats.push({ kind: 'caveat', key: 'communicationHeavy', params: { communication: game.coop.communication } })
  }
  if (game.coop.intensity === 'hardcore' && prefs.intensity !== 'hardcore' && prefs.intensity !== 'any') {
    caveats.push({ kind: 'caveat', key: 'hardcoreGame' })
  }
  if (game.coop.dedicatedServer === false && game.coop.maxOnlinePlayers >= 4) {
    caveats.push({ kind: 'caveat', key: 'noDedicatedServer' })
  }
  if (game.releaseYear != null && 2026 - game.releaseYear >= 10) {
    caveats.push({ kind: 'caveat', key: 'olderGame', params: { year: game.releaseYear } })
  }

  // If nothing matched the stated genre preferences, say so honestly.
  if ((prefs.genres.length > 0 || prefs.likedTags.length > 0) && matchedGenres.length === 0 && matchedTags.length === 0) {
    caveats.push({ kind: 'caveat', key: 'offGenre' })
  }

  return { strengths, caveats }
}
