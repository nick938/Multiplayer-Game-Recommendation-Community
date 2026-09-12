import type { CrossplayRule, PlatformId } from '@mgc/domain'

export interface CompatibilityInput {
  /** Platforms the group will play on (one per player, deduped by caller). */
  groupPlatforms: PlatformId[]
  gamePlatforms: PlatformId[]
  crossplayRules: CrossplayRule[]
}

export interface CompatibilityResult {
  ok: boolean
  /**
   * Why it failed: the game isn't on every platform the group uses, or the
   * platforms it does cover can't be joined in one session.
   */
  failure: 'not_on_platforms' | 'no_connectivity' | null
  /** Platforms the group would actually play on. */
  playableOn: PlatformId[]
  /** True when the group spans >1 platform and needs crossplay to play together. */
  needsCrossplay: boolean
  /** Crossplay is needed but only PARTIAL links make the group connected. */
  partialCrossplay: boolean
  /**
   * Coverage tie-break (0–1): share of the group's distinct platforms the game
   * natively supports. Always 1 on a pass under strict semantics; kept as an
   * informational field for future soft-match modes.
   */
  coverage: number
}

/**
 * Platform compatibility is NOT a boolean (plan §16–17, §33): a game may
 * connect PC↔Xbox but not PS5. We model the group's platforms as a graph
 * where SUPPORTED/PARTIAL crossplay rules are edges and require the group's
 * platforms to form one connected session.
 */
export function checkCompatibility(input: CompatibilityInput): CompatibilityResult {
  const { gamePlatforms, crossplayRules } = input
  // One entry per distinct platform; duplicate players on the same platform
  // say nothing about crossplay requirements.
  const groupPlatforms = [...new Set(input.groupPlatforms)]
  const gamePlatformSet = new Set(gamePlatforms)
  const supported = groupPlatforms.filter((p) => gamePlatformSet.has(p))
  const coverage = groupPlatforms.length > 0 ? supported.length / groupPlatforms.length : 0

  const base = {
    playableOn: supported,
    coverage,
  }

  // Strict semantics (plan §33): every platform in the group must be
  // supported, otherwise someone literally cannot play. Recommending
  // "one of you buys a different copy" is a v2 nicety, not a v1 answer.
  if (supported.length < groupPlatforms.length) {
    return { ok: false, failure: 'not_on_platforms', ...base, needsCrossplay: false, partialCrossplay: false }
  }

  // Whole group on a single platform — no crossplay needed at all.
  if (supported.length === 1) {
    return { ok: true, failure: null, ...base, needsCrossplay: false, partialCrossplay: false }
  }

  const supportedSet = new Set(supported)
  const strongEdges = new Map<PlatformId, Set<PlatformId>>()
  const weakEdges = new Map<PlatformId, Set<PlatformId>>()
  for (const rule of crossplayRules) {
    if (!supportedSet.has(rule.platformA) || !supportedSet.has(rule.platformB)) continue
    if (rule.status === 'SUPPORTED' || rule.status === 'PARTIAL') {
      const target = rule.status === 'SUPPORTED' ? strongEdges : weakEdges
      pushEdge(target, rule.platformA, rule.platformB)
      pushEdge(target, rule.platformB, rule.platformA)
    }
  }

  const reachableVia = (edges: Map<PlatformId, Set<PlatformId>>, start: PlatformId) => {
    const seen = new Set<PlatformId>([start])
    const queue = [start]
    while (queue.length > 0) {
      const current = queue.shift()!
      for (const next of edges.get(current) ?? []) {
        if (!seen.has(next)) {
          seen.add(next)
          queue.push(next)
        }
      }
    }
    return seen
  }

  const [anchor, ...rest] = supported
  const strongReach = reachableVia(strongEdges, anchor!)
  const anyReach = reachableVia(new Map([...strongEdges, ...weakEdges]), anchor!)

  const needsCrossplay = true
  if (rest.every((p) => anyReach.has(p))) {
    const partialCrossplay = !rest.every((p) => strongReach.has(p))
    return { ok: true, failure: null, ...base, needsCrossplay, partialCrossplay }
  }

  return { ok: false, failure: 'no_connectivity', ...base, needsCrossplay, partialCrossplay: false }
}

function pushEdge(map: Map<PlatformId, Set<PlatformId>>, a: PlatformId, b: PlatformId) {
  if (a === b) return
  const set = map.get(a) ?? new Set<PlatformId>()
  set.add(b)
  map.set(a, set)
}
