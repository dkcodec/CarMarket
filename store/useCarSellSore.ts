import { create } from 'zustand'
import api from '@/lib/api'

// Типы данных
interface CarDetails {
  categories: any[]
  brands: any[]
  models: any[]
  cities: any[]
  colors: any[]
  bodies: any[]
  generations: any[]
}

interface CarSellState {
  // Данные формы
  formData: {
    category: string
    brand: string
    model: string
    generation: string
    city: string
    color: string
    body: string
    year: string
    mileage: string
    price: string
    engine: string
    description: string
    customs_clearance: string
    steering_wheel: string
    wheel_drive: string
    [key: string]: string | boolean
  }

  // Справочные данные
  details: CarDetails

  // Состояние загрузки
  isLoading: boolean
  error: string | null

  // Методы
  setFormData: (key: string, value: string) => void
  loadDetails: ({
    brand,
    model,
  }: {
    brand?: string
    model?: string
  }) => Promise<void>
  resetForm: () => void
}

// Создание стора
export const useCarSellStore = create<CarSellState>((set) => ({
  // Начальное состояние
  formData: {
    category: '',
    brand: '',
    model: '',
    generation: '',
    city: '',
    color: '',
    body: '',
    year: '',
    mileage: '',
    price: '',
    description: '',
    engine: '',
    customs_clearance: '',
    steering_wheel: '',
    wheel_drive: '',
  },

  details: {
    categories: [],
    brands: [],
    models: [],
    generations: [],
    cities: [],
    colors: [],
    bodies: [],
  },

  isLoading: false,
  error: null,

  // Метод обновления данных формы
  setFormData: (key, value) =>
    set((state) => ({
      formData: { ...state.formData, [key]: value },
    })),

  // Метод загрузки справочных данных
  loadDetails: async ({ brand, model }: { brand?: string; model?: string }) => {
    set({ isLoading: true, error: null })
    try {
      const [categories, brands, models, cities, colors, bodies, generations] =
        await Promise.all([
          api.get('details/categories'),
          api.get('details/brands'),
          api.get(`details/models${brand ? `?brand=${brand}` : ''}`),
          api.get('details/cities'),
          api.get('details/colors'),
          api.get('details/bodies'),
          api.get(`details/generations${model ? `?model=${model}` : ''}`),
        ])

      set({
        details: {
          categories: categories.data,
          brands: brands.data,
          models: models.data,
          cities: cities.data,
          colors: colors.data,
          bodies: bodies.data,
          generations: generations.data,
        },
        isLoading: false,
      })
    } catch (error) {
      set({
        error: 'Ошибка при загрузке данных',
        isLoading: false,
      })
    }
  },

  // Метод сброса формы
  resetForm: () =>
    set({
      formData: {
        category: '',
        brand: '',
        model: '',
        city: '',
        color: '',
        body: '',
        year: '',
        mileage: '',
        price: '',
        description: '',
        generation: '',
        engine: '',
        customs_clearance: '',
        steering_wheel: '',
        wheel_drive: '',
      },
    }),
}))
