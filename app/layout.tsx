import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/layout/providers/providers'
import { getLocale } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kolesa Project',
  description: 'Dark/light theme with Next.js 15 + Tailwind',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
