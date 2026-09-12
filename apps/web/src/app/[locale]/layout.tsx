import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import { Header } from '@/components/header'
import { getRuntimeConfig } from '@mgc/config'
import type { Metadata } from 'next'
import '../globals.css'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'app' })
  return {
    title: `${t('name')} — ${t('tagline')}`,
    description: t('tagline'),
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations('footer')
  const { region, features } = getRuntimeConfig()

  return (
    <html lang={locale}>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-16 border-t border-white/10 py-8 text-center text-xs text-zinc-500">
            <p>{t('note')}</p>
            {region === 'cn' && !features.ugc && <p className="mt-1">{t('ugcClosed')}</p>}
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
