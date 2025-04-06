import React, { useEffect, useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { useForm } from 'react-hook-form'
import { Slider } from './ui/slider'
import PriceSliderBlock from './PriceSliderBlock'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { paramsChangeMany } from '@/helpers/SearchParamsHelpers'

// Наш стор:
import { useFiltersStore } from '@/store/useFiltersStore'

interface Brand {
  name: string
  source: string
}
interface Model {
  brand_source: string
  name: string
  source: string
}
interface Generation {
  model_source: string
  name: string
  source: string
}

const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/brands`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (!res.ok) throw new Error('Failed to fetch brands')
    const json = await res.json()
    return json.data
  } catch (err) {
    console.error('Error fetching brands:', err)
    return []
  }
}

const fetchModels = async (brandSource: string): Promise<Model[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/models?brand=${brandSource}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (!res.ok) throw new Error('Failed to fetch models')
    const json = await res.json()
    return json.data
  } catch (err) {
    console.error('Error fetching models:', err)
    return []
  }
}

const fetchGenerations = async (modelSource: string): Promise<Generation[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/generations?model=${modelSource}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
    if (!res.ok) throw new Error('Failed to fetch generations')
    const json = await res.json()
    return json.data
  } catch (err) {
    console.error('Error fetching generations:', err)
    return []
  }
}

// Zod-схема
const FormSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  generation: z.string().optional(),
  price_start: z.number().optional(),
  price_end: z.number().optional(),
})

const Filters = () => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Zustand-хранилище:
  const {
    brand,
    setBrand,
    model,
    setModel,
    generation,
    setGeneration,
    price_start,
    price_end,
    setPriceRange,
  } = useFiltersStore()

  console.log('brand', brand)

  // Для списков:
  const [brands, setBrands] = useState<Brand[]>([])
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, Model[]>>(
    {}
  )
  const [generationsByModel, setGenerationsByModel] = useState<
    Record<string, Generation[]>
  >({})

  // Регистрируем форму (React Hook Form), чтобы валидировать и оформлять сабмит
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      brand: brand || undefined,
      model: model || undefined,
      generation: generation || undefined,
      price_start: price_start,
      price_end: price_end,
    },
  })

  console.log('form', form.getValues())
  console.log('brand', brand, 'model', model, 'generation', generation)
  console.log('price_start', price_start, 'price_end', price_end)

  useEffect(() => {
    // Читаем из searchParams
    const brandSearch = searchParams.get('brand')
    const modelSearch = searchParams.get('model')
    const generationSearch = searchParams.get('generation')
    const priceStartSearch = Number(searchParams.get('price_start'))
    const priceEndSearch = Number(searchParams.get('price_end'))

    // Если в query-параметрах чего-то нет — используем текущее из стор
    const finalBrand = brandSearch ?? brand
    const finalModel = modelSearch ?? model
    const finalGeneration = generationSearch ?? generation
    const finalPriceStart = priceStartSearch || price_start
    const finalPriceEnd = priceEndSearch || price_end

    // Обновляем стор на новое (либо то же самое, если ничего не изменилось)
    setBrand(finalBrand)
    setModel(finalModel)
    setGeneration(finalGeneration)
    setPriceRange(finalPriceStart, finalPriceEnd)

    console.log(
      'finalBrand',
      finalBrand,
      'finalModel',
      finalModel,
      'finalGeneration',
      finalGeneration,
      'finalPriceStart',
      finalPriceStart,
      'finalPriceEnd',
      finalPriceEnd
    )

    // Синхронизируем форму
    form.reset({
      brand: finalBrand ?? undefined,
      model: finalModel ?? undefined,
      generation: finalGeneration ?? undefined,
      price_start: finalPriceStart,
      price_end: finalPriceEnd,
    })
  }, [searchParams, brands])

  // Загружаем бренды
  useEffect(() => {
    const loadBrands = async () => {
      const brandList = await fetchBrands()
      setBrands(brandList)
    }
    loadBrands()
  }, [])

  // Загружаем модели для выбранного бренда
  useEffect(() => {
    if (!brand) return
    if (modelsByBrand[brand]) return // уже загружено
    const loadModels = async () => {
      const list = await fetchModels(brand)
      setModelsByBrand((prev) => ({ ...prev, [brand]: list }))
    }
    loadModels()
  }, [brand, modelsByBrand])

  // Загружаем поколения для выбранной модели
  useEffect(() => {
    if (!model) return
    if (generationsByModel[model]) return
    const loadGenerations = async () => {
      const list = await fetchGenerations(model)
      setGenerationsByModel((prev) => ({ ...prev, [model]: list }))
    }
    loadGenerations()
  }, [model, generationsByModel])

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const cleanData: Record<string, string> = {}

    if (data.brand) {
      cleanData.brand = data.brand

      if (data.model) {
        cleanData.model = data.model

        if (data.generation) {
          cleanData.generation = data.generation
        }
      }
    }

    if (typeof data.price_start === 'number') {
      cleanData.price_start = data.price_start.toString()
    }

    if (typeof data.price_end === 'number') {
      cleanData.price_end = data.price_end.toString()
    }

    // Сохраняем в стор
    setBrand(data.brand || null)
    setModel(data.brand ? data.model || null : null)
    setGeneration(data.model ? data.generation || null : null)
    setPriceRange(data.price_start || 0, data.price_end || 100000)

    // Обновляем параметры в URL
    paramsChangeMany({
      entries: cleanData,
      locale,
      searchParams,
      router,
      startTransition,
    })
  }

  // Следим за тем, что пользователь вводит руками / двигает слайдер:
  // Обновляем и форму (формы сам по себе это делает),
  // и стор (чтобы открыть шторку заново и увидеть актуальный стейт)
  // — Либо можно обновлять стор только при сабмите, на ваше усмотрение.

  const handleBrandChange = (value: string) => {
    form.setValue('brand', value)
    setBrand(value)

    form.setValue('model', undefined)
    setModel(null)

    form.setValue('generation', undefined)
    setGeneration(null)
  }

  const handleModelChange = (value: string) => {
    form.setValue('model', value)
    setModel(value)

    form.setValue('generation', undefined)
    setGeneration(null)
  }

  const handleGenerationChange = (value: string) => {
    form.setValue('generation', value)
    setGeneration(value)
  }

  // Слайдер цены
  const handlePriceRangeChange = (range: number[]) => {
    form.setValue('price_start', range[0])
    form.setValue('price_end', range[1])
    setPriceRange(range[0], range[1])
  }
  const handleMinInputChange = (val: number) => {
    const currentMax = form.getValues('price_end') || 100000
    form.setValue('price_start', val)
    setPriceRange(val, currentMax)
  }
  const handleMaxInputChange = (val: number) => {
    const currentMin = form.getValues('price_start') || 0
    form.setValue('price_end', val)
    setPriceRange(currentMin, val)
  }

  // Актуальные значения цены из стора (или формы)
  const currentMin = form.watch('price_start') ?? 0
  const currentMax = form.watch('price_end') ?? 100000

  return (
    <ScrollArea className='h-full'>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4 p-4'>
          {/* BRAND */}
          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('Filters.BRAND')}</FormLabel>
                <Select
                  onValueChange={handleBrandChange}
                  value={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Filters.SELECT_BRAND')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b.source} value={b.source}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* MODEL */}
          {brand && modelsByBrand[brand]?.length > 0 && (
            <FormField
              control={form.control}
              name='model'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Filters.MODEL')}</FormLabel>
                  <Select
                    onValueChange={handleModelChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Filters.SELECT_MODEL')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {modelsByBrand[brand].map((m) => (
                        <SelectItem key={m.source} value={m.source}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* GENERATION */}
          {model && generationsByModel[model]?.length > 0 && (
            <FormField
              control={form.control}
              name='generation'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Filters.GENERATION')}</FormLabel>
                  <Select
                    onValueChange={handleGenerationChange}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('Filters.SELECT_GENERATION')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {generationsByModel[model].map((gen) => (
                        <SelectItem key={gen.source} value={gen.source}>
                          {gen.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* PRICE RANGE */}
          <FormField
            control={form.control}
            name='price_start'
            render={() => (
              <FormField
                control={form.control}
                name='price_end'
                render={() => (
                  <FormItem>
                    <FormLabel>{t('Filters.PRICE_RANGE')}</FormLabel>
                    <Slider
                      min={0}
                      max={100000}
                      step={100}
                      value={[currentMin, currentMax]}
                      onValueChange={handlePriceRangeChange}
                    />

                    <div className='flex justify-center gap-3 items-center text-sm text-muted-foreground pt-2'>
                      <PriceSliderBlock
                        min={currentMin}
                        max={currentMax}
                        onChange={handleMinInputChange}
                        option='min'
                      />
                      –
                      <PriceSliderBlock
                        min={currentMin}
                        max={currentMax}
                        onChange={handleMaxInputChange}
                        option='max'
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          />

          <Button type='submit' className='fixed bottom-4'>
            {t('Filters.APPLY_FILTERS')}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  )
}

export default Filters
