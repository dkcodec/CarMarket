import { notFound } from 'next/navigation'
import { CarPreview } from '@/components/car/CarPreview'
import CarService from '@/services/carService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'

export default async function CarPage(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  const t = await getTranslations('SellCar')
  const car = await CarService.getCarById(id)

  if (!car) {
    notFound()
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-2xl font-bold mb-4'>
        {car.data?.body?.name || ''} {car.data?.brand?.name || ''}
        {car.data?.model?.name || ''} {car.data?.year || ''}
      </h1>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Левая колонка - изображения и описание */}
        <div className='space-y-6'>
          {car.data?.images?.length > 0 && <CarPreview car={car.data} />}

          <Card>
            <CardHeader>
              <CardTitle>{t('description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>{car.data.description}</p>
            </CardContent>
          </Card>
        </div>

        {/* Правая колонка - характеристики */}
        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>{t('characteristics')}</span>
                <Badge variant='secondary' className='text-lg'>
                  {formatPrice(car.data.price)} $
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('brand')}</p>
                  <p className='font-medium'>{car.data.brand.name}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('model')}</p>
                  <p className='font-medium'>{car.data.body.name}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('year')}</p>
                  <p className='font-medium'>{car.data.year}</p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('mileage')}
                  </p>
                  <p className='font-medium'>{car.data.mileage} км</p>
                </div>
              </div>

              <Separator />

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('engine')}</p>
                  <p className='font-medium'>
                    {car.data.engine?.name || t('notSelected')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>
                    {t('transmission')}
                  </p>
                  <p className='font-medium'>
                    {car.data.transmission?.name || t('notSelected')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('drive')}</p>
                  <p className='font-medium'>
                    {car.data.drive?.name || t('notSelected')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('color')}</p>
                  <p className='font-medium'>
                    {car.data.color?.name || t('notSelected')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('additional_information')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('vin')}</p>
                  <p className='font-medium'>
                    {car.data.vin || t('notSelected')}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>{t('number')}</p>
                  <p className='font-medium'>
                    {car.data.number || t('notSelected')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
