'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCarSellStore } from '@/store/useCarSellSore'
import { InputFile } from '@/components/ui/input-file'
import { useLocale, useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import CarService from '@/services/carService'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
  category: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  generation: z.string().min(1),
  body: z.string().min(1),
  city: z.string().min(1),
  year: z.string().regex(/^\d{4}$/),
  engine: z.string().min(1),
  mileage: z.string().min(1),
  customs_clearance: z.string(),
  steering_wheel: z.string(),
  wheel_drive: z.string(),
  price: z.string().regex(/^\d+$/),
  description: z.string(),
  images: z.custom<File[]>(),
  color: z.string().min(1),
})

type FormValues = z.infer<typeof formSchema>

const fields: (keyof FormValues)[] = [
  'images',
  'category',
  'body',
  'brand',
  'model',
  'generation',
  'color',
  'city',
  'year',
  'engine',
  'mileage',
  'customs_clearance',
  'steering_wheel',
  'wheel_drive',
  'price',
  'description',
]

type PreviewImagesBlockProps = {
  form: ReturnType<typeof useForm<FormValues>>
}

function SpreadAnimatedPreviewImagesBlock({ form }: PreviewImagesBlockProps) {
  const files = form.watch('images') || []
  const [items, setItems] = useState<File[]>(files)
  const originalItemsRef = useRef<File[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const isTouchDevice =
    typeof window !== 'undefined' && 'ontouchstart' in window
  const [previews, setPreviews] = useState<string[]>([])

  // reset order when files change
  useEffect(() => {
    setItems(files)
  }, [files])

  // generate and revoke blob URLs
  useEffect(() => {
    previews.forEach(URL.revokeObjectURL)
    const urls = items.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach(URL.revokeObjectURL)
  }, [items])

  // disable scrolling/select during drag/touch
  useEffect(() => {
    if (draggingIndex !== null) {
      document.body.style.touchAction = 'none'
      document.body.style.overscrollBehavior = 'contain'
      document.body.style.userSelect = 'none'
      document.body.style.overflow = 'hidden'
      document.body.style.cursor = 'grabbing'
    } else {
      document.body.style.touchAction = ''
      document.body.style.overscrollBehavior = ''
      document.body.style.userSelect = ''
      document.body.style.overflow = ''
      document.body.style.cursor = ''
    }
  }, [draggingIndex])

  const getTouchIndex = (x: number, y: number, elements: HTMLDivElement[]) => {
    for (let i = 0; i < elements.length; i++) {
      const rect = elements[i].getBoundingClientRect()
      if (
        x >= rect.left &&
        x <= rect.right &&
        y >= rect.top &&
        y <= rect.bottom
      ) {
        return i
      }
    }
    return null
  }

  const handleDragStart = (e: any, idx: number) => {
    originalItemsRef.current = items
    setDraggingIndex(idx)
    e.dataTransfer.setData('text/plain', String(idx))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (draggingIndex == null || idx === hoveredIndex) return
    const newOrder = [...originalItemsRef.current]
    const [moved] = newOrder.splice(draggingIndex, 1)
    newOrder.splice(idx, 0, moved)
    setItems(newOrder)
    setHoveredIndex(idx)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    form.setValue('images', items, { shouldValidate: true })
    setDraggingIndex(null)
    setHoveredIndex(null)
  }

  const handleDragEnd = () => {
    if (draggingIndex !== null) {
      setItems(originalItemsRef.current)
    }
    setDraggingIndex(null)
    setHoveredIndex(null)
  }

  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    e.preventDefault()
    originalItemsRef.current = items
    setDraggingIndex(idx)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggingIndex == null) return

    const touch = e.touches[0]
    const overIndex = getTouchIndex(
      touch.clientX,
      touch.clientY,
      itemRefs.current.filter(Boolean) as HTMLDivElement[]
    )
    if (overIndex !== null && overIndex !== hoveredIndex) {
      const newOrder = [...originalItemsRef.current]
      const [moved] = newOrder.splice(draggingIndex, 1)
      newOrder.splice(overIndex, 0, moved)
      setItems(newOrder)
      setHoveredIndex(overIndex)
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    form.setValue('images', items, { shouldValidate: true })
    setDraggingIndex(null)
    setHoveredIndex(null)
  }

  return (
    <LayoutGroup>
      <motion.div layout initial={false} className='space-y-4'>
        {/* main preview */}
        {previews[0] && (
          <motion.div
            ref={(el) => {
              itemRefs.current[0] = el
            }}
            layoutId='main-preview'
            draggable={!isTouchDevice}
            onDragStart={(e) => handleDragStart(e, 0)}
            onDragOver={(e) => handleDragOver(e, 0)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, 0)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`w-full aspect-[16/9] mb-2 rounded-lg overflow-hidden shadow-lg cursor-move ${
              hoveredIndex === 0 ? 'ring-4 ring-blue-300' : ''
            }`}
            transition={{ layout: { stiffness: 200, damping: 20 } }}
          >
            <motion.img
              src={previews[0]}
              alt='main'
              layout
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className='w-full h-full object-cover'
            />
          </motion.div>
        )}

        {/* thumbnails */}
        <motion.div layout className='grid grid-cols-4 gap-2'>
          {previews.slice(1).map((url, i) => {
            const idx = i + 1
            return (
              <motion.div
                key={idx}
                ref={(el) => {
                  itemRefs.current[idx] = el
                }}
                layout
                draggable={!isTouchDevice}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onTouchStart={(e) => handleTouchStart(e, idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`w-full aspect-square rounded overflow-hidden cursor-move ${
                  hoveredIndex === idx ? 'ring-4 ring-blue-200' : ''
                }`}
                transition={{ layout: { stiffness: 200, damping: 20 } }}
              >
                <motion.img
                  src={url}
                  alt={`thumb-${i}`}
                  layout
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className='w-full h-full object-cover'
                />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </LayoutGroup>
  )
}

const PreviewBlock = ({
  form,
}: {
  form: ReturnType<typeof useForm<FormValues>>
}) => {
  const values = form.watch()
  const t = useTranslations('SellCar')

  return (
    <div className='rounded-xl border shadow p-6 space-y-4'>
      <SpreadAnimatedPreviewImagesBlock form={form} />

      <div className='grid grid-cols-2 gap-x-20 gap-y-4 text-sm'>
        {fields.map((field) =>
          field !== 'images' && field !== 'price' && field !== 'mileage' ? (
            <div key={field}>
              <div className='font-bold text-blue-500'>{t(field)}</div>
              <div>{values[field] || t('notSelected')}</div>
            </div>
          ) : (
            field !== 'images' && (
              <div key={field}>
                <div className='font-bold text-blue-500'>{t(field)}</div>
                <div>
                  {Number(values[field] || 0).toLocaleString('ru-RU') ||
                    t('notSelected')}
                  {field === 'price' && '$'}
                  {field === 'mileage' && 'km'}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  )
}

export default function SellCarAnimatedForm() {
  const { details, isLoading, loadDetails } = useCarSellStore()
  const [step, setStep] = useState(0)
  const t = useTranslations('SellCar')
  const locale = useLocale()
  const router = useRouter()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        images: [],
        category: '',
        body: '',
        brand: '',
        model: '',
        generation: '',
        color: '',
        city: '',
        year: '',
        engine: '',
        mileage: '',
        customs_clearance: '',
        steering_wheel: '',
        wheel_drive: '',
        price: '',
        description: '',
      }),
      []
    ),
  })

  useEffect(() => {
    loadDetails({})
  }, [loadDetails])

  useEffect(() => {
    if (form.watch('brand') || form.watch('model')) {
      loadDetails({
        brand: form.watch('brand'),
        model: form.watch('model'),
      })
    }
  }, [form.watch('brand'), form.watch('model'), loadDetails])

  const onNext = async () => {
    const field = fields[step]
    const isValid = await form.trigger(field)
    if (isValid) setStep((prev) => prev + 1)
  }

  const onBack = async () => {
    setStep((prev) => prev - 1)
  }

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await CarService.createCar(values)
      console.log(res)
      if (res.status === 200) {
        router.push(`/${locale}`)
        setStep(0)
        form.reset()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const renderField = () => {
    const field = fields[step]
    const t = useTranslations('SellCar')

    switch (field) {
      case 'category':
        return (
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('category')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {details?.categories?.map((cat) => (
                      <SelectItem
                        key={cat.source}
                        value={cat.source}
                        disabled={isLoading}
                      >
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'body':
        return (
          <FormField
            control={form.control}
            name='body'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('body')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectBody')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {details?.bodies?.map((body) => (
                      <SelectItem
                        key={body.source}
                        value={body.source}
                        disabled={isLoading}
                      >
                        {body.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'brand':
        return (
          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('brand')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectBrand')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent aria-disabled={isLoading}>
                    {details?.brands?.map((brand) => (
                      <SelectItem key={brand.source} value={brand.source}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'model':
        return (
          <FormField
            control={form.control}
            name='model'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('model')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectModel')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent aria-disabled={isLoading}>
                    {details?.models?.map((model) => (
                      <SelectItem key={model.source} value={model.source}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'generation':
        return (
          <FormField
            control={form.control}
            name='generation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('generation')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectGeneration')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent aria-disabled={isLoading}>
                      {details?.generations?.map((generation) => (
                        <SelectItem
                          key={generation.source}
                          value={generation.source}
                        >
                          {generation.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'color':
        return (
          <FormField
            control={form.control}
            name='color'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('color')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectColor')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent aria-disabled={isLoading}>
                      {details?.colors?.map((color) => (
                        <SelectItem key={color.source} value={color.source}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'city':
        return (
          <FormField
            control={form.control}
            name='city'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('city')}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectCity')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent aria-disabled={isLoading}>
                      {details?.cities?.map((city) => (
                        <SelectItem key={city.source} value={city.source}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'year':
        return (
          <FormField
            control={form.control}
            name='year'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('year')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('yearPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'engine':
        return (
          <FormField
            control={form.control}
            name='engine'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('engine')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enginePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'mileage':
        return (
          <FormField
            control={form.control}
            name='mileage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('mileage')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('mileagePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'customs_clearance':
        return (
          <FormField
            control={form.control}
            name='customs_clearance'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('customs_clearance')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='true' id='true' />
                      <Label htmlFor='true'>{t('yes')}</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='false' id='false' />
                      <Label htmlFor='false'>{t('no')}</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'steering_wheel':
        return (
          <FormField
            control={form.control}
            name='steering_wheel'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('steering_wheel')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='left' id='left' />
                      <Label htmlFor='left'>{t('left')}</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='right' id='right' />
                      <Label htmlFor='right'>{t('right')}</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'wheel_drive':
        return (
          <FormField
            control={form.control}
            name='wheel_drive'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('wheel_drive')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value.toString()}
                  >
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='AWD' id='AWD' />
                      <Label htmlFor='AWD'>{t('awd')}</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='FWD' id='FWD' />
                      <Label htmlFor='FWD'>{t('fwd')}</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <RadioGroupItem value='RWD' id='RWD' />
                      <Label htmlFor='RWD'>{t('rwd')}</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'price':
        return (
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('price')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('pricePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'description':
        return (
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('description')}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t('descriptionPlaceholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
      case 'images':
        return (
          <FormField
            control={form.control}
            name='images'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('images')}</FormLabel>
                <FormControl>
                  <InputFile
                    multiple
                    accept='image/*'
                    onChange={(files) => {
                      field.onChange(files)
                    }}
                    filesParent={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )
    }
  }

  return (
    <div className='grid grid-cols-1 gap-0 md:gap-10 md:grid-cols-2'>
      <div className='py-10 w-full'>
        <h1 className='text-2xl font-bold mb-6 w-full'>{t('title')}</h1>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className='space-y-6' 
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const tag = (e.target as HTMLElement).tagName
                const isTextarea = tag === 'TEXTAREA'
          
                if (!isTextarea) {
                  e.preventDefault()
                  if (step < fields.length - 1) {
                    onNext()
                  }
                }
              }
            }}
          >
            <AnimatePresence mode='wait'>
              <motion.div
                key={fields[step]}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
                {renderField()}
              </motion.div>
            </AnimatePresence>
            <div className='flex justify-end gap-4'>
              {step > 0 && (
                <Button type='button' onClick={onBack}>
                  {t('back')}
                </Button>
              )}
              {step < fields.length - 1 ? (
                <Button type='button' onClick={onNext}>
                  {t('next')}
                </Button>
              ) : (
                <Button type='submit'>{t('submit')}</Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      <div className='md:py-10 w-full'>
        <h1 className='text-2xl font-bold mb-6'>{t('preview')}</h1>
        <PreviewBlock form={form} />
      </div>
    </div>
  )
}
