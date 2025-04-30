import { NextIntlClientProvider } from 'next-intl'
import { SiteHeader } from '@/components/layout/header/SiteHeader'
import { getLocale } from 'next-intl/server'

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = (await import(`../../lang/${locale}.json`)).default
  return (
    <div>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </div>
  )
}
