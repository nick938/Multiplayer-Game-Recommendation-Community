import { z } from 'zod'
import { PLATFORM_IDS, type PlatformId } from './platforms'
import { GENRE_IDS, TAG_IDS, type GenreId, type TagId } from './tags'

export * from './platforms'
export * from './tags'

/** Session length buckets offered by the finder (plan §13). */
export const SESSION_LENGTHS = ['short', 'medium', 'long'] as const
export type SessionLength = (typeof SESSION_LENGTHS)[number]

/** How demanding a game / group is (plan §13 "投入程度"). */
export const INTENSITIES = ['casual', 'medium', 'hardcore'] as const
export type Intensity = (typeof INTENSITIES)[number]

export const COPY_REQUIREMENTS = [
  'each_own_copy',
  'friend_pass',
  'single_shared_screen',
] as const
export type CopyRequirement = (typeof COPY_REQUIREMENTS)[number]

/**
 * Per-game co-op facts (plan §49 "Game Coop Profile").
 * This is the moat data — every field must be verifiable, hence the
 * source/confidence block from plan §29.
 */
export interface CoopProfile {
  onlineCoop: boolean
  localCoop: boolean
  splitScreen: boolean
  lan: boolean
  minOnlinePlayers: number
  maxOnlinePlayers: number
  minLocalPlayers: number
  maxLocalPlayers: number
  coopCampaign: boolean
  dedicatedServer: boolean | null
  friendPass: boolean
  copiesRequired: CopyRequirement
  /** Typical single session, used for session-length matching. */
  sessionLength: SessionLength
  /** 1 (breezy) – 10 (punishing). */
  difficulty: number | null
  /** 1 (none) – 10 (second job). */
  grind: number | null
  /** 1 – 10, how much coordination the group needs. */
  communication: number | null
  /** Overall intensity label used for play-style matching. */
  intensity: Intensity
  /** Data trust block (plan §29). */
  sourceUrl: string | null
  verifiedAt: string | null
  confidence: 'official' | 'editor' | 'community'
}

export type CrossplayStatus = 'SUPPORTED' | 'PARTIAL' | 'NOT_SUPPORTED' | 'UNKNOWN'

export interface CrossplayRule {
  platformA: PlatformId
  platformB: PlatformId
  status: CrossplayStatus
  note: string | null
}

/** What the recommendation engine scores against (plan §103.B). */
export const groupPreferencesSchema = z.object({
  players: z.number().int().min(1).max(16),
  platforms: z.array(z.enum(PLATFORM_IDS)).min(1),
  mode: z.enum(['online', 'local', 'either']),
  genres: z.array(z.enum(GENRE_IDS)).max(8).default([]),
  likedTags: z.array(z.enum(TAG_IDS)).max(8).default([]),
  avoidTags: z.array(z.enum(TAG_IDS)).max(8).default([]),
  sessionLength: z.enum(['any', ...SESSION_LENGTHS]).default('any'),
  intensity: z.enum(['any', ...INTENSITIES]).default('any'),
})
export type GroupPreferences = z.infer<typeof groupPreferencesSchema>

export type GroupPreferencesInput = z.input<typeof groupPreferencesSchema>

/** A game as seen by the recommendation engine — DB-agnostic. */
export interface GameCandidate {
  id: number
  slug: string
  name: string
  releaseYear: number | null
  popularity: number // 0–100
  platforms: PlatformId[]
  genres: GenreId[]
  tags: TagId[]
  coop: CoopProfile
  crossplayRules: CrossplayRule[]
  crossSaveSupported: boolean | null
  /** Average community rating 0–10, null when unrated. */
  communityRating: number | null
  /** Community group-size fit 0–10 per player-count bucket, null when unrated. */
  groupSizeRatings: Partial<Record<2 | 3 | 4 | 5, number>>
}

export interface ReasonDescriptor {
  kind: 'strength' | 'caveat'
  /** i18n key under `reason.` namespace; UI translates (engine stays locale-free). */
  key: string
  params?: Record<string, string | number>
}

export interface ScoreBreakdown {
  genreSimilarity: number
  groupSizeFit: number
  communityRating: number
  playStyle: number
  sessionLength: number
  difficulty: number
  popularity: number
  freshness: number
}

export interface RecommendationResult {
  game: GameCandidate
  /** 0–100, calibrated by the scoring engine — never fabricated. */
  matchPercent: number
  breakdown: ScoreBreakdown
  strengths: ReasonDescriptor[]
  caveats: ReasonDescriptor[]
  /** Platforms from the group that can actually play this together. */
  playableOn: PlatformId[]
  /** True when crossplay connectivity was needed and only PARTIAL. */
  needsCrossplay: boolean
}

/** Helper for seed data / tests to build a coop profile with defaults. */
export function coopProfile(overrides: Partial<CoopProfile> & { maxOnlinePlayers?: number }): CoopProfile {
  return {
    onlineCoop: true,
    localCoop: false,
    splitScreen: false,
    lan: false,
    minOnlinePlayers: 1,
    maxOnlinePlayers: overrides.maxOnlinePlayers ?? 4,
    minLocalPlayers: 1,
    maxLocalPlayers: 1,
    coopCampaign: true,
    dedicatedServer: null,
    friendPass: false,
    copiesRequired: 'each_own_copy',
    sessionLength: 'medium',
    difficulty: null,
    grind: null,
    communication: null,
    intensity: 'medium',
    sourceUrl: null,
    verifiedAt: null,
    confidence: 'editor',
    ...overrides,
  }
}
