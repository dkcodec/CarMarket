import { getFromLocalStorage } from '@/helpers/localStorageHelper'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

class CarService {
  static async getCars(params: any) {
    const response = await api.get(`/cars/main?${new URLSearchParams(params)}`)
    return response
  }

  static async getCarById(id: string) {
    const response = await api.get(`/api/cars/${id}`)
    return response
  }

  static async getCarBySearch(search: string) {
    const response = await api.get(`/cars/search?q=${search}`)
    return response
  }

  static async createCar(data: any) {
    console.log('data', data)
    const phone = useAuth.getState().phone

    const formattedData = {
      category_source: data.category,
      brand_source: data.brand,
      model_source: data.model,
      generation_source: data.generation,
      color_source: data.color,
      city_source: data.city,
      body_source: data.body,

      mileage: data.mileage,
      price: data.price,
      engine_volume: data.engine,
      customs_clearance: Boolean(data.customs_clearance),
      description: data.description,
      steering_wheel: data.steering_wheel,
      wheel_drive: data.wheel_drive,

      phone: phone,
    }
    const response = await api.post('/cars/create', formattedData)
    return response
  }
}

export default CarService
