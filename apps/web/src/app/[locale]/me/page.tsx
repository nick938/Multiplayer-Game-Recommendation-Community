import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getDb, getUserLibrary } from '@mgc/db'
import { currentUser } from '@/lib/session'
import { GameCard } from '@/components/game-card'
import { Link } from '@/i18n/navigation'

export const dynamic = 'force-dynamic'

export default async function LibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('me')

  const user = await currentUser()
  if (!user) redirect('/login')

  const { db } = await getDb()
  const library = await getUserLibrary(db, user.id, locale)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      {library.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-zinc-400">{t('empty')}</p>
          <Link href="/recommend" className="mt-3 inline-block text-emerald-400 underline underline-offset-4">
            {t('emptyCta')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {library.map(({ entry }) => (
            <GameCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
