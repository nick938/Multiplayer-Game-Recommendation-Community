'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createReview } from '@/app/actions/games'

export function ReviewForm({ slug }: { slug: string }) {
  const t = useTranslations('game')
  const [body, setBody] = useState('')
  const [groupSize, setGroupSize] = useState<number | ''>('')
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (done) {
    return <p className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{t('reviewSubmit')} ✓</p>
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault()
        startTransition(async () => {
          const result = await createReview(slug, body, groupSize === '' ? null : Number(groupSize))
          if (result.ok) {
            setDone(true)
          }
        })
      }}
    >
      <textarea
        value={body}
        maxLength={280}
        rows={2}
        required
        placeholder={t('reviewPlaceholder')}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex items-center gap-2">
        <select
          value={groupSize}
          onChange={(event) => setGroupSize(event.target.value === '' ? '' : Number(event.target.value))}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm"
        >
          <option value="" className="bg-zinc-900">
            {t('reviewGroupSize')}
          </option>
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n} className="bg-zinc-900">
              {t('playersCount', { count: n })}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={pending || body.trim().length < 2}
          className="ml-auto rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-emerald-950 disabled:opacity-40"
        >
          {t('reviewSubmit')}
        </button>
      </div>
    </form>
  )
}
