'use client'
import Car from '@/types/car'
import React, { useEffect, useState } from 'react'
import SkeletonCarCard from '../skeleton/SkeletonCarCard'
import CarCard from '../CarCard'
import { getFromLocalStorage } from '@/helpers/localStorageHelper'
import PaginationComp from '../PaginationComp'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { Skeleton } from '../ui/skeleton'
import CarService from '@/services/carService'

const Main: React.FC = () => {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const city =
    String(getFromLocalStorage('city')).toLocaleLowerCase() || 'astana'

  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)

  // pagination
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(9)
  const [totalCars, setTotalCars] = useState(0)

  useEffect(() => {
    ;(async function fetchCars() {
      try {
        setLoading(true)

        const query: Record<string, string> = {
          city,
          limit: String(pageSize),
          offset: String(pageIndex),
        }

        const optionalParams = [
          'model',
          'brand',
          'generation',
          'price_start',
          'price_end',
        ]

        optionalParams.forEach((param) => {
          const value = searchParams.get(param)
          if (value && value.length > 0) {
            query[param] = value
          }
        })

        const queryString = new URLSearchParams(query).toString()
        console.log(queryString)

        const data = await CarService.getCars(query)
        setCars(data?.data?.cars || [])
        setTotalCars(data?.data?.total_count || 0)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    })()
  }, [city, pageIndex, pageSize, searchParams])

  return (
    <main className='flex-1 p-4 w-inherit overflow-y-auto no-scrollbar h-[calc(100vh-135px)]'>
      <ScrollArea className='h-full'>
        <div className='flex flex-col justify-center gap-4'>
          {loading ? (
            <Skeleton className='w-[140px] h-[30px]' />
          ) : (
            <div className='text-xl font-bold'>
              {t('MainPage.CAR_COUNT')}: {totalCars}
            </div>
          )}
          <div className='flex gap-4 flex-wrap justify-center'>
            {loading
              ? Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCarCard key={i} />
                ))
              : cars.map((car) => <CarCard car={car} key={car.id} />)}
          </div>
        </div>
        <div className='flex justify-center mt-4 pb-4'>
          <PaginationComp
            totalItems={totalCars}
            pageIndex={pageIndex}
            pageSize={pageSize}
            setPageIndex={setPageIndex}
          />
        </div>
      </ScrollArea>
    </main>
  )
}

export default Main
