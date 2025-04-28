export interface Filters {
  brand: string
  model: string
  generation: string
  price_start: number
  price_end: number
}

export interface Query {
  city: string
  limit: string
  offset: string
  model: string
  brand: string
  generation: string
  price_start: string
  price_end: string
}
