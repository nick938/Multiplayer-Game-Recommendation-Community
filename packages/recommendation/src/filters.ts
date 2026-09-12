import type { GameCandidate, GroupPreferences } from '@mgc/domain'
import { checkCompatibility, type CompatibilityResult } from './compatibility'

export type FilterFailure =
  | 'capacity'
  | 'mode'
  | 'platforms'
  | 'connectivity'
  | 'avoid_tag'

export interface FilterOutcome {
  ok: boolean
  failure: FilterFailure | null
  compatibility: CompatibilityResult
}

/**
 * Hard filters (plan §32 layer 1): capacity, platform compatibility, mode.
 * Anything failing here is eliminated before scoring — never shown with a low
 * match %, because a mismatched game has no meaningful score.
 *
 * "不喜欢" tags are also treated as hard excludes in v1: a user who says
 * "no PvP" should never see PvP games ranked below the fold.
 */
export function hardFilter(game: GameCandidate, prefs: GroupPreferences): FilterOutcome {
  const compatibility = checkCompatibility({
    groupPlatforms: [...new Set(prefs.platforms)],
    gamePlatforms: game.platforms,
    crossplayRules: game.crossplayRules,
  })

  if (!compatibility.ok) {
    return {
      ok: false,
      failure: compatibility.failure === 'no_connectivity' ? 'connectivity' : 'platforms',
      compatibility,
    }
  }

  const onlineOk =
    game.coop.onlineCoop &&
    prefs.players >= game.coop.minOnlinePlayers &&
    prefs.players <= game.coop.maxOnlinePlayers
  const localOk =
    game.coop.localCoop &&
    prefs.players >= game.coop.minLocalPlayers &&
    prefs.players <= game.coop.maxLocalPlayers

  const capacityOk =
    prefs.mode === 'online' ? onlineOk : prefs.mode === 'local' ? localOk : onlineOk || localOk
  if (!capacityOk) {
    return { ok: false, failure: 'capacity', compatibility }
  }

  if (prefs.mode === 'local' && !game.coop.localCoop) {
    return { ok: false, failure: 'mode', compatibility }
  }

  if (prefs.avoidTags.some((tag) => game.tags.includes(tag))) {
    return { ok: false, failure: 'avoid_tag', compatibility }
  }

  return { ok: true, failure: null, compatibility }
}
