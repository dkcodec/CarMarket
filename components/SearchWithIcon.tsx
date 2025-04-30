import { Input } from '@/components/ui/input'
import { getFromLocalStorage } from '@/helpers/localStorageHelper'
import { useDebounce } from '@/hooks/useDebounce'
import { Search } from 'lucide-react'
import { useLocale } from 'next-intl'
import { getLocale } from 'next-intl/server'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function SearchWithIcon(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()

  const currentSearchValue = searchParams.get('q') || ''

  const [searchValue, setSearchValue] = useState(currentSearchValue)

  const debouncedSearchValue = useDebounce(searchValue, 400)

  useEffect(() => {
    const params = new URLSearchParams()

    // копируем существующие параметры из searchParams
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q') {
        params.set(key, value)
      }
    }

    // если есть значение поиска — добавляем
    if (debouncedSearchValue && debouncedSearchValue.length > 0) {
      params.set('q', debouncedSearchValue)
    }

    // навигация
    router.replace(`/${locale}?${params.toString()}`)
  }, [debouncedSearchValue])

  return (
    <div className='grid w-full max-w-sm items-center gap-1.5'>
      <div className='relative'>
        <div className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground'>
          <Search className='h-4 w-4' />
        </div>
        <Input
          id='search'
          type='search'
          {...props}
          className={`${props.className} pl-8`}
          onChange={(e) => {
            setSearchValue(e.target.value)
          }}
        />
      </div>
    </div>
  )
}
