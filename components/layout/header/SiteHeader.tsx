'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin, Plus, Bell, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useOpenCage } from '@/hooks/useOpenCage'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { useLocale } from 'next-intl'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'

export function SiteHeader() {
  const t = useTranslations()
  const city = useOpenCage()
  const { isAuthenticated, clearAuth } = useAuth()
  const locale = useLocale()
  const router = useRouter()

  const [location, setLocation] = useState('')

  useEffect(() => {
    setLocation(city)
  }, [city])

  const handleLogout = () => {
    clearAuth()
    Cookies.remove('auth-storage')
    router.push(`/${locale}/auth`)
  }

  return (
    <header className='sticky flex justify-center top-0 z-50 w-full border-b bg-white text-black dark:bg-black  dark:text-white px-2'>
      <div className='container flex h-16 items-center justify-between max-w-[1500px]'>
        {/* Город */}
        <div className='flex items-center gap-2 md:gap-4 '>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-2 text-black dark:text-white'
              >
                <MapPin className='h-4 w-4' />
                <span className='hidden sm:inline-block'>{location}</span>
                <ChevronDown className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start'>
              <DropdownMenuItem
                onClick={() => setLocation('Semarang, Indonesia')}
              >
                Semarang, Indonesia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation('Jakarta, Indonesia')}
              >
                Jakarta, Indonesia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLocation('Surabaya, Indonesia')}
              >
                Surabaya, Indonesia
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Логотип */}
        <div className='flex items-center'>
          <Link href='/' className='flex items-center gap-2'>
            <img src='/logo.svg' alt='logo' className='h-10 w-10 svg-white' />

            <span className='text-xl font-bold text-black dark:text-white hidden sm:inline-block'>
              Auto.Hunt
            </span>
          </Link>
        </div>

        {/* Остальные кнопки */}
        <div className='flex items-center gap-2 md:gap-4'>
          <Button
            variant='ghost'
            className='relative text-black dark:text-white'
            size='icon'
          >
            <MessageSquare className='h-5 w-5' />
            <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
              3
            </span>
          </Button>
          <Button
            variant='ghost'
            className='relative text-black dark:text-white'
            size='icon'
          >
            <Bell className='h-5 w-5' />
            <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
              2
            </span>
          </Button>
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-8 w-8 rounded-full'
                  size='icon'
                >
                  <Avatar className='rounded-md'>
                    <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem>
                  <Link
                    href={`/${locale}/profile`}
                    style={{ textDecoration: 'none', width: '100%' }}
                  >
                    {t('Header.Profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  {t('Header.Logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className='relative h-8 w-8 px-8 bg-blue-600 text-white hover:bg-blue-700'>
              <Link href='/auth'>{t('Header.Login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
