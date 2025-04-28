import api from '@/lib/api'

class CarService {
  static async getCars(params: any) {
    const response = await api.get(`/cars/main?${new URLSearchParams(params)}`)
    return response.json()
  }

  static async getCarById(id: string) {
    const response = await api.get(`/api/cars/${id}`)
    return response.json()
  }

  // Другие методы для работы с автомобилями
}

export default CarService
