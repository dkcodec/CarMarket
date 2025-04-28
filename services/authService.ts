import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

class AuthService {
  static async requestCode(phone_number: string) {
    const response = await api.post('/auth/request_code', { phone_number })
    return response.json()
  }

  static async verifyCode(phone_number: string, code: string) {
    const response = await api.post('/auth/verify_code', { phone_number, code })
    console.log(response)
    const data = await response.json()
    console.log(data)

    // Если аутентификация успешна, сохраняем токены
    if (data.access_token && data.refresh_token) {
      useAuth
        .getState()
        .setAuth(phone_number, data.access_token, data.refresh_token)
    }

    return data
  }

  static async refreshToken() {
    const { refreshToken } = useAuth.getState()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    })
    const data = await response.json()
    console.log(data.access_token, data.refresh_token)

    // Обновляем токены в хранилище
    if (data.access_token && data.refresh_token) {
      useAuth.getState().updateTokens(data.access_token, data.refresh_token)
    }

    return data
  }

  static logout() {
    useAuth.getState().clearAuth()
  }
}

export default AuthService
