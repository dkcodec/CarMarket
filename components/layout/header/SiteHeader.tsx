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
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-blue-600'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='h-5 w-5 text-white'
              >
                <path d='M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C1.4 11.3 1 12.1 1 13v3c0 .6.4 1 1 1h2' />
                <circle cx='7' cy='17' r='2' />
                <path d='M9 17h6' />
                <circle cx='17' cy='17' r='2' />
              </svg>
            </div>
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
