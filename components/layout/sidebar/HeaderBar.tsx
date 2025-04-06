import React from 'react'
import { Button } from '@/components/ui/button'
import SearchWithIcon from '@/components/SearchWithIcon'
import { useTranslations } from 'next-intl'
import SheetBar from './SheetBar'

interface HeaderBarProps {
  isOpen: boolean
  onClose: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderBar: React.FC<HeaderBarProps> = (params) => {
  const t = useTranslations()
  const { isOpen, onClose } = params
  return (
    <div className='flex justify-between items-center p-4 border-b'>
      <div className='flex gap-2 w-full mr-4'>
        <SearchWithIcon
          placeholder={t('Search.PLACEHOLDER')}
          className='w-[100%]'
        />
      </div>

      <div className='hidden sm:block'>
        <Button variant='outline' onClick={() => onClose((prev) => !prev)}>
          {isOpen ? 'Скрыть сайдбар' : 'Показать сайдбар'}
        </Button>
      </div>

      <div className='hidden sm:block'>
        <Button variant='outline' onClick={() => onClose((prev) => !prev)}>
          {isOpen ? 'Скрыть сайдбар' : 'Показать сайдбар'}
        </Button>
      </div>

      <div className='sm:hidden'>
        <SheetBar />
      </div>
    </div>
  )
}

export default HeaderBar
