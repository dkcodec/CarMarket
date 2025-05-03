import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

interface CarPreviewProps {
  car: any
}

export function CarPreview({ car }: CarPreviewProps) {
  return (
    <Card>
      <CardContent className='p-0'>
        <Carousel className='w-full'>
          <CarouselContent>
            {car?.images?.map((image: string, index: number) => (
              <CarouselItem key={index}>
                <div className='relative aspect-video'>
                  <Image
                    src={image}
                    alt={`${car.title} - фото ${index + 1}`}
                    fill
                    className='object-cover'
                    priority={index === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='left-2' />
          <CarouselNext className='right-2' />
        </Carousel>
      </CardContent>
    </Card>
  )
}
