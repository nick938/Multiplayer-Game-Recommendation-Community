export const GENRE_IDS = [
  'survival',
  'crafting',
  'shooter',
  'rpg',
  'action',
  'adventure',
  'strategy',
  'simulation',
  'party',
  'horror',
  'puzzle',
  'platformer',
  'roguelike',
  'sandbox',
  'mmo',
] as const

export type GenreId = (typeof GENRE_IDS)[number]

/**
 * Structured "fit" tags (plan §3.3). Unlike genres these describe how a game
 * plays with a group rather than what it is.
 */
export const TAG_IDS = [
  'pve',
  'pvp',
  'competitive',
  'casual',
  'hardcore',
  'relaxing',
  'grindy',
  'building',
  'exploration',
  'looting',
  'permadeath',
  'horror',
  'couple-friendly',
  'family-friendly',
  'story-rich',
  'short-sessions',
  'long-term',
  'difficult',
  'funny',
] as const

export type TagId = (typeof TAG_IDS)[number]

/** Tags that are common dealbreakers in the finder's "不喜欢" section (plan §13). */
export const AVOIDABLE_TAG_IDS = [
  'pvp',
  'competitive',
  'grindy',
  'permadeath',
  'horror',
  'hardcore',
  'difficult',
] as const
