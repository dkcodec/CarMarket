import React, { useEffect, useRef, useState, useTransition } from 'react'
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

// Zod-схема
const FormSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  generation: z.string().optional(),
  price_start: z.number().optional(),
  price_end: z.number().optional(),
})

async function fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/brands`,
      {
        headers: { 'Content-Type': 'application/json' },
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

async function fetchModels(brandSource: string): Promise<Model[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/models?brand=${brandSource}`,
      {
        headers: { 'Content-Type': 'application/json' },
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

async function fetchGenerations(modelSource: string): Promise<Generation[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/details/generations?model=${modelSource}`,
      {
        headers: { 'Content-Type': 'application/json' },
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

const Filters = () => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Флаг, чтобы не «дергать» повторно reset
  const didInitRef = useRef(false)

  // Zustand‐хранилище:
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

  // Данные для селектов
  const [brands, setBrands] = useState<Brand[]>([])
  const [modelsByBrand, setModelsByBrand] = useState<Record<string, Model[]>>(
    {}
  )
  const [generationsByModel, setGenerationsByModel] = useState<
    Record<string, Generation[]>
  >({})

  // Форма
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      brand: brand ?? undefined,
      model: model ?? undefined,
      generation: generation ?? undefined,
      price_start: price_start,
      price_end: price_end,
    },
  })

  // ---------------------------------------------------------
  // 1) Инициализация из URL, но только когда все нужные данные загружены
  // ---------------------------------------------------------
  useEffect(() => {
    // Не перезапускать, если уже инициализировали однажды
    if (didInitRef.current) return

    // Если бренды не загружены — ещё рано
    if (!brands.length) return

    const brandSearch = searchParams.get('brand') ?? null
    const modelSearch = searchParams.get('model') ?? null
    const generationSearch = searchParams.get('generation') ?? null

    const priceStartSearch = Number(searchParams.get('price_start')) || 0
    const priceEndSearch = Number(searchParams.get('price_end')) || 100000

    // Проверяем, есть ли brandSearch среди загруженных брендов
    const brandExists = brandSearch
      ? brands.some((b) => b.source === brandSearch)
      : false

    // Если brandSearch валиден и modelsByBrand[brandSearch] еще не подгружен — подождем следующий рендер
    if (brandSearch && !modelsByBrand[brandSearch]) return

    // Аналогично для modelSearch
    let modelExists = false
    if (brandSearch && brandExists && modelSearch) {
      const models = modelsByBrand[brandSearch] || []
      modelExists = models.some((m) => m.source === modelSearch)
      // если models для brandSearch не загружены, выше уже return
    }

    // Аналогично для generationSearch
    let generationExists = false
    if (modelExists && generationSearch && generationsByModel[modelSearch!]) {
      const gens = generationsByModel[modelSearch!] || []
      generationExists = gens.some((g) => g.source === generationSearch)
    }

    // Теперь мы можем «инициализировать»
    // (даже если brandSearch = null, всё окей — сбросим поля)
    setBrand(brandExists ? brandSearch : null)
    setModel(modelExists ? modelSearch : null)
    setGeneration(generationExists ? generationSearch : null)
    setPriceRange(priceStartSearch, priceEndSearch)

    // Сбрасываем форму
    form.reset({
      brand: brandExists ? brandSearch || undefined : undefined,
      model: modelExists ? modelSearch || undefined : undefined,
      generation: generationExists ? generationSearch || undefined : undefined,
      price_start: priceStartSearch,
      price_end: priceEndSearch,
    })

    // Запрещаем повторную инициализацию
    didInitRef.current = true
  }, [
    // Пришли новые параметры (или первая загрузка)
    searchParams,
    // Пришли бренды
    brands,
    // Если модели/поколения для соответствующих brand/model всё ещё не загружены — не сможем проверить.
    modelsByBrand,
    generationsByModel,
    // Форма/стор не нужны в зависимостях
  ])

  // ---------------------------------------------------------
  // 2) Загрузка данных (бренды, модели, поколения)
  // ---------------------------------------------------------
  // Бренды
  useEffect(() => {
    const loadBrands = async () => {
      const brandList = await fetchBrands()
      setBrands(brandList)
    }
    loadBrands()
  }, [])

  // Модели (подгружаются при смене brand, если ещё не кешированы)
  useEffect(() => {
    if (!brand) return
    if (modelsByBrand[brand]) return // уже в кэше

    fetchModels(brand).then((list) => {
      setModelsByBrand((prev) => ({ ...prev, [brand]: list }))
    })
  }, [brand, modelsByBrand])

  // Поколения (подгружаются при смене model, если не кешированы)
  useEffect(() => {
    if (!model) return
    if (generationsByModel[model]) return // уже в кэше

    fetchGenerations(model).then((list) => {
      setGenerationsByModel((prev) => ({ ...prev, [model]: list }))
    })
  }, [model, generationsByModel])

  // ---------------------------------------------------------
  // 3) Сабмит: чистим «мусор» и пишем валидные данные
  // ---------------------------------------------------------
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // Сформируем объект для URL
    const cleanData: Record<string, string> = {}

    // Проверим валидность model / generation для текущего brand
    const possibleModels = data.brand ? modelsByBrand[data.brand] || [] : []
    const modelValid = possibleModels.some((m) => m.source === data.model)

    const possibleGenerations = modelValid
      ? generationsByModel[data.model || ''] || []
      : []
    const generationValid = possibleGenerations.some(
      (g) => g.source === data.generation
    )

    // brand
    if (data.brand) {
      cleanData.brand = data.brand || ''
    }
    // model (только если подходит под brand)
    if (modelValid) {
      cleanData.model = data.model || ''
    }
    // generation (только если подходит под model)
    if (generationValid) {
      cleanData.generation = data.generation || ''
    }

    // price
    if (typeof data.price_start === 'number') {
      cleanData.price_start = data.price_start.toString()
    }
    if (typeof data.price_end === 'number') {
      cleanData.price_end = data.price_end.toString()
    }

    // Обновляем Zustand
    setBrand(data.brand || null)
    setModel(modelValid ? data.model || null : null)
    setGeneration(generationValid ? data.generation || null : null)
    setPriceRange(data.price_start || 0, data.price_end || 100000)

    didInitRef.current = false

    // Обновляем URL
    paramsChangeMany({
      entries: cleanData,
      locale,
      searchParams,
      router,
      startTransition,
    })
  }

  // ---------------------------------------------------------
  // 4) Хендлеры: при смене brand/model — сбрасываем «дочерние» поля в форме и стор
  // ---------------------------------------------------------
  const handleBrandChange = (value: string) => {
    // Обновляем форму и стор
    form.setValue('brand', value)
    setBrand(value)

    // Сбрасываем модель/поколение
    form.setValue('model', undefined)
    setModel(null)

    form.setValue('generation', undefined)
    setGeneration(null)

    // Сбрасываем кэш моделей/поколений (если хочешь)
    setModelsByBrand({})
    setGenerationsByModel({})
  }

  const handleModelChange = (value: string) => {
    form.setValue('model', value)
    setModel(value)

    form.setValue('generation', undefined)
    setGeneration(null)

    setGenerationsByModel({})
  }

  const handleGenerationChange = (value: string) => {
    form.setValue('generation', value)
    setGeneration(value)
  }

  // ---------------------------------------------------------
  // 5) Слайдер цены (это уже было)
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // 6) Текущее значение слайдера (цена) — либо из формы, либо дефолт
  // ---------------------------------------------------------
  const currentMin = form.watch('price_start') ?? 0
  const currentMax = form.watch('price_end') ?? 100000

  // ---------------------------------------------------------
  // РЕНДЕР
  // ---------------------------------------------------------
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

          {/* КНОПКА ПОДТВЕРЖДЕНИЯ */}
          <Button type='submit' className='fixed bottom-4'>
            {t('Filters.APPLY_FILTERS')}
          </Button>
        </form>
      </Form>
    </ScrollArea>
  )
}

export default Filters
