import { getTranslations } from 'next-intl/server'
import { getDb, loadCatalog, type CatalogEntry } from '@mgc/db'
import { Link } from '@/i18n/navigation'

export const dynamic = 'force-dynamic'

const DEFAULT_A = 'valheim'
const DEFAULT_B = 'grounded'

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ a?: string; b?: string }>
}) {
  const { locale } = await params
  const { a, b } = await searchParams
  const t = await getTranslations('compare')

  const { db } = await loadDb()
  const catalog = await loadCatalog(db, locale)
  const bySlug = new Map(catalog.map((entry) => [entry.slug, entry]))
  const gameA = bySlug.get(a ?? DEFAULT_A) ?? bySlug.get(DEFAULT_A)
  const gameB = bySlug.get(b ?? DEFAULT_B) ?? bySlug.get(DEFAULT_B)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <form className="flex flex-wrap items-center gap-2 text-sm">
        <GameSelect name="a" entries={catalog} value={gameA?.slug} label={t('pickA')} />
        <span className="text-zinc-500">vs</span>
        <GameSelect name="b" entries={catalog} value={gameB?.slug} label={t('pickB')} />
        <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2 font-medium text-emerald-950">
          {t('title')}
        </button>
      </form>

      {gameA && gameB && <CompareTable a={gameA} b={gameB} />}
    </div>
  )
}

function GameSelect({
  name,
  entries,
  value,
  label,
}: {
  name: string
  entries: CatalogEntry[]
  value?: string
  label: string
}) {
  return (
    <select
      name={name}
      defaultValue={value}
      aria-label={label}
      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
    >
      {[...entries]
        .sort((x, y) => x.displayName.localeCompare(y.displayName))
        .map((entry) => (
          <option key={entry.slug} value={entry.slug} className="bg-zinc-900">
            {entry.displayName}
          </option>
        ))}
    </select>
  )
}

async function CompareTable({ a, b }: { a: CatalogEntry; b: CatalogEntry }) {
  const t = await getTranslations('compare')
  const tRoot = await getTranslations()

  const crossplaySummary = (entry: CatalogEntry) => {
    const supported = entry.crossplay.filter((rule) => rule.status === 'SUPPORTED').length
    const total = entry.crossplay.length
    if (supported === 0) return t('no')
    if (supported === total) return t('yes')
    return t('partial')
  }

  const rows: Array<[string, string, string]> = [
    [t('communityRating'), fmt(a.communityRating, tRoot), fmt(b.communityRating, tRoot)],
    [t('maxPlayers'), String(a.coop?.maxOnlinePlayers ?? '—'), String(b.coop?.maxOnlinePlayers ?? '—')],
    [t('platforms'), a.platforms.map((p) => tRoot(`platform.${p}`)).join(', '), b.platforms.map((p) => tRoot(`platform.${p}`)).join(', ')],
    [t('crossplay'), crossplaySummary(a), crossplaySummary(b)],
    [t('groupFit'), groupFit(a, tRoot), groupFit(b, tRoot)],
    [t('sessionLength'), a.coop ? tRoot(`session.${a.coop.sessionLength}`) : '—', b.coop ? tRoot(`session.${b.coop.sessionLength}`) : '—'],
    [t('intensity'), a.coop ? tRoot(`intensityWord.${a.coop.intensity}`) : '—', b.coop ? tRoot(`intensityWord.${b.coop.intensity}`) : '—'],
    [t('difficulty'), scale(a.coop?.difficulty, tRoot), scale(b.coop?.difficulty, tRoot)],
    [t('grind'), scale(a.coop?.grind, tRoot), scale(b.coop?.grind, tRoot)],
    [t('communication'), scale(a.coop?.communication, tRoot), scale(b.coop?.communication, tRoot)],
    [t('friendPass'), bool(a.coop?.friendPass, t), bool(b.coop?.friendPass, t)],
    [t('dedicatedServer'), tri(a.coop?.dedicatedServer, t), tri(b.coop?.dedicatedServer, t)],
  ]

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            <th className="p-3 text-left text-zinc-500">{t('title')}</th>
            <th className="p-3 text-left font-semibold">
              <Link href={`/game/${a.slug}`} className="hover:text-emerald-300">{a.displayName}</Link>
            </th>
            <th className="p-3 text-left font-semibold">
              <Link href={`/game/${b.slug}`} className="hover:text-emerald-300">{b.displayName}</Link>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, va, vb]) => (
            <tr key={label} className="border-b border-white/5 last:border-0">
              <td className="p-3 text-zinc-500">{label}</td>
              <td className="p-3">{va}</td>
              <td className="p-3">{vb}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function groupFit(entry: CatalogEntry, tRoot: Awaited<ReturnType<typeof getTranslations>>): string {
  const parts: string[] = []
  for (const size of [2, 3, 4, 5] as const) {
    const stat = entry.groupSizeRatings[size]
    if (stat) parts.push(`${size === 5 ? '5+' : size}: ${tRoot('game.of10', { score: stat.score })}`)
  }
  return parts.join(' · ') || '—'
}

function fmt(value: number | null, tRoot: Awaited<ReturnType<typeof getTranslations>>): string {
  return value != null ? tRoot('game.of10', { score: value }) : '—'
}

function scale(value: number | undefined | null, tRoot: Awaited<ReturnType<typeof getTranslations>>): string {
  return value != null ? tRoot('game.of10', { score: value }) : '—'
}

function bool(value: boolean | undefined, t: Awaited<ReturnType<typeof getTranslations<'compare'>>>): string {
  if (value == null) return '—'
  return value ? t('yes') : t('no')
}

function tri(value: boolean | null | undefined, t: Awaited<ReturnType<typeof getTranslations<'compare'>>>): string {
  if (value == null) return t('partial')
  return value ? t('yes') : t('no')
}

async function loadDb() {
  return getDb()
}
