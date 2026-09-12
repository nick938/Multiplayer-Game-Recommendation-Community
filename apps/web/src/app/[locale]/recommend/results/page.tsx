import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getDb, loadCatalog, toGameCandidate } from '@mgc/db'
import { recommend } from '@mgc/recommendation'
import { decodePreferences, encodePreferences } from '@/lib/finder-params'
import { MatchReasons } from '@/components/match-reasons'
import { MonetizationSlot } from '@/components/monetization-slot'
import { ShareButton } from '@/components/share-button'

export const dynamic = 'force-dynamic'

interface SearchParams {
  [key: string]: string | string[] | undefined
}

export default async function RecommendResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<SearchParams>
}) {
  const { locale } = await params
  const sp = await searchParams
  const t = await getTranslations()
  const results = await getTranslations('results')
  const finder = await getTranslations('finder')

  const parsed = decodePreferences(sp)
  if (!parsed.ok) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">{finder('invalid')}</p>
        <Link href="/recommend" className="mt-4 inline-block text-emerald-400 underline underline-offset-4">
          {results('back')}
        </Link>
      </div>
    )
  }
  const prefs = parsed.prefs

  const { db } = await getDb()
  const catalog = await loadCatalog(db, locale)
  const candidates = catalog.map(toGameCandidate).filter((c) => c != null)
  const output = recommend(candidates, prefs, { limit: 12 })

  const platformLabels = [...new Set(prefs.platforms)].map((p) => t(`platform.${p}`)).join(' · ')
  const modeLabel = t(`finder.mode${prefs.mode[0]!.toUpperCase()}${prefs.mode.slice(1)}`)
  const shareParams = encodePreferences(prefs).toString()

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <div>
          <h1 className="text-2xl font-bold">{results('title')}</h1>
          <p className="mt-1 text-sm text-zinc-400">{results('subtitle', { players: prefs.players, platforms: platformLabels, mode: modeLabel })}</p>
          <p className="text-sm text-zinc-500">{results('count', { count: output.totalMatches })}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <ShareButton params={shareParams} />
          <Link
            href="/recommend"
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
          >
            {results('back')}
          </Link>
        </div>
      </header>

      <MonetizationSlot placement="results" />

      {output.results.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="font-medium">{results('empty')}</p>
          <p className="mt-2 text-sm text-zinc-500">{results('emptyHint')}</p>
        </div>
      ) : (
        <ol className="space-y-4">
          {output.results.map((result, index) => (
            <li key={result.game.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="text-lg font-bold text-zinc-600">
                  #{index + 1}
                </span>
                <h2 className="text-xl font-semibold">
                  <Link href={`/game/${result.game.slug}`} className="hover:text-emerald-300">
                    {result.game.name}
                  </Link>
                </h2>
                <span className="ml-auto rounded-xl bg-emerald-500/15 px-3 py-1 font-bold text-emerald-300">
                  {results('match', { percent: result.matchPercent })}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {results('playableOn')}: {result.playableOn.map((p) => t(`platform.${p}`)).join(' · ')}
                {result.game.coop.copiesRequired === 'friend_pass' && ` · ${t('game.friendPass')}`}
              </p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-500">{results('strengths')}</h3>
                  <div className="mt-2">
                    <MatchReasons strengths={result.strengths} caveats={[]} />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500">{results('caveats')}</h3>
                  <div className="mt-2">
                    <MatchReasons strengths={[]} caveats={result.caveats} />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
