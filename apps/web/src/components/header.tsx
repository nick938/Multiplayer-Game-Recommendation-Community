import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { LocaleSwitcher } from './locale-switcher'
import { UserMenu } from './user-menu'

export async function Header() {
  const t = await getTranslations('nav')
  const app = await getTranslations('app')

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500 text-sm text-emerald-950">▶</span>
          <span>{app('name')}</span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 text-sm text-zinc-300 sm:flex">
          <Link className="rounded-lg px-3 py-1.5 hover:bg-white/5" href="/recommend">
            {t('finder')}
          </Link>
          <Link className="rounded-lg px-3 py-1.5 hover:bg-white/5" href="/games">
            {t('games')}
          </Link>
          <Link className="rounded-lg px-3 py-1.5 hover:bg-white/5" href="/compare">
            {t('compare')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
