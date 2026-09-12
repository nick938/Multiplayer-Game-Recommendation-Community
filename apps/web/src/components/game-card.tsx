import { getTranslations } from 'next-intl/server'
import type { CatalogEntry } from '@mgc/db'
import { Link } from '@/i18n/navigation'

/** Procedural cover — hue comes from the data, no copyrighted art is hotlinked. */
function Cover({ hue, name }: { hue: number; name: string }) {
  return (
    <div
      className="grid h-24 place-items-center rounded-xl text-xl font-black text-black/50"
      style={{
        background: `linear-gradient(135deg, oklch(0.72 0.14 ${hue}), oklch(0.55 0.16 ${(hue + 60) % 360}))`,
      }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  )
}

export async function GameCard({ entry }: { entry: CatalogEntry }) {
  const t = await getTranslations()
  const platforms = entry.platforms.map((p) => t(`platform.${p}`)).join(' · ')

  return (
    <Link
      href={`/game/${entry.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition hover:border-emerald-500/40 hover:bg-white/[0.06]"
    >
      <Cover hue={entry.coverHue} name={entry.name} />
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-semibold leading-tight">{entry.displayName}</h3>
          {entry.communityRating != null && (
            <span className="shrink-0 text-sm text-emerald-400">{t('game.of10', { score: entry.communityRating })}</span>
          )}
        </div>
        {entry.shortDescription && (
          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{entry.shortDescription}</p>
        )}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
        <span className="truncate">{platforms}</span>
        <span>·</span>
        <span>
          {t('game.maxPlayers')} {entry.coop?.maxOnlinePlayers ?? '—'}
        </span>
        {entry.crossplay.some((rule) => rule.status === 'SUPPORTED') && (
          <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-emerald-400">
            {t('compare.crossplay')}
          </span>
        )}
      </div>
    </Link>
  )
}
