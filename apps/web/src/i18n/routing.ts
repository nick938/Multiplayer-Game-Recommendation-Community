import { defineRouting } from 'next-intl/routing'
import { getRuntimeConfig } from '@mgc/config'

const runtimeConfig = getRuntimeConfig()

/**
 * Locale routing derived from the region profile (plan §8):
 * global → /en/, /ja/, … with prefix-free default;
 * cn → single zh-hans locale, no prefix at all.
 */
export const routing = defineRouting({
  locales: runtimeConfig.locales,
  defaultLocale: runtimeConfig.defaultLocale,
  localePrefix: runtimeConfig.localePrefix,
})
