import { getTranslations } from 'next-intl/server'
import { FinderForm } from '@/components/finder-form'

export default async function RecommendPage() {
  const t = await getTranslations('finder')

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="mt-1 text-zinc-400">{t('subtitle')}</p>
      </header>
      <FinderForm />
    </div>
  )
}
