import { getTranslations } from 'next-intl/server'
import { getDb, loadCatalog } from '@mgc/db'
import { Link } from '@/i18n/navigation'
import { GameCard } from '@/components/game-card'
import { MonetizationSlot } from '@/components/monetization-slot'

export const dynamic = 'force-dynamic'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('home')

  const { db } = await getDb()
  const catalog = await loadCatalog(db, locale)
  const featured = catalog.filter((entry) => entry.featured).slice(0, 8)
  const crossplayFacts = catalog.reduce((sum, entry) => sum + entry.crossplay.length, 0)

  return (
    <div className="space-y-14">
      <section className="mx-auto max-w-3xl py-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t('heroTitle')}</h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">{t('heroSubtitle')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/recommend"
            className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            {t('ctaFinder')}
          </Link>
          <Link
            href="/games"
            className="rounded-xl border border-white/15 px-6 py-3 font-medium text-zinc-200 transition hover:bg-white/5"
          >
            {t('ctaBrowse')}
          </Link>
        </div>
        <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 text-sm text-zinc-400">
          <div>
            <dt className="text-2xl font-bold text-zinc-100">{catalog.length}</dt>
            <dd>{t('statGames')}</dd>
          </div>
          <div>
            <dt className="text-2xl font-bold text-zinc-100">{crossplayFacts}</dt>
            <dd>{t('statCrossplayRules')}</dd>
          </div>
          <div>
            <dt className="text-2xl font-bold text-emerald-400">✓</dt>
            <dd>{t('statAccuracy')}</dd>
          </div>
        </dl>
      </section>

      <MonetizationSlot placement="home" />

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t('featured')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((entry) => (
            <GameCard key={entry.id} entry={entry} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-xl font-semibold">{t('howItWorks')}</h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <li key={step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <span className="text-sm font-bold text-emerald-400">{step}</span>
              <h3 className="mt-2 font-medium">{t(`step${step}Title`)}</h3>
              <p className="mt-1 text-sm text-zinc-400">{t(`step${step}Body`)}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
