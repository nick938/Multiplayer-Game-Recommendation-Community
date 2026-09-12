import { getRuntimeConfig } from '@mgc/config'

/**
 * Reserved monetization placement (plan §96). Renders nothing until ads are
 * switched on per region — pages never need re_structuring when that happens.
 */
export function MonetizationSlot({ placement }: { placement: 'detail' | 'results' | 'home' }) {
  const { features } = getRuntimeConfig()
  if (!features.ads) return null
  void placement
  return null
}
