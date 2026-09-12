'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

/** Share = copy the results URL (plan §91: share card visuals land in week 11). */
export function ShareButton({ params }: { params: string }) {
  const t = useTranslations('results')
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      className="rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
      onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}?${params}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? t('copied') : t('share')}
    </button>
  )
}
