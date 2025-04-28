import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

class AuthService {
  static async requestCode(phone_number: string) {
    const response = await api.post('/auth/request_code', { phone_number })
    return response.json()
  }

  static async verifyCode(phone_number: string, code: string) {
    const response = await api.post('/auth/verify_code', { phone_number, code })

    if (!response.ok) {
      throw new Error('Verification failed')
    }

    const data = await response.json()
    console.log('Auth response:', data)

    if (data.data.access_token && data.data.refresh_token) {
      useAuth
        .getState()
        .setAuth(phone_number, data.data.access_token, data.data.refresh_token)
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
