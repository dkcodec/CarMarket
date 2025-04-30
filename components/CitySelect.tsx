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
import { setToLocalStorage } from '@/helpers/localStorageHelper'

const CitySelect = ({
  location,
  setLocation,
}: {
  location: string
  setLocation: React.Dispatch<React.SetStateAction<string>>
}) => {
  const [cities, setCities] = useState<Record<string, string>[]>([])

  useEffect(() => {
    ;(async () => {
      const response = await api.get('/details/cities')
      console.log(response)
      setCities(response.data)
    })()
  }, [])

  const handleCityClick = (city: string) => {
    setLocation(city)
    setToLocalStorage('city', city)

    const event = new CustomEvent('cityChange', {
      detail: { city },
      bubbles: true,
    })
    window.dispatchEvent(event)
  }

  console.log(cities)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='flex items-center gap-2 text-black dark:text-white'
        >
          <MapPin className='h-4 w-4' />
          <span className='hidden sm:inline-block'>{location}</span>
          <ChevronDown className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        {cities.map((city) => (
          <DropdownMenuItem
            key={city.source}
            onClick={() => handleCityClick(city.source)}
            className='cursor-pointer'
          >
            {city.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CitySelect
