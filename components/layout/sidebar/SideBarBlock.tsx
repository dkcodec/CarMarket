'use client'
import React from 'react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import HeaderBar from './HeaderBar'
import AsideBar from './AsideBar'

interface SideBarBlockProps {
  children?: React.ReactNode
}

const SideBarBlock: React.FC<SideBarBlockProps> = (params) => {
  const { children } = params
  const t = useTranslations()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <>
      <HeaderBar isOpen={sidebarOpen} onClose={setSidebarOpen} />

      <div className='flex'>
        <AsideBar isOpen={sidebarOpen} />
        {children}
      </div>
    </>
  )
}

export default SideBarBlock
