'use client'
import { useState, useEffect } from 'react'
import { isMobileUserAgent } from '@/helpers/isMobileUserAgent'

type UseMobileParams = {
  userAgent?: string
  maxWidth?: number
}

export function useMobile({ userAgent, maxWidth = 639 }: UseMobileParams = {}) {
  const ssrIsMobile = userAgent ? isMobileUserAgent(userAgent) : false

  const [isMobile, setIsMobile] = useState(ssrIsMobile)

  useEffect(() => {
    if (!userAgent) {
      const handleCheck = () => {
        const byWidth = window.innerWidth <= maxWidth

        const byUA = isMobileUserAgent(navigator.userAgent)

        setIsMobile(byWidth || byUA)
      }

      handleCheck()

      window.addEventListener('resize', handleCheck)
      return () => window.removeEventListener('resize', handleCheck)
    }
  }, [userAgent, maxWidth])

  return isMobile
}
