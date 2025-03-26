'use client'
import Car from '@/types/car'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Image from 'next/image'
import CarCard from '@/components/CarCard'
import SkeletonCarCard from '@/components/skeleton/SkeletonCarCard'
import { useMobile } from '@/hooks/useMobile'

export default function HomePage() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const isMobile = useMobile()

  useEffect(() => {
    const getCarsData = async () => {
      try {
        setLoading(true)
        await axios
          .get(`${process.env.NEXT_PUBLIC_API_URL}/cars/`)
          .then((res) => {
            setCars(res.data.data.cars)
            setLoading(false)
          })
      } catch (error) {
        console.error(error)
      }
    }
    getCarsData()
  }, [])

  console.log(cars)

  return (
    <div className=''>
      <div className='flex justify-center'>header</div>
      <div className='flex'>
        <div className='hidden sm:inline-block'>filters</div>
        <div className='flex gap-4 flex-wrap w-full sm:w-auto'>
          {loading
            ? Array.from({ length: isMobile ? 6 : 10 }).map((_, i) => (
                <SkeletonCarCard key={i} />
              ))
            : cars.map((car: Car) => <CarCard car={car} key={car.id} />)}
        </div>
      </div>
    </div>
  )
}
