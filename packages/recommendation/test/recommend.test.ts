import { describe, expect, it } from 'vitest'
import { coopProfile, type GameCandidate, type GroupPreferences } from '@mgc/domain'
import { hardFilter } from '../src/filters.js'
import { recommend } from '../src/recommend.js'

function game(overrides: Partial<GameCandidate> = {}): GameCandidate {
  return {
    id: 1,
    slug: 'test',
    name: 'Test',
    releaseYear: 2024,
    popularity: 50,
    platforms: ['pc', 'ps5', 'xbox-series'],
    genres: ['survival'],
    tags: ['pve', 'building'],
    coop: coopProfile({ maxOnlinePlayers: 4 }),
    crossplayRules: [
      { platformA: 'pc', platformB: 'ps5', status: 'SUPPORTED', note: null },
      { platformA: 'pc', platformB: 'xbox-series', status: 'SUPPORTED', note: null },
      { platformA: 'ps5', platformB: 'xbox-series', status: 'SUPPORTED', note: null },
    ],
    crossSaveSupported: false,
    communityRating: 8.5,
    groupSizeRatings: { 2: 8.8, 3: 9.4, 4: 9.6 },
    ...overrides,
  }
}

const prefs: GroupPreferences = {
  players: 3,
  platforms: ['pc', 'ps5'],
  mode: 'online',
  genres: ['survival'],
  likedTags: ['pve'],
  avoidTags: ['pvp'],
  sessionLength: 'any',
  intensity: 'any',
}

describe('hardFilter', () => {
  it('passes a fully compatible game', () => {
    const outcome = hardFilter(game(), prefs)
    expect(outcome.ok).toBe(true)
  })

  it('rejects when group is bigger than max players', () => {
    const outcome = hardFilter(game({ coop: coopProfile({ maxOnlinePlayers: 2 }) }), { ...prefs, players: 3 })
    expect(outcome.ok).toBe(false)
    expect(outcome.failure).toBe('capacity')
  })

  it('rejects a 2-player-only game for solo play (min players enforced)', () => {
    const outcome = hardFilter(game({ coop: coopProfile({ minOnlinePlayers: 2, maxOnlinePlayers: 2 }) }), { ...prefs, players: 1 })
    expect(outcome.ok).toBe(false)
    expect(outcome.failure).toBe('capacity')
  })

  it('rejects local mode for an online-only game', () => {
    const outcome = hardFilter(game(), { ...prefs, mode: 'local' })
    expect(outcome.ok).toBe(false)
    expect(outcome.failure).toBe('capacity')
  })

  it('rejects games on avoid lists', () => {
    const outcome = hardFilter(game({ tags: ['pvp', 'competitive'] }), { ...prefs, avoidTags: ['pvp'] })
    expect(outcome.ok).toBe(false)
    expect(outcome.failure).toBe('avoid_tag')
  })

  it('rejects when crossplay cannot connect the group', () => {
    const outcome = hardFilter(
      game({ crossplayRules: [{ platformA: 'pc', platformB: 'ps5', status: 'NOT_SUPPORTED', note: null }] }),
      prefs,
    )
    expect(outcome.ok).toBe(false)
    expect(outcome.failure).toBe('connectivity')
  })
})

describe('recommend', () => {
  const catalog = [
    game({ id: 1, slug: 'perfect-fit', name: 'Perfect Fit', popularity: 80 }),
    game({ id: 2, slug: 'pvp-game', name: 'PvP Game', tags: ['pvp'] }),
    game({ id: 3, slug: 'duo-only', name: 'Duo Only', coop: coopProfile({ maxOnlinePlayers: 2 }) }),
    game({ id: 4, slug: 'other-genre', name: 'Other Genre', genres: ['racing'], tags: [], groupSizeRatings: {} }),
  ]

  it('ranks matching games first and excludes filtered ones', () => {
    const output = recommend(catalog, prefs)
    expect(output.results.map((r) => r.game.slug)).toEqual(['perfect-fit', 'other-genre'])
    expect(output.totalMatches).toBe(2)
    expect(output.filteredOut).toMatchObject({ avoid_tag: 1, capacity: 1 })
  })

  it('scores the genre/tag match higher than an off-genre game', () => {
    const output = recommend(catalog, prefs)
    const [top, second] = output.results
    expect(top!.matchPercent).toBeGreaterThan(second!.matchPercent)
    expect(top!.strengths.some((r) => r.key === 'genreMatch')).toBe(true)
  })

  it('produces honest caveats for grindy hardcore games', () => {
    const output = recommend(
      [game({ id: 5, slug: 'grindfest', coop: coopProfile({ maxOnlinePlayers: 4, grind: 9, intensity: 'hardcore' }), tags: ['pve', 'grindy'] })],
      { ...prefs, avoidTags: [], intensity: 'casual' },
    )
    const caveats = output.results[0]!.caveats.map((c) => c.key)
    expect(caveats).toContain('grindy')
    expect(caveats).toContain('hardcoreGame')
  })

  it('returns group-size fit from community data', () => {
    const output = recommend(catalog, prefs)
    const top = output.results[0]!
    expect(top.strengths.some((r) => r.key === 'groupSizeFit' && r.params?.players === 3)).toBe(true)
  })

  it('caps match percent at 100 and is never negative', () => {
    const output = recommend(catalog, prefs)
    for (const result of output.results) {
      expect(result.matchPercent).toBeLessThanOrEqual(100)
      expect(result.matchPercent).toBeGreaterThanOrEqual(0)
    }
  })

  it('returns empty results instead of throwing for an impossible group', () => {
    const output = recommend(catalog, { ...prefs, platforms: ['switch'] })
    expect(output.results).toEqual([])
    expect(output.filteredOut['platforms']).toBe(4)
  })
})
