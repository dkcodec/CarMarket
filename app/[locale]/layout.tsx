import { NextIntlClientProvider } from 'next-intl'
import { SiteHeader } from '@/components/layout/header/Heder'
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
        <SiteHeader />
        <div className='max-w-[1500px] mx-auto px-4'>{children}</div>
      </NextIntlClientProvider>
    </div>
  )
}
