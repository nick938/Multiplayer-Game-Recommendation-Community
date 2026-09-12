'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useTransition } from 'react'
import { getRuntimeConfig } from '@mgc/config'

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  'zh-hans': '简中',
  'zh-hant': '繁中',
  ja: '日本語',
  ko: '한국어',
}

export function LocaleSwitcher() {
  const locales = getRuntimeConfig().locales
  if (locales.length <= 1) return null

  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <select
      aria-label="Language"
      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300"
      value={locale}
      disabled={pending}
      onChange={(event) => {
        const next = event.target.value
        startTransition(() => router.replace(pathname, { locale: next }))
      }}
    >
      {locales.map((code) => (
        <option key={code} value={code} className="bg-zinc-900">
          {LOCALE_LABELS[code] ?? code}
        </option>
      ))}
    </select>
  )
}
