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

interface CarCardProps {
  car: Car
}

const CarCard: React.FC<CarCardProps> = (props) => {
  const { car } = props
  const fullName = car.brand.name + ' ' + car.model.name

  return (
    <Card>
      <CardHeader>
        <CardTitle>{fullName}</CardTitle>
        <CardDescription>{car.category.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <Image src={car.avatar_source} alt={fullName} fill />
        <p>{car.price}</p>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <div className=''></div>
      </CardFooter>
    </Card>
  )
}

export default CarCard
