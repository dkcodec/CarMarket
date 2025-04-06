import React, { FormEvent, useEffect, useTransition } from 'react'
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

// Импорт нашего zustand-хранилища:
import { useFiltersStore } from '@/store/useFiltersStore'

// Типы
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

// Фетчим списки (бренды, модели, поколения)
const fetchBrands = async (): Promise<Brand[]> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/brands`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
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
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Читаем нужные значения и сеттеры из zustand:
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

  // Для списков:
  const [brands, setBrands] = React.useState<Brand[]>([])
  const [modelsByBrand, setModelsByBrand] = React.useState<
    Record<string, Model[]>
  >({})
  const [generationsByModel, setGenerationsByModel] = React.useState<
    Record<string, Generation[]>
  >({})

  // Инициализируем нашу форму через react-hook-form:
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

  useEffect(() => {
    if (
      brand ||
      model ||
      generation ||
      price_start !== 0 ||
      price_end !== 100000
    ) {
      return
    }
    const brandFromParams = searchParams.get('brand')
    const modelFromParams = searchParams.get('model')
    const generationFromParams = searchParams.get('generation')
    const priceStartFromParams = Number(searchParams.get('price_start') || 0)
    const priceEndFromParams = Number(searchParams.get('price_end') || 100000)

    setBrand(brandFromParams || null)
    setModel(modelFromParams || null)
    setGeneration(generationFromParams || null)
    setPriceRange(priceStartFromParams, priceEndFromParams)
  }, [])

  // Подгружаем бренды
  useEffect(() => {
    const loadBrands = async () => {
      const brandList = await fetchBrands()
      setBrands(brandList)
    }
    loadBrands()
  }, [])

  // Если выбрана другая марка – подгружаем модели для неё (если ещё не подгрузили)
  useEffect(() => {
    if (!brand) return
    if (modelsByBrand[brand]) return // уже загружено
    const loadModels = async () => {
      const list = await fetchModels(brand)
      setModelsByBrand((prev) => ({ ...prev, [brand]: list }))
    }
    loadModels()
  }, [brand, modelsByBrand])

  // Если выбранa другая модель – подгружаем поколения для неё (если ещё не подгрузили)
  useEffect(() => {
    if (!model) return
    if (generationsByModel[model]) return
    const loadGenerations = async () => {
      const list = await fetchGenerations(model)
      setGenerationsByModel((prev) => ({ ...prev, [model]: list }))
    }
    loadGenerations()
  }, [model, generationsByModel])

  // Обработка сабмита – отправляем в query и параллельно пишем в zustand
  function onSubmit(data: z.infer<typeof FormSchema>) {
    // всё что number – переводим в строку для query
    const entries = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        typeof value === 'number' ? value.toString() : value,
      ])
    )

    // Обновляем zustand (если форма поменяла что-то)
    setBrand(data.brand || null)
    setModel(data.model || null)
    setGeneration(data.generation || null)
    setPriceRange(data.price_start || 0, data.price_end || 100000)

    // И меняем query-параметры так же, как у вас было
    paramsChangeMany({ entries, locale, searchParams, router, startTransition })
  }

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
                  onValueChange={(value) => {
                    field.onChange(value)
                    setBrand(value)
                    // При смене бренда – сбрасываем модель и поколение
                    setModel(null)
                    setGeneration(null)
                    form.setValue('model', undefined)
                    form.setValue('generation', undefined)
                  }}
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
                    onValueChange={(value) => {
                      field.onChange(value)
                      setModel(value)
                      // При смене модели – сбрасываем поколение
                      setGeneration(null)
                      form.setValue('generation', undefined)
                    }}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Filters.SELECT_MODEL')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(modelsByBrand[brand] || []).map((m) => (
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
                    onValueChange={field.onChange}
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
                      {(generationsByModel[model] || []).map((gen) => (
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
            render={({ field: minField }) => (
              <FormField
                control={form.control}
                name='price_end'
                render={({ field: maxField }) => {
                  // Следим за изменением range на слайдере
                  const handleRangeChange = (range: number[]) => {
                    setPriceRange(range[0], range[1])
                    minField.onChange(range[0])
                    maxField.onChange(range[1])
                  }

                  // При ручном вводе в инпут
                  const handleMinInputChange = (val: number) => {
                    setPriceRange(val, price_end)
                    minField.onChange(val)
                  }
                  const handleMaxInputChange = (val: number) => {
                    setPriceRange(price_start, val)
                    maxField.onChange(val)
                  }

                  return (
                    <FormItem>
                      <FormLabel>{t('Filters.PRICE_RANGE')}</FormLabel>
                      <Slider
                        min={0}
                        max={100000}
                        step={500}
                        value={[price_start, price_end]}
                        onValueChange={handleRangeChange}
                      />

                      <div className='flex justify-center gap-3 items-center text-sm text-muted-foreground pt-2'>
                        <PriceSliderBlock
                          min={price_start}
                          max={price_end}
                          onChange={handleMinInputChange}
                          option='min'
                        />
                        –
                        <PriceSliderBlock
                          min={price_start}
                          max={price_end}
                          onChange={handleMaxInputChange}
                          option='max'
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )
                }}
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
