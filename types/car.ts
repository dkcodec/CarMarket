export default interface Car {
  id: number
  category_id: number
  brand_id: number
  model_id: number
  avatar_source: string
  category: {
    id: number
    name: string
  }
  brand: {
    id: number
    name: string
  }
  model: {
    id: number
    brand_id: number
    name: string
  }
  price: string
  created_at: string
  updated_at: string
}
