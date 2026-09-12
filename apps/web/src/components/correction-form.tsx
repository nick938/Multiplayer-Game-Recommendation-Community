'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { submitCorrection } from '@/app/actions/games'

const FIELDS = ['crossplay', 'max_players', 'friend_pass', 'dedicated_server', 'other']

export function CorrectionForm({ slug }: { slug: string | null }) {
  const t = useTranslations('game')
  const [open, setOpen] = useState(false)
  const [field, setField] = useState(FIELDS[0]!)
  const [message, setMessage] = useState('')
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        type="button"
        className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-300 hover:underline"
        onClick={() => setOpen(true)}
      >
        {t('reportCorrection')}
      </button>
    )
  }

  if (done) {
    return <p className="text-sm text-emerald-400">{t('correctionThanks')}</p>
  }

  return (
    <form
      className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] p-3"
      onSubmit={(event) => {
        event.preventDefault()
        startTransition(async () => {
          const result = await submitCorrection(slug, field, message)
          if (result.ok) setDone(true)
        })
      }}
    >
      <div className="flex gap-2">
        <select
          value={field}
          onChange={(event) => setField(event.target.value)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm"
          aria-label={t('correctionField')}
        >
          {FIELDS.map((f) => (
            <option key={f} value={f} className="bg-zinc-900">
              {f}
            </option>
          ))}
        </select>
        <input
          value={message}
          required
          minLength={4}
          maxLength={1000}
          placeholder={t('correctionMessage')}
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
          onChange={(event) => setMessage(event.target.value)}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-white/15 px-4 py-1.5 text-sm hover:bg-white/5 disabled:opacity-40"
        >
          {t('correctionSubmit')}
        </button>
      </div>
    </form>
  )
}
