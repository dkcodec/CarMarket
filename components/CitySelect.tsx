import { ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { MapPin } from 'lucide-react'
import api from '@/lib/api'
import {
  getFromLocalStorage,
  setToLocalStorage,
} from '@/helpers/localStorageHelper'

const CitySelect = () => {
  const [cities, setCities] = useState<Record<string, string>[]>([])
  const [location, setLocation] = useState<string>('')

  useEffect(() => {
    setLocation(getFromLocalStorage('city') || 'astana')
  }, [])

  useEffect(() => {
    ;(async () => {
      const response = await api.get('/details/cities')
      setCities(response.data)
    })()
  }, [])

  const handleCityClick = (city: string) => {
    setToLocalStorage('city', city)
    setLocation(city)

    const event = new CustomEvent('cityChange', {
      detail: { city },
      bubbles: true,
    })
    window.dispatchEvent(event)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex items-center gap-2 text-black dark:text-white'
        >
          <MapPin className='h-4 w-4' />
          <span className='hidden sm:inline-block'>
            {cities.find((city) => city.source === location)?.name}
          </span>
          <ChevronDown className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {cities.map((city) => (
          <DropdownMenuItem
            key={city.source}
            onClick={() => handleCityClick(city.source)}
            className={`cursor-pointer ${
              city.source === location ? 'bg-accent text-accent-foreground' : ''
            }`}
          >
            {city.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CitySelect
