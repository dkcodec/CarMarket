'use client'

import { useState, useEffect } from 'react'

/**
 * useDebounce
 * @param value - любое значение, которое нужно «дебаунсить»
 * @param delay - задержка в мс
 * @returns то же значение, только обновляется с задержкой
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
