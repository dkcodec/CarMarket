import React from 'react'
import { Button } from '@/components/ui/button'
import SearchWithIcon from '@/components/SearchWithIcon'
import { useTranslations } from 'next-intl'
import SheetBar from './SheetBar'
import { useFiltersStore } from '@/store/useFiltersStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HeaderBarProps {
  isOpen: boolean
  onClose: React.Dispatch<React.SetStateAction<boolean>>
}

const HeaderBar: React.FC<HeaderBarProps> = (params) => {
  const t = useTranslations()
  const { isOpen, onClose } = params
  const router = useRouter()
  const { resetFilters } = useFiltersStore()

  const handleChange = (value: string) => {
    resetFilters()
    router.push(`/?q=${value}`)
  }

  return (
    <div className='flex justify-between items-center p-4 border-b'>
      <div className='flex gap-2 w-full mr-4'>
        <SearchWithIcon
          placeholder={t('Search.PLACEHOLDER')}
          className='w-[100%]'
          onChange={(e) => {
            handleChange(e.target.value)
          }}
        />
      </div>

      <div className='flex gap-4'>
        <div className='hidden sm:block'>
          <Button variant='outline' onClick={() => onClose((prev) => !prev)}>
            {isOpen ? t('Sidebar.HIDE') : t('Sidebar.SHOW')}
          </Button>
        </div>

        <div className='hidden sm:block'>
          <Button variant='outline' className='bg-blue-600 text-white'>
            <Link href='/sell-car'>{t('Sidebar.SELL_CAR')}</Link>
          </Button>
        </div>
      </div>

      <div className='sm:hidden'>
        <SheetBar />
      </div>
    </div>
  )
}

export default HeaderBar
