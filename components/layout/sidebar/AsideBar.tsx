import React from 'react'

import { useTranslations } from 'next-intl'
import Filters from '@/components/Filters'
import { Button } from '@/components/ui/button'

interface AsideBarProps {
  isOpen: boolean
}
const AsideBar: React.FC<AsideBarProps> = (params) => {
  const t = useTranslations()
  const { isOpen } = params
  return (
    <aside
      className={`
            hidden sm:block
            h-inherit
            overflow-hidden
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-64 border-r' : 'w-0'}
          `}
    >
      <div
        className={`
              transition-opacity duration-200 delay-75
              ${isOpen ? 'opacity-100' : 'opacity-0'}
            `}
      >
        <Filters />
      </div>
    </aside>
  )
}

export default AsideBar
