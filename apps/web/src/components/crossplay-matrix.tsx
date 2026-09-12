import { getTranslations } from 'next-intl/server'
import type { PlatformId } from '@mgc/domain'
import type { CatalogEntry } from '@mgc/db'

const STATUS_ICON: Record<string, string> = {
  SUPPORTED: '✓',
  PARTIAL: '~',
  NOT_SUPPORTED: '✕',
  UNKNOWN: '?',
}

const STATUS_COLOR: Record<string, string> = {
  SUPPORTED: 'text-emerald-400',
  PARTIAL: 'text-amber-400',
  NOT_SUPPORTED: 'text-zinc-600',
  UNKNOWN: 'text-zinc-500',
}

/**
 * Platform-pair compatibility grid (plan §16–17). This is the site's most
 * distinctive data: crossplay is per pair, never a boolean.
 */
export async function CrossplayMatrix({ entry }: { entry: CatalogEntry }) {
  const t = await getTranslations()
  const platforms = entry.platforms
  if (platforms.length < 2) {
    return (
      <p className="text-sm text-zinc-400">
        {platforms.length === 1 ? t('platform.' + platforms[0]) : '—'}
      </p>
    )
  }

  const lookup = new Map(entry.crossplay.map((rule) => [pairKey(rule.a, rule.b), rule]))

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[320px] border-separate border-spacing-1 text-sm">
        <thead>
          <tr>
            <th aria-hidden />
            {platforms.map((b) => (
              <th key={b} className="px-2 pb-1 text-xs font-medium text-zinc-400">
                {t(`platform.${b}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {platforms.map((a) => (
            <tr key={a}>
              <th className="px-2 text-right text-xs font-medium text-zinc-400">{t(`platform.${a}`)}</th>
              {platforms.map((b) => {
                if (a === b) {
                  return (
                    <td key={b} className="rounded-lg bg-white/5 text-center text-zinc-600">
                      —
                    </td>
                  )
                }
                const rule = lookup.get(pairKey(a, b))
                const status = rule?.status ?? 'UNKNOWN'
                return (
                  <td
                    key={b}
                    title={rule?.note ?? undefined}
                    className={`rounded-lg bg-white/[0.04] py-1.5 text-center font-semibold ${STATUS_COLOR[status]}`}
                  >
                    {STATUS_ICON[status]}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-500">{t('game.crossplayMatrixHint')}</p>
    </div>
  )
}

function pairKey(a: PlatformId, b: PlatformId): string {
  return [a, b].sort().join('#')
}
