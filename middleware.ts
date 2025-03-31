import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { middleware as tokenMiddleware } from './middleware/tokenMiddleware'
import { NextRequest } from 'next/server'

// Создаём объединённое middleware
export default async function combinedMiddleware(req: NextRequest) {
  await createMiddleware(routing)(req)
  return tokenMiddleware(req)
}

// Конфигурация для применения middleware
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)', // Применяется ко всем путям, кроме исключений
}
