import { describe, expect, it } from 'vitest'
import { coopProfile, type CrossplayRule, type GameCandidate } from '@mgc/domain'
import { checkCompatibility } from '../src/compatibility.js'

function rules(...pairs: [GameCandidate['crossplayRules'][number]['platformA'], GameCandidate['crossplayRules'][number]['platformB'], CrossplayRule['status']][]): CrossplayRule[] {
  return pairs.map(([platformA, platformB, status]) => ({ platformA, platformB, status, note: null }))
}

const baseGame = {
  id: 1,
  slug: 'test',
  name: 'Test',
  releaseYear: 2024,
  popularity: 50,
  genres: [],
  tags: [],
  coop: coopProfile({ maxOnlinePlayers: 8 }),
  crossplayRules: [],
  crossSaveSupported: false,
  communityRating: null,
  groupSizeRatings: {},
}

function game(overrides: Partial<GameCandidate> = {}): GameCandidate {
  return { ...baseGame, ...overrides }
}

describe('checkCompatibility', () => {
  it('passes when the whole group is on one platform the game supports', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'pc'],
      gamePlatforms: ['pc', 'ps5'],
      crossplayRules: [],
    })
    expect(result.ok).toBe(true)
    expect(result.needsCrossplay).toBe(false)
    expect(result.coverage).toBe(1)
  })

  it('passes with full crossplay between two platforms', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'ps5'],
      gamePlatforms: ['pc', 'ps5', 'xbox-series'],
      crossplayRules: rules(['pc', 'ps5', 'SUPPORTED'], ['pc', 'xbox-series', 'SUPPORTED'], ['ps5', 'xbox-series', 'SUPPORTED']),
    })
    expect(result.ok).toBe(true)
    expect(result.needsCrossplay).toBe(true)
    expect(result.partialCrossplay).toBe(false)
  })

  it('fails when the game is not on one of the group platforms at all', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'switch'],
      gamePlatforms: ['pc', 'ps5'],
      crossplayRules: rules(['pc', 'ps5', 'SUPPORTED']),
    })
    expect(result.ok).toBe(false)
    expect(result.failure).toBe('not_on_platforms')
  })

  it('fails when platforms are not connected (no crossplay)', () => {
    // It Takes Two situation: on PC and PS5 but no crossplay between them.
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'ps5'],
      gamePlatforms: ['pc', 'ps5'],
      crossplayRules: rules(['pc', 'ps5', 'NOT_SUPPORTED']),
    })
    expect(result.ok).toBe(false)
    expect(result.failure).toBe('no_connectivity')
  })

  it('fails when crossplay status is UNKNOWN', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'switch'],
      gamePlatforms: ['pc', 'switch'],
      crossplayRules: rules(['pc', 'switch', 'UNKNOWN']),
    })
    expect(result.ok).toBe(false)
    expect(result.failure).toBe('no_connectivity')
  })

  it('passes but flags partial when only PARTIAL links connect the group', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'ps5'],
      gamePlatforms: ['pc', 'ps5'],
      crossplayRules: rules(['pc', 'ps5', 'PARTIAL']),
    })
    expect(result.ok).toBe(true)
    expect(result.partialCrossplay).toBe(true)
  })

  it('connects a 3-platform group transitively', () => {
    // PC↔Xbox and Xbox↔PS5 supported but PC↔PS5 not: group still connects via Xbox.
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'xbox-series', 'ps5'],
      gamePlatforms: ['pc', 'xbox-series', 'ps5'],
      crossplayRules: rules(['pc', 'xbox-series', 'SUPPORTED'], ['ps5', 'xbox-series', 'SUPPORTED'], ['pc', 'ps5', 'NOT_SUPPORTED']),
    })
    expect(result.ok).toBe(true)
    expect(result.partialCrossplay).toBe(false)
  })

  it('flags partial when connectivity only exists through a PARTIAL link', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'xbox-series', 'ps5'],
      gamePlatforms: ['pc', 'xbox-series', 'ps5'],
      crossplayRules: rules(['pc', 'xbox-series', 'SUPPORTED'], ['ps5', 'xbox-series', 'PARTIAL'], ['pc', 'ps5', 'NOT_SUPPORTED']),
    })
    expect(result.ok).toBe(true)
    expect(result.partialCrossplay).toBe(true)
  })

  it('rejects when one group platform is not supported at all (strict semantics)', () => {
    // PC-only game: the Switch player cannot play, so the group can't play
    // together — even though the PC players could. That nuance is a v2 nicety.
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'switch'],
      gamePlatforms: ['pc'],
      crossplayRules: [],
    })
    expect(result.ok).toBe(false)
    expect(result.failure).toBe('not_on_platforms')
  })

  it('ignores duplicate players on the same platform', () => {
    const result = checkCompatibility({
      groupPlatforms: ['pc', 'pc', 'pc'],
      gamePlatforms: ['pc', 'ps5'],
      crossplayRules: rules(['pc', 'ps5', 'NOT_SUPPORTED']),
    })
    expect(result.ok).toBe(true)
    expect(result.needsCrossplay).toBe(false)
  })
})
