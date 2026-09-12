/**
 * Region / runtime configuration — the single source of truth for
 * "one codebase, two deployments" (plan §4–5, §39–42).
 *
 * Nothing else in the repo is allowed to branch on "is China" directly;
 * everything reads from `runtimeConfig` exported here.
 */

export type DeploymentTarget = 'global' | 'cn'

export type Locale = 'en' | 'zh-hans' | 'zh-hant' | 'ja' | 'ko'

export interface FeatureFlags {
  /** Any user-generated content: ratings, one-line reviews, saves are gated on this. */
  ugc: boolean
  comments: boolean
  recommendationPosts: boolean
  socialLogin: boolean
  phoneLogin: boolean
  ads: boolean
  aiTranslation: boolean
}

export interface ProviderConfig {
  storage: 'r2' | 'oss' | 'local'
  captcha: 'turnstile' | 'tencent' | 'none'
  email: 'resend' | 'none'
  sms: 'aliyun' | 'console-stub' | 'none'
  analytics: 'umami' | 'none'
}

export interface RegionProfile {
  locales: Locale[]
  defaultLocale: Locale
  /** 'as-needed' → no prefix for the default locale (CN hides the prefix, plan §8). */
  localePrefix: 'always' | 'as-needed' | 'never'
  features: FeatureFlags
  providers: ProviderConfig
}

/**
 * Feature matrix from plan §6 / §41.
 * CN keeps UGC closed until 实名认证 + 审核 pipeline is ready (plan §65, §68, §73).
 */
const GLOBAL_FEATURES: FeatureFlags = {
  ugc: true,
  comments: true,
  recommendationPosts: false, // phase 2 (plan §20, §86)
  socialLogin: true,
  phoneLogin: false,
  ads: false, // no ads before traction (plan §95)
  aiTranslation: false,
}

const CN_FEATURES: FeatureFlags = {
  ugc: false, // opens after compliance work
  comments: false,
  recommendationPosts: false,
  socialLogin: false, // no Google/Discord in CN
  phoneLogin: true, // 手机号登录是国内主方案 (plan §65)
  ads: false,
  aiTranslation: false,
}

const PROFILES: Record<DeploymentTarget, RegionProfile> = {
  global: {
    locales: ['en', 'zh-hans', 'zh-hant', 'ja', 'ko'],
    defaultLocale: 'en',
    localePrefix: 'as-needed',
    features: GLOBAL_FEATURES,
    providers: {
      storage: 'local',
      captcha: 'turnstile',
      email: 'resend',
      sms: 'none',
      analytics: 'umami',
    },
  },
  cn: {
    locales: ['zh-hans'],
    defaultLocale: 'zh-hans',
    localePrefix: 'never',
    features: CN_FEATURES,
    providers: {
      storage: 'oss',
      captcha: 'tencent',
      email: 'none',
      sms: 'aliyun',
      analytics: 'umami',
    },
  },
}

export function getDeploymentTarget(): DeploymentTarget {
  // Trim: env values set via `echo x | vercel env add` carry a trailing
  // newline that would otherwise fail the strict match below.
  const raw = process.env.DEPLOYMENT_TARGET?.trim()
  if (raw === 'cn' || raw === 'global') return raw
  if (raw !== undefined) {
    throw new Error(`Invalid DEPLOYMENT_TARGET: ${raw} (expected "global" or "cn")`)
  }
  return 'global'
}

export interface RuntimeConfig {
  region: DeploymentTarget
  locales: Locale[]
  defaultLocale: Locale
  localePrefix: RegionProfile['localePrefix']
  features: FeatureFlags
  providers: ProviderConfig
}

let cached: RuntimeConfig | undefined

/** Build-time constant per deployment; frozen to prevent accidental mutation. */
export function getRuntimeConfig(): RuntimeConfig {
  if (cached) return cached
  const region = getDeploymentTarget()
  const profile = PROFILES[region]
  cached = Object.freeze({
    region,
    locales: [...profile.locales],
    defaultLocale: profile.defaultLocale,
    localePrefix: profile.localePrefix,
    features: Object.freeze({ ...profile.features }),
    providers: Object.freeze({ ...profile.providers }),
  })
  return cached
}

export function isLocale(value: string): value is Locale {
  return getRuntimeConfig().locales.includes(value as Locale)
}
