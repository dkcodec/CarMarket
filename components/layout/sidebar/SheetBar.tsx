import React from 'react'
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
import { SlidersHorizontal } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Filters from '@/components/Filters'

const SheetBar: React.FC = () => {
  const t = useTranslations()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline'>
          <SlidersHorizontal className='w-4 h-4' />
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='p-0'>
        <SheetHeader className='p-4 border-b'>
          <SheetTitle className='flex justify-between items-center mt-4'>
            <div>{t('Sidebar.TITLE')}</div>
            <Button variant='ghost' className='text-red-400'>
              {t('Sidebar.RESET')}
            </Button>
          </SheetTitle>
          <SheetDescription>Выберите раздел</SheetDescription>
        </SheetHeader>
        <Filters />
        <SheetClose asChild>
          <Button variant='outline' className='m-4'>
            Закрыть
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}

export default SheetBar
