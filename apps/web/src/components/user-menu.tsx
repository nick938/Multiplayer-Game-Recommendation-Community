'use client'

import Link from 'next/link'
import { useRouter } from '@/i18n/navigation'
import { useSession, signOut } from '@mgc/auth/client'
import { useTranslations } from 'next-intl'

export function UserMenu() {
  const t = useTranslations('nav')
  const { data, isPending } = useSession()
  const router = useRouter()

  if (isPending) {
    return <div className="h-8 w-20 animate-pulse rounded-lg bg-white/5" />
  }

  if (!data?.user) {
    return (
      <Link
        href="/login"
        className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-sm font-medium text-emerald-950 transition hover:bg-emerald-400"
      >
        {t('login')}
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/me"
        className="max-w-32 truncate rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
      >
        {data.user.name ?? data.user.email}
      </Link>
      <button
        type="button"
        className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5"
        onClick={async () => {
          await signOut()
          router.refresh()
        }}
      >
        {t('logout')}
      </button>
    </div>
  )
}
