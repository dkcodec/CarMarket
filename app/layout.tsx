import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/layout/providers/ThemeProvider'
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
