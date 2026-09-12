import {
  groupPreferencesSchema,
  GENRE_IDS,
  TAG_IDS,
  PLATFORM_IDS,
  type GroupPreferences,
  type GenreId,
  type PlatformId,
  type TagId,
} from '@mgc/domain'

/**
 * GroupPreferences ↔ URL search params. The results page URL is the share
 * link (plan §91): copying it reproduces the exact finder query.
 *
 * params: players=3 & p=pc & p=ps5 & mode=online & g=survival & t=pve
 *         & av=pvp & session=short & intensity=casual
 */
export function encodePreferences(prefs: GroupPreferences): URLSearchParams {
  const params = new URLSearchParams()
  params.set('players', String(prefs.players))
  for (const platform of prefs.platforms) params.append('p', platform)
  params.set('mode', prefs.mode)
  for (const genre of prefs.genres) params.append('g', genre)
  for (const tag of prefs.likedTags) params.append('t', tag)
  for (const tag of prefs.avoidTags) params.append('av', tag)
  if (prefs.sessionLength !== 'any') params.set('session', prefs.sessionLength)
  if (prefs.intensity !== 'any') params.set('intensity', prefs.intensity)
  return params
}

export type ParsedPreferences =
  | { ok: true; prefs: GroupPreferences }
  | { ok: false; error: string }

export function decodePreferences(searchParams: Record<string, string | string[] | undefined>): ParsedPreferences {
  const asArray = (key: string): string[] => {
    const value = searchParams[key]
    if (value == null) return []
    return Array.isArray(value) ? value : [value]
  }
  const first = (key: string): string | undefined => asArray(key)[0]

  const playersRaw = first('players')
  const parsed = groupPreferencesSchema.safeParse({
    players: playersRaw != null ? Number(playersRaw) : undefined,
    platforms: asArray('p').filter((v): v is PlatformId => (PLATFORM_IDS as readonly string[]).includes(v)),
    mode: first('mode') ?? 'either',
    genres: asArray('g').filter((v): v is GenreId => (GENRE_IDS as readonly string[]).includes(v)),
    likedTags: asArray('t').filter((v): v is TagId => (TAG_IDS as readonly string[]).includes(v)),
    avoidTags: asArray('av').filter((v): v is TagId => (TAG_IDS as readonly string[]).includes(v)),
    sessionLength: first('session') ?? 'any',
    intensity: first('intensity') ?? 'any',
  })

  if (!parsed.success) {
    return { ok: false, error: 'invalid_preferences' }
  }
  return { ok: true, prefs: parsed.data }
}
