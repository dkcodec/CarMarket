import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FiltersState {
  brand: string | null
  model: string | null
  generation: string | null
  price_start: number
  price_end: number

  setBrand: (val: string | null) => void
  setModel: (val: string | null) => void
  setGeneration: (val: string | null) => void
  setPriceRange: (min: number, max: number) => void
  resetFilters: () => void
}

export const useFiltersStore = create(
  persist<FiltersState>(
    (set) => ({
      brand: null,
      model: null,
      generation: null,
      price_start: 0,
      price_end: 100000,

      setBrand: (val) => set({ brand: val }),
      setModel: (val) => set({ model: val }),
      setGeneration: (val) => set({ generation: val }),
      setPriceRange: (min, max) => set({ price_start: min, price_end: max }),

      resetFilters: () =>
        set({
          brand: null,
          model: null,
          generation: null,
          price_start: 0,
          price_end: 100000,
        }),
    }),
    {
      name: 'filters-storage',
    }
  )
)
