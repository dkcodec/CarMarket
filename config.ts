// config.ts

import { Pathnames } from 'next-intl/routing'

export const locales = ['ru', 'en'] as const
export const defaultLocale = 'en' as const

export const pathnames: Pathnames<typeof locales> = {
  '/': '/',
}
