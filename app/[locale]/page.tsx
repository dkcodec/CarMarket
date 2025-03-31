'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import Car from '@/types/car'
import CarCard from '@/components/CarCard'
import SkeletonCarCard from '@/components/skeleton/SkeletonCarCard'
import { useMobile } from '@/hooks/useMobile'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import SearchWithIcon from '@/components/SearchWithIcon'
import { useTranslations } from 'next-intl'
import { SlidersHorizontal } from 'lucide-react'

export default function HomePage() {
  const t = useTranslations()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isMobile = useMobile()

  useEffect(() => {
    const getCarsData = async () => {
      try {
        setLoading(true)
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/cars/main`
        )
        console.log(res, 'RES')
        setCars(res.data?.data?.cars || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    getCarsData()
  }, [])

  return (
    <div className=''>
      <div className='flex justify-between items-center p-4 border-b'>
        <div className='flex gap-2 w-full'>
          <SearchWithIcon
            placeholder={t('Search.PLACEHOLDER')}
            className='w-[100%]'
          />
        </div>

        <div className='hidden sm:block'>
          <Button
            variant='outline'
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? 'Скрыть сайдбар' : 'Показать сайдбар'}
          </Button>
        </div>

        <div className='hidden sm:block'>
          <Button
            variant='outline'
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? 'Скрыть сайдбар' : 'Показать сайдбар'}
          </Button>
        </div>

        <div className='sm:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant='outline'>
                <SlidersHorizontal className='w-4 h-4' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0'>
              <SheetHeader className='p-4 border-b'>
                <SheetTitle className='flex justify-between items-center mt-3'>
                  <div>{t('Sidebar.TITLE')}</div>
                  <Button variant='ghost' className='text-red-400'>
                    {t('Sidebar.RESET')}
                  </Button>
                </SheetTitle>
                <SheetDescription>Выберите раздел</SheetDescription>
              </SheetHeader>
              <ScrollArea className='h-full p-4'>
                <nav className='space-y-2'>
                  <Button variant='ghost' className='w-full justify-start'>
                    Главная
                  </Button>
                  <Button variant='ghost' className='w-full justify-start'>
                    Каталог
                  </Button>
                  <Button variant='ghost' className='w-full justify-start'>
                    Настройки
                  </Button>
                </nav>
              </ScrollArea>
              <SheetClose asChild>
                <Button variant='outline' className='m-4'>
                  Закрыть
                </Button>
              </SheetClose>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className='flex'>
        <aside
          className={`
            hidden sm:block
            border-r h-[calc(100vh-140px)]
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'w-64' : 'w-0'}
          `}
        >
          <div
            className={`
              transition-opacity duration-200 delay-75
              ${sidebarOpen ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <ScrollArea className=' p-4'>
              <nav className='space-y-2'>
                <Button variant='ghost' className='w-full justify-start'>
                  Главная
                </Button>
                <Button variant='ghost' className='w-full justify-start'>
                  Каталог
                </Button>
                <Button variant='ghost' className='w-full justify-start'>
                  Настройки
                </Button>
              </nav>
            </ScrollArea>
          </div>
        </aside>

        {/* Основной контент */}
        <main className='flex-1 p-4 '>
          <div className='flex gap-4 flex-wrap'>
            {loading
              ? Array.from({ length: isMobile ? 6 : 10 }).map((_, i) => (
                  <SkeletonCarCard key={i} />
                ))
              : cars.map((car) => <CarCard car={car} key={car.id} />)}
          </div>
        </main>
      </div>
    </div>
  )
}
