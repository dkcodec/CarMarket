import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Car from '@/types/car'
import Image from 'next/image'
import { useMobile } from '@/hooks/useMobile'
import Link from 'next/link'
interface CarCardProps {
  car: Car
}

const CarCard: React.FC<CarCardProps> = (props) => {
  const { car } = props
  const fullName = car.brand.name + ' ' + car?.model?.name
  const isMobile = useMobile()

  return (
    <Link href={`/car/${car.id}`}>
      <Card className='flex flex-col space-y-3 w-full sm:w-auto p-4'>
        <CardHeader className='w-[100%] rounded-xl sm:w-[250px] p-0'>
          <CardTitle className='space-y-2 w-full'>{fullName}</CardTitle>
          <CardDescription className='h-4 w-[70%]'>
            {car.category.name}
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          <Image
            src={`${car.avatar_source}`}
            width={isMobile ? 400 : 250}
            height={isMobile ? 200 : 150}
            alt='car'
            loading='lazy'
            className='rounded-lg'
          />
        </CardContent>
        <CardFooter className='flex justify-between p-0'>
          <p>{car.price}</p>
        </CardFooter>
      </Card>
    </Link>
  )
}

export default CarCard
