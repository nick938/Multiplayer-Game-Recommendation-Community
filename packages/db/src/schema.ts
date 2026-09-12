/**
 * Database schema — core tables from plan §48 plus Better Auth's user/
 * session/account/verification tables (auth package maps onto them).
 *
 * Design notes:
 * - Crossplay is stored per platform PAIR (plan §16–17), never as a boolean.
 * - Important coop facts carry a source/confidence block (plan §29).
 * - CN-only fields (ip attribution, plan §67) are reserved up front so the
 *   schema doesn't need a migration when the CN version enables them.
 */
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

export const crossplayStatusEnum = pgEnum('crossplay_status', [
  'SUPPORTED',
  'PARTIAL',
  'NOT_SUPPORTED',
  'UNKNOWN',
])
export const userGameStatusEnum = pgEnum('user_game_status_type', [
  'played',
  'playing',
  'want_to_play',
  'dropped',
])
export const copyRequirementEnum = pgEnum('copy_requirement', [
  'each_own_copy',
  'friend_pass',
  'single_shared_screen',
])
export const sessionLengthEnum = pgEnum('session_length', ['short', 'medium', 'long'])
export const intensityEnum = pgEnum('intensity', ['casual', 'medium', 'hardcore'])
export const confidenceEnum = pgEnum('data_confidence', ['official', 'editor', 'community'])
export const correctionStatusEnum = pgEnum('correction_status', ['open', 'resolved', 'rejected'])
export const reportStatusEnum = pgEnum('report_status', ['pending', 'reviewing', 'resolved', 'rejected'])

// ---------------------------------------------------------------------------
// Taxonomy
// ---------------------------------------------------------------------------

export const platforms = pgTable('platforms', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  family: text('family').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
})

export const genres = pgTable('genres', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
})

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
})

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

export const games = pgTable('games', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  releaseYear: integer('release_year'),
  developer: text('developer'),
  publisher: text('publisher'),
  /** 0–100, editor-assigned popularity used as a ranking tie-break. */
  popularity: integer('popularity').notNull().default(0),
  /**
   * Editor-assigned overall rating (0–10). Shown while community ratings are
   * sparse (< 3 votes) and ALWAYS labelled as editorial in the UI — never
   * presented as community consensus (plan §24: accuracy beats volume).
   */
  editorRating: real('editor_rating'),
  /** Hue for the generated gradient cover — we don't hotlink copyrighted art. */
  coverHue: integer('cover_hue').notNull().default(220),
  published: boolean('published').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const gameLocalizations = pgTable(
  'game_localizations',
  {
    id: serial('id').primaryKey(),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    locale: text('locale').notNull(),
    name: text('name'),
    shortDescription: text('short_description'),
    description: text('description'),
    seoTitle: text('seo_title'),
  },
  (t) => [unique('game_localizations_game_locale').on(t.gameId, t.locale)],
)

export const gamePlatforms = pgTable(
  'game_platforms',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    platformId: integer('platform_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('game_platforms_game_platform').on(t.gameId, t.platformId)],
)

export const gameGenres = pgTable(
  'game_genres',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    genreId: integer('genre_id')
      .notNull()
      .references(() => genres.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('game_genres_game_genre').on(t.gameId, t.genreId)],
)

export const gameTags = pgTable(
  'game_tags',
  {
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    tagId: integer('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
  },
  (t) => [unique('game_tags_game_tag').on(t.gameId, t.tagId)],
)

// ---------------------------------------------------------------------------
// Co-op facts (the data moat, plan §28–29)
// ---------------------------------------------------------------------------

export const gameCoopProfiles = pgTable('game_coop_profiles', {
  gameId: integer('game_id')
    .primaryKey()
    .references(() => games.id, { onDelete: 'cascade' }),
  onlineCoop: boolean('online_coop').notNull().default(false),
  localCoop: boolean('local_coop').notNull().default(false),
  splitScreen: boolean('split_screen').notNull().default(false),
  lan: boolean('lan').notNull().default(false),
  minOnlinePlayers: integer('min_online_players').notNull().default(1),
  maxOnlinePlayers: integer('max_online_players').notNull().default(1),
  minLocalPlayers: integer('min_local_players').notNull().default(1),
  maxLocalPlayers: integer('max_local_players').notNull().default(1),
  coopCampaign: boolean('coop_campaign').notNull().default(true),
  dedicatedServer: boolean('dedicated_server'),
  friendPass: boolean('friend_pass').notNull().default(false),
  copiesRequired: copyRequirementEnum('copies_required').notNull().default('each_own_copy'),
  sessionLength: sessionLengthEnum('session_length').notNull().default('medium'),
  difficulty: real('difficulty'),
  grind: real('grind'),
  communication: real('communication'),
  intensity: intensityEnum('intensity').notNull().default('medium'),
  /**
   * Editor-assigned fit scores per group size ({2: 9.0, 3: 9.2, ...}), used
   * until community votes pass the threshold. Labelled editorial in the UI.
   */
  editorGroupRatings: jsonb('editor_group_ratings')
    .$type<Partial<Record<2 | 3 | 4 | 5, number>>>(),
  sourceUrl: text('source_url'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  verifiedBy: text('verified_by'),
  confidence: confidenceEnum('confidence').notNull().default('editor'),
})

export const crossplayRules = pgTable(
  'crossplay_rules',
  {
    id: serial('id').primaryKey(),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    platformAId: integer('platform_a_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    platformBId: integer('platform_b_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    status: crossplayStatusEnum('status').notNull(),
    note: text('note'),
    sourceUrl: text('source_url'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verifiedBy: text('verified_by'),
    confidence: confidenceEnum('confidence').notNull().default('editor'),
  },
  (t) => [unique('crossplay_rules_game_pair').on(t.gameId, t.platformAId, t.platformBId)],
)

export const crossSaveRules = pgTable(
  'cross_save_rules',
  {
    id: serial('id').primaryKey(),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    platformAId: integer('platform_a_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    platformBId: integer('platform_b_id')
      .notNull()
      .references(() => platforms.id, { onDelete: 'cascade' }),
    supported: boolean('supported').notNull(),
    note: text('note'),
    sourceUrl: text('source_url'),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
  },
  (t) => [unique('cross_save_rules_game_pair').on(t.gameId, t.platformAId, t.platformBId)],
)

export const gameSources = pgTable('game_sources', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  sourceType: text('source_type').notNull(), // e.g. official_faq, store_page, community_report
  sourceUrl: text('source_url').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Users — Better Auth core tables (managed by @mgc/auth, defined here so the
// whole schema lives in one place and one migration set)
// ---------------------------------------------------------------------------

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const userProfiles = pgTable('user_profiles', {
  userId: text('user_id')
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  displayName: text('display_name'),
  bio: text('bio'),
  // Reserved for CN deployment IP-attribution display (plan §67).
  ipCountry: text('ip_country'),
  ipProvince: text('ip_province'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// User library (plan §19)
// ---------------------------------------------------------------------------

export const userGameStatus = pgTable(
  'user_game_status',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    status: userGameStatusEnum('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('user_game_status_user_game').on(t.userId, t.gameId)],
)

export const userCollections = pgTable('user_collections', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const collectionItems = pgTable(
  'collection_items',
  {
    id: serial('id').primaryKey(),
    collectionId: integer('collection_id')
      .notNull()
      .references(() => userCollections.id, { onDelete: 'cascade' }),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('collection_items_collection_game').on(t.collectionId, t.gameId)],
)

// ---------------------------------------------------------------------------
// Community data (plan §18, §83–84)
// ---------------------------------------------------------------------------

export const ratings = pgTable(
  'ratings',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    /** 1–10 */
    overall: integer('overall').notNull(),
    difficulty: integer('difficulty'),
    grind: integer('grind'),
    communication: integer('communication'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('ratings_user_game').on(t.userId, t.gameId)],
)

export const groupSizeRatings = pgTable(
  'group_size_ratings',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    /** Player-count bucket: 2, 3, 4 or 5 (5 = "5+"), plan §3.2 */
    groupSize: integer('group_size').notNull(),
    /** 1–10 fit score for this group size */
    score: integer('score').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('group_size_ratings_user_game_size').on(t.userId, t.gameId, t.groupSize)],
)

export const reviews = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    gameId: integer('game_id')
      .notNull()
      .references(() => games.id, { onDelete: 'cascade' }),
    /** One-line review, max 280 chars (plan §84) */
    body: text('body').notNull(),
    groupSize: integer('group_size'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('reviews_user_game').on(t.userId, t.gameId)],
)

export const reviewVotes = pgTable(
  'review_votes',
  {
    id: serial('id').primaryKey(),
    reviewId: integer('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique('review_votes_review_user').on(t.reviewId, t.userId)],
)

// ---------------------------------------------------------------------------
// Trust & moderation (plan §29–30, §69)
// ---------------------------------------------------------------------------

export const gameCorrections = pgTable('game_corrections', {
  id: serial('id').primaryKey(),
  gameId: integer('game_id').references(() => games.id, { onDelete: 'cascade' }),
  field: text('field').notNull(), // e.g. crossplay, max_players
  message: text('message').notNull(),
  contact: text('contact'),
  status: correctionStatusEnum('status').notNull().default('open'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  targetType: text('target_type').notNull(), // review | user | game | post
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  reporterId: text('reporter_id').references(() => user.id, { onDelete: 'set null' }),
  status: reportStatusEnum('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// Audit log (plan §70) — retention policy configured at the infra level.
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: text('actor_id'),
  action: text('action').notNull(),
  targetType: text('target_type'),
  targetId: text('target_id'),
  detail: text('detail'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ---------------------------------------------------------------------------
// Better Auth schema export
// ---------------------------------------------------------------------------

export const authTables = { user, session, account, verification }
