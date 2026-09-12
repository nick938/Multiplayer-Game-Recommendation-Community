'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { setGameStatus, type LibraryStatus } from '@/app/actions/games'

const OPTIONS: Array<{ value: LibraryStatus; key: string; icon: string }> = [
  { value: 'want_to_play', key: 'wantToPlay', icon: '＋' },
  { value: 'playing', key: 'playing', icon: '▶' },
  { value: 'played', key: 'played', icon: '✓' },
  { value: 'dropped', key: 'dropped', icon: '✕' },
]

export function SaveButtons({
  slug,
  current,
  disabled,
}: {
  slug: string
  current: LibraryStatus | null
  disabled?: boolean
}) {
  const t = useTranslations('status')
  const [status, setStatus] = useState<LibraryStatus | null>(current)
  const [pending, startTransition] = useTransition()

  const choose = (next: LibraryStatus) => {
    const updated = status === next ? null : next
    setStatus(updated)
    startTransition(async () => {
      await setGameStatus(slug, updated)
    })
  }

  return (
    <div className="flex flex-wrap gap-2" aria-disabled={disabled || pending}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={disabled || pending}
          onClick={() => choose(option.value)}
          className={`rounded-xl border px-3 py-2 text-sm transition disabled:opacity-50 ${
            status === option.value
              ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
              : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25'
          }`}
        >
          <span className="mr-1.5">{option.icon}</span>
          {t(option.key as Parameters<typeof t>[0])}
        </button>
      ))}
    </div>
  )
}
