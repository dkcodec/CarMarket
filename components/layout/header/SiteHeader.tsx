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
import Image from 'next/image'
import CitySelect from '@/components/CitySelect'

export function SiteHeader() {
  const t = useTranslations()
  const { isAuthenticated, clearAuth } = useAuth()
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    clearAuth()
    Cookies.remove('auth-storage')
    setOpen(false)
  }

  const handleProfileClick = () => {
    setOpen(false)
    router.push(`/${locale}/profile`)
  }

  return (
    <header className='sticky flex justify-center top-0 z-50 w-full border-b bg-white text-black dark:bg-black  dark:text-white px-2'>
      <div className='container flex h-16 items-center justify-between max-w-[1500px]'>
        {/* Город */}
        <div className='flex items-center gap-2 md:gap-4 '>
          <CitySelect />
        </div>

        {/* Логотип */}
        <div className='flex items-center'>
          <Link href={`/${locale}`} className='flex items-center gap-2'>
            <Image
              src='/logo.svg'
              alt='logo'
              className='dark:invert'
              width={50}
              height={50}
            />

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

          {/* Профиль */}
          {isAuthenticated ? (
            <DropdownMenu open={open} onOpenChange={setOpen}>
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
                <DropdownMenuItem onClick={handleProfileClick}>
                  {t('Header.Profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  {t('Header.Logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              className='relative h-8 w-8 px-8 bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => router.replace(`/auth`)}
            >
              {t('Header.Login')}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
