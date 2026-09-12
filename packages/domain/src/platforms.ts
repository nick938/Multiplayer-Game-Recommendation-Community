/**
 * Canonical platform identifiers shared by the DB seed, the recommendation
 * engine and the UI filters.
 */
export const PLATFORM_IDS = [
  'pc',
  'ps5',
  'ps4',
  'xbox-series',
  'xbox-one',
  'switch',
] as const

export type PlatformId = (typeof PLATFORM_IDS)[number]

export const PLATFORM_FAMILIES: Record<PlatformId, string> = {
  pc: 'pc',
  ps5: 'playstation',
  ps4: 'playstation',
  'xbox-series': 'xbox',
  'xbox-one': 'xbox',
  switch: 'nintendo',
}

export const PLATFORM_LABEL_KEYS: Record<PlatformId, string> = {
  pc: 'platform.pc',
  ps5: 'platform.ps5',
  ps4: 'platform.ps4',
  'xbox-series': 'platform.xboxSeries',
  'xbox-one': 'platform.xboxOne',
  switch: 'platform.switch',
}
