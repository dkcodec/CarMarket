import { getFromLocalStorage } from '@/helpers/localStorageHelper'
import { useAuth } from '@/hooks/useAuth'
import api from '@/lib/api'

class CarService {
  static async getCars(params: any) {
    const response = await api.get(`/cars/main?${new URLSearchParams(params)}`)
    return response
  }

  static async getCarById(id: string) {
    const response = await api.get(`/cars/${id}`)
    return response
  }

  static async getCarBySearch(search: string) {
    const response = await api.get(`/cars/search?q=${search}`)
    return response
  }

  static async createCar(data: any) {
    const phone = useAuth.getState().phone

    const base64Images = await Promise.all(
      (data.images || []).map((file: File) => {
        return new Promise((resolve, reject) => {
          if (!(file instanceof File)) {
            reject(new Error('Invalid file format'))
            return
          }

          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            reject(new Error(`File ${file.name} is too large. Max size is 5MB`))
            return
          }

          // Check file type
          if (!file.type.startsWith('image/')) {
            reject(new Error(`File ${file.name} is not an image`))
            return
          }

          const reader = new FileReader()
          reader.onload = () => {
            const base64 = reader.result as string
            // Remove data:image/jpeg;base64, prefix
            const cleanBase64 = base64.split(',')[1]
            resolve(cleanBase64)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      })
    )

    const formattedData = {
      ...(data.category && { category_source: data.category }),
      ...(data.brand && { brand_source: data.brand }),
      ...(data.model && { model_source: data.model }),
      ...(data.generation && { generation_source: data.generation }),
      ...(data.color && { color_source: data.color }),
      ...(data.city && { city_source: data.city }),
      ...(data.body && { body_source: data.body }),

      ...(data.year && { year: data.year }),
      ...(data.mileage && { mileage: data.mileage }),
      ...(data.price && { price: data.price }),
      ...(data.engine && { engine_volume: data.engine }),
      ...(data.customs_clearance !== undefined && {
        customs_clearance: Boolean(data.customs_clearance),
      }),
      ...(data.description && { description: data.description }),
      ...(data.steering_wheel && { steering_wheel: data.steering_wheel }),
      ...(data.wheel_drive && { wheel_drive: data.wheel_drive }),

      phone: phone,
      images: base64Images,
    }
    const response = await api.post('/cars/create', formattedData)
    return response
  }
}

export default CarService
