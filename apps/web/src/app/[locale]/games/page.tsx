import { getTranslations } from 'next-intl/server'
import { getDb, loadCatalog } from '@mgc/db'
import { PLATFORM_IDS, GENRE_IDS, type PlatformId, type GenreId } from '@mgc/domain'
import { GameCard } from '@/components/game-card'
export const dynamic = 'force-dynamic'

interface SearchParams {
  q?: string
  p?: string
  g?: string
  players?: string
  crossplay?: string
}

export default async function GamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations('games')

  const { db } = await getDb()
  const catalog = await loadCatalog(db, locale)

  const q = (sp.q ?? '').trim().toLowerCase()
  const platform = sp.p as PlatformId | undefined
  const genre = sp.g as GenreId | undefined
  const players = sp.players ? Number(sp.players) : null
  const crossplayOnly = sp.crossplay === '1'

  const filtered = catalog
    .filter((entry) => {
      if (q && !(`${entry.name} ${entry.displayName}`.toLowerCase().includes(q))) return false
      if (platform && !entry.platforms.includes(platform)) return false
      if (genre && !entry.genres.includes(genre)) return false
      if (players != null && (entry.coop?.maxOnlinePlayers ?? 0) < players) return false
      if (crossplayOnly && !entry.crossplay.some((rule) => rule.status === 'SUPPORTED')) return false
      return true
    })
    .sort((a, b) => b.popularity - a.popularity)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <form className="flex flex-wrap items-center gap-2 text-sm">
        <input
          name="q"
          defaultValue={sp.q ?? ''}
          placeholder={t('searchPlaceholder')}
          className="w-48 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50"
        />
        <select name="p" defaultValue={platform ?? ''} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <option value="">{t('filterPlatform')}: {t('all')}</option>
          {PLATFORM_IDS.map((id) => (
            <option key={id} value={id}>
              {t(`platform.${id}`)}
            </option>
          ))}
        </select>
        <select name="g" defaultValue={genre ?? ''} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <option value="">{t('filterGenre')}: {t('all')}</option>
          {GENRE_IDS.map((id) => (
            <option key={id} value={id}>
              {t(`genre.${id}`)}
            </option>
          ))}
        </select>
        <select name="players" defaultValue={sp.players ?? ''} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <option value="">{t('filterPlayers')}: {t('all')}</option>
          {[2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
              {n === 5 ? '+' : ''}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <input type="checkbox" name="crossplay" value="1" defaultChecked={crossplayOnly} />
          {t('filterCrossplay')}
        </label>
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-emerald-950">
          {t('all')}
        </button>
        <span className="ml-auto text-zinc-500">{t('count', { count: filtered.length })}</span>
      </form>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-zinc-400">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((entry) => (
            <GameCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
