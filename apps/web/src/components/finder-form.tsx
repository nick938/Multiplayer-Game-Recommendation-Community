'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  GENRE_IDS,
  AVOIDABLE_TAG_IDS,
  PLATFORM_IDS,
  TAG_IDS,
  type GroupPreferences,
} from '@mgc/domain'
import { useRouter } from '@/i18n/navigation'
import { encodePreferences } from '@/lib/finder-params'

const PLAYER_OPTIONS = [1, 2, 3, 4, 5, 6, 8]
const GENRE_PICKS = ['survival', 'shooter', 'rpg', 'party', 'horror', 'puzzle', 'strategy', 'sandbox', 'roguelike', 'simulation'] as const
const TAG_PICKS = ['pve', 'relaxing', 'building', 'exploration', 'couple-friendly', 'casual', 'story-rich', 'short-sessions', 'funny'] as const

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
          : 'border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25'
      }`}
    >
      {children}
    </button>
  )
}

export function FinderForm({ initial }: { initial?: Partial<GroupPreferences> }) {
  const t = useTranslations('finder')
  const tRoot = useTranslations()
  const router = useRouter()

  const [players, setPlayers] = useState(initial?.players ?? 3)
  const [platforms, setPlatforms] = useState<PlatformSelection[]>(initial?.platforms ?? ['pc'])
  const [mode, setMode] = useState(initial?.mode ?? 'either')
  const [genres, setGenres] = useState<string[]>(initial?.genres ?? [])
  const [likedTags, setLikedTags] = useState<string[]>(initial?.likedTags ?? [])
  const [avoidTags, setAvoidTags] = useState<string[]>(initial?.avoidTags ?? ['pvp'])
  const [sessionLength, setSessionLength] = useState(initial?.sessionLength ?? 'any')
  const [intensity, setIntensity] = useState(initial?.intensity ?? 'any')
  const [error, setError] = useState(false)

  const toggle = (list: string[], set: (v: string[]) => void, value: string) => {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    if (platforms.length === 0) {
      setError(true)
      return
    }
    const params = encodePreferences({
      players,
      platforms,
      mode: mode as GroupPreferences['mode'],
      genres: genres as GroupPreferences['genres'],
      likedTags: likedTags as GroupPreferences['likedTags'],
      avoidTags: avoidTags as GroupPreferences['avoidTags'],
      sessionLength: sessionLength as GroupPreferences['sessionLength'],
      intensity: intensity as GroupPreferences['intensity'],
    })
    router.push(`/recommend/results?${params.toString()}`)
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section>
        <h2 className="font-medium">{t('players')}</h2>
        <p className="text-sm text-zinc-500">{t('playersHint')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PLAYER_OPTIONS.map((n) => (
            <Chip key={n} active={players === n} onClick={() => setPlayers(n)}>
              {n}
              {n === PLAYER_OPTIONS[PLAYER_OPTIONS.length - 1] ? '+' : ''}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium">{t('platforms')}</h2>
        <p className="text-sm text-zinc-500">{t('platformsHint')}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PLATFORM_IDS.map((id) => (
            <Chip
              key={id}
              active={platforms.includes(id)}
              onClick={() => toggle(platforms, (v) => setPlatforms(v as PlatformSelection[]), id)}
            >
              {tRoot(`platform.${id}`)}
            </Chip>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{t('invalid')}</p>}
      </section>

      <section>
        <h2 className="font-medium">{t('mode')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['online', 'local', 'either'] as const).map((m) => (
            <Chip key={m} active={mode === m} onClick={() => setMode(m)}>
              {t(`mode${m[0]!.toUpperCase()}${m.slice(1)}`)}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium">{t('genres')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {GENRE_PICKS.map((g) => (
            <Chip key={g} active={genres.includes(g)} onClick={() => toggle(genres, setGenres, g)}>
              {tRoot(`genre.${g}`)}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium">{t('likedTags')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {TAG_PICKS.map((tag) => (
            <Chip key={tag} active={likedTags.includes(tag)} onClick={() => toggle(likedTags, setLikedTags, tag)}>
              {tRoot(`tag.${tag}`)}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium">{t('avoidTags')}</h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVOIDABLE_TAG_IDS.map((tag) => (
            <Chip key={tag} active={avoidTags.includes(tag)} onClick={() => toggle(avoidTags, setAvoidTags, tag)}>
              {tRoot(`tag.${tag}`)}
            </Chip>
          ))}
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="font-medium">{t('sessionLength')}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['any', 'short', 'medium', 'long'] as const).map((s) => (
              <Chip key={s} active={sessionLength === s} onClick={() => setSessionLength(s)}>
                {s === 'any' ? tRoot('games.all') : tRoot(`session.${s}`)}
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <h2 className="font-medium">{t('intensity')}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['any', 'casual', 'medium', 'hardcore'] as const).map((i) => (
              <Chip key={i} active={intensity === i} onClick={() => setIntensity(i)}>
                {i === 'any' ? tRoot('games.all') : tRoot(`intensityWord.${i}`)}
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400 sm:w-auto sm:px-10"
      >
        {t('submit')}
      </button>
    </form>
  )
}

type PlatformSelection = (typeof PLATFORM_IDS)[number]
