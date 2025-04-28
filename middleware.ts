import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Список защищенных маршрутов
const protectedRoutes = ['/profile', '/favorites', '/settings']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-storage')?.value
  const { pathname } = request.nextUrl

  console.log(token)

  // Редирект с корневого пути на локализованную версию
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  // Проверяем, является ли маршрут защищенным
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Если маршрут защищенный и нет токена, перенаправляем на страницу авторизации
  if (isProtectedRoute && !token) {
    const url = new URL('/auth', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // Если пользователь авторизован и пытается зайти на страницу авторизации,
  // перенаправляем на главную страницу
  if (pathname === '/auth' && token) {
    return NextResponse.redirect(new URL('/en', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
