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
import Cookies from 'js-cookie'

interface CarCardProps {
  car: Car
}

const CarCard: React.FC<CarCardProps> = (props) => {
  const { car } = props
  const fullName = car.brand.name + ' ' + car?.model?.name
  const s3Token = Cookies.get('s3Token')

  return (
    <Card className='flex flex-col space-y-3 w-full sm:w-auto'>
      <CardHeader className='w-[100%] rounded-xl sm:w-[250px]'>
        <CardTitle className='space-y-2 w-full p-3'>{fullName}</CardTitle>
        <CardDescription className='h-4 w-[70%]'>
          {car.category.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Image
          src={`${car.avatar_source}?Authorization=${s3Token}`}
          width={100}
          height={100}
          alt='car'
          loading='lazy'
          className='rounded-lg'
        />
        <p>{car.price}</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <div className=''></div>
      </CardFooter>
    </Card>
  )
}

export default CarCard
