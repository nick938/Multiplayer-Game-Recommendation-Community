import type { ReasonDescriptor } from '@mgc/domain'
import { getTranslations } from 'next-intl/server'

type Translate = (key: string, values?: Record<string, string | number>) => string

/**
 * Renders engine reason descriptors (plan §14: ✓ strengths / △ caveats).
 * Platform id lists arrive as "pc|ps5" and are localized here, keeping the
 * engine locale-free.
 */
export async function MatchReasons({
  strengths,
  caveats,
}: {
  strengths: ReasonDescriptor[]
  caveats: ReasonDescriptor[]
}) {
  const tReason = (await getTranslations('reason')) as unknown as Translate
  const tRoot = (await getTranslations()) as unknown as Translate

  return (
    <div className="space-y-1.5 text-sm">
      {strengths.map((reason, index) => (
        <p key={`s-${index}`} className="flex gap-2 text-zinc-300">
          <span className="text-emerald-400">✓</span>
          <span>{translateReason(tReason, tRoot, reason)}</span>
        </p>
      ))}
      {caveats.map((reason, index) => (
        <p key={`c-${index}`} className="flex gap-2 text-zinc-400">
          <span className="text-amber-500">△</span>
          <span>{translateReason(tReason, tRoot, reason)}</span>
        </p>
      ))}
    </div>
  )
}

function translateReason(tReason: Translate, tRoot: Translate, reason: ReasonDescriptor): string {
  const params: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(reason.params ?? {})) {
    if (key === 'platforms' && typeof value === 'string') {
      params[key] = value.split('|').map((id) => tRoot(`platform.${id}`)).join(' · ')
    } else if (key === 'platform' && typeof value === 'string') {
      params[key] = tRoot(`platform.${value}`)
    } else if (key === 'genre' && typeof value === 'string') {
      params[key] = tRoot(`genre.${value}`)
    } else if (key === 'tag' && typeof value === 'string') {
      params[key] = tRoot(`tag.${value}`)
    } else if (key === 'session' && typeof value === 'string') {
      params[key] = tRoot(`session.${value}`)
    } else if (key === 'intensity' && typeof value === 'string') {
      params[key] = tRoot(`intensityWord.${value}`)
    } else {
      params[key] = value
    }
  }
  return tReason(reason.key, params)
}
