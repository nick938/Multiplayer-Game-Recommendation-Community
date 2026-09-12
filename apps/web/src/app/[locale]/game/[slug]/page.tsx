import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getDb, loadCatalog, getReviews, getUserGameStatuses, getGameIdBySlug, type CatalogEntry } from '@mgc/db'
import { currentUser } from '@/lib/session'
import { getRuntimeConfig } from '@mgc/config'
import { CrossplayMatrix } from '@/components/crossplay-matrix'
import { SaveButtons } from '@/components/save-buttons'
import { ReviewForm } from '@/components/review-form'
import { CorrectionForm } from '@/components/correction-form'
import { MonetizationSlot } from '@/components/monetization-slot'
import type { LibraryStatus } from '@/app/actions/games'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params
  const { db } = await getDb()
  const catalog = await loadCatalog(db, locale)
  const entry = catalog.find((game) => game.slug === slug)
  if (!entry) return {}
  return {
    title: `${entry.displayName} — crossplay / co-op / players`,
    description: entry.shortDescription ?? undefined,
  }
}

const COPY_KEY: Record<string, string> = {
  each_own_copy: 'copiesEachOwnCopy',
  friend_pass: 'copiesFriendPass',
  single_shared_screen: 'copiesSingleSharedScreen',
}

export default async function GameDetailPage({ params }: Props) {
  const { locale, slug } = await params
  const t = await getTranslations()
  const { db } = await getDb()

  const catalog = await loadCatalog(db, locale)
  const entry = catalog.find((game) => game.slug === slug)
  if (!entry) notFound()

  const user = await currentUser()
  const features = getRuntimeConfig().features
  const [reviews, statuses, gameId] = await Promise.all([
    getReviews(db, entry.id),
    user ? getUserGameStatuses(db, user.id) : Promise.resolve([]),
    getGameIdBySlug(db, slug),
  ])
  const currentStatus = (statuses.find((s) => s.gameId === gameId)?.status ?? null) as LibraryStatus | null

  const coop = entry.coop

  return (
    <article className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className="grid h-28 w-full shrink-0 place-items-center rounded-2xl text-3xl font-black text-black/50 sm:w-44"
          style={{
            background: `linear-gradient(135deg, oklch(0.72 0.14 ${entry.coverHue}), oklch(0.55 0.16 ${(entry.coverHue + 60) % 360}))`,
          }}
        >
          {entry.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight">{entry.displayName}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {entry.developer}
            {entry.releaseYear ? ` · ${entry.releaseYear}` : ''}
          </p>
          {entry.shortDescription && <p className="mt-3 max-w-2xl text-zinc-300">{entry.shortDescription}</p>}
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-zinc-400">
            {entry.genres.map((genre) => (
              <span key={genre} className="rounded-md bg-white/[0.06] px-2 py-0.5">
                {t(`genre.${genre}`)}
              </span>
            ))}
            {entry.tags.map((tag) => (
              <span key={tag} className="rounded-md bg-white/[0.04] px-2 py-0.5">
                {t(`tag.${tag}`)}
              </span>
            ))}
          </div>
        </div>
        {entry.communityRating != null && (
          <div className="sm:ml-auto sm:text-right">
            <div className="text-3xl font-bold text-emerald-400">{t('game.of10', { score: entry.communityRating })}</div>
            <div className="text-xs text-zinc-500">
              {entry.ratingSource === 'editor' ? t('game.editorTag') : `${t('game.communityTag')} · ${entry.ratingCount}`}
            </div>
          </div>
        )}
      </header>

      <MonetizationSlot placement="detail" />

      {user ? (
        <SaveButtons slug={entry.slug} current={currentStatus} />
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-zinc-400">
          {t('game.loginToInteract')}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-semibold">{t('game.coopInfo')}</h2>
          {coop && <FactGrid entry={entry} />}
          {entry.description && <p className="pt-2 text-sm leading-relaxed text-zinc-400">{entry.description}</p>}
          {coop?.sourceUrl && (
            <p className="text-xs text-zinc-500">
              {t('game.source')}:{' '}
              <a className="underline underline-offset-4 hover:text-zinc-300" href={coop.sourceUrl} target="_blank" rel="noreferrer">
                {safeHost(coop.sourceUrl)}
              </a>
              {coop.verifiedAt && ` · ${t('game.verified', { date: coop.verifiedAt.slice(0, 10) })}`}
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="font-semibold">{t('game.crossplayMatrix')}</h2>
          <CrossplayMatrix entry={entry} />
          <p className="text-xs text-zinc-500">
            {t('game.crossSave')}: {entry.crossSave ? t('game.supported') : t('game.notSupported')}
          </p>
        </section>
      </div>

      <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="font-semibold">{t('game.groupSizeRatings')}</h2>
        <GroupSizeBars entry={entry} />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">{t('game.reviews')}</h2>
        {features.ugc && user && <ReviewForm slug={entry.slug} />}
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-500">{t('game.reviewEmpty')}</p>
        ) : (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-zinc-200">{review.author}</span>
                  {review.groupSize != null && (
                    <span className="text-xs text-emerald-400">{t('game.playersCount', { count: review.groupSize })}</span>
                  )}
                  <span className="ml-auto text-xs text-zinc-600">{review.createdAt.toISOString().slice(0, 10)}</span>
                </div>
                <p className="mt-1 text-zinc-300">{review.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CorrectionForm slug={entry.slug} />
    </article>
  )
}

async function FactGrid({ entry }: { entry: CatalogEntry }) {
  const t = await getTranslations()
  const coop = entry.coop!
  const yes = t('game.supported')
  const no = t('game.notSupported')
  const mark = (value: boolean) => (value ? yes : no)
  const facts: Array<[string, string]> = [
    [t('game.onlineCoop'), mark(coop.onlineCoop)],
    [t('game.localCoop'), mark(coop.localCoop)],
    [t('game.splitScreen'), mark(coop.splitScreen)],
    [t('game.lan'), mark(coop.lan)],
    [t('game.maxPlayers'), String(coop.maxOnlinePlayers)],
    [t('game.dedicatedServer'), coop.dedicatedServer == null ? t('game.unknown') : mark(coop.dedicatedServer)],
    [t('game.friendPass'), mark(coop.friendPass)],
    [t('game.copiesRequired'), t(`game.${COPY_KEY[coop.copiesRequired] ?? 'copiesEachOwnCopy'}`)],
    [t('game.session'), t(`session.${coop.sessionLength}`)],
    [t('game.intensity'), t(`intensityWord.${coop.intensity}`)],
  ]
  if (coop.difficulty != null) facts.push([t('game.difficulty'), t('game.of10', { score: coop.difficulty })])
  if (coop.grind != null) facts.push([t('game.grind'), t('game.of10', { score: coop.grind })])
  if (coop.communication != null) facts.push([t('game.communication'), t('game.of10', { score: coop.communication })])

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
      {facts.map(([label, value]) => (
        <div key={label} className="flex flex-col border-b border-white/5 pb-1.5">
          <dt className="text-xs text-zinc-500">{label}</dt>
          <dd className={value === no ? 'text-zinc-500' : 'text-zinc-200'}>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

async function GroupSizeBars({ entry }: { entry: CatalogEntry }) {
  const t = await getTranslations()
  const buckets: Array<2 | 3 | 4 | 5> = [2, 3, 4, 5]
  return (
    <div className="space-y-2">
      {buckets.map((size) => {
        const stat = entry.groupSizeRatings[size]
        return (
          <div key={size} className="flex items-center gap-3 text-sm">
            <span className="w-12 shrink-0 text-zinc-400">{size === 5 ? '5+' : size}</span>
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
              {stat && <div className="h-full rounded-full bg-emerald-500/80" style={{ width: `${stat.score * 10}%` }} />}
            </div>
            <span className="w-40 shrink-0 text-right text-xs text-zinc-500">
              {stat
                ? `${t('game.of10', { score: stat.score })} · ${stat.source === 'editor' ? t('game.editorTag') : `${t('game.communityTag')} ${stat.count}`}`
                : '—'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function safeHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
