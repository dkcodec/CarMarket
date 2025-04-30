import api from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import Cookies from 'js-cookie'

interface AuthData {
  phone: string
  accessToken: string
  refreshToken: string
}

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

    if (data.data.access_token && data.data.refresh_token) {
      const authData: AuthData = {
        phone: phone_number,
        accessToken: data.data.access_token,
        refreshToken: data.data.refresh_token,
      }

      // Сохраняем токены в куки без URL-encoding
      Cookies.set('auth-storage', JSON.stringify(authData), {
        expires: 7,
        encode: false, // Отключаем URL-encoding
      })

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

    if (data.access_token && data.refresh_token) {
      const currentAuth = JSON.parse(
        Cookies.get('auth-storage') || '{}'
      ) as AuthData
      const updatedAuth: AuthData = {
        ...currentAuth,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      }

      Cookies.set('auth-storage', JSON.stringify(updatedAuth), {
        expires: 7,
        encode: false,
      })

      useAuth.getState().updateTokens(data.access_token, data.refresh_token)
    }

    return data
  }

  static logout() {
    Cookies.remove('auth-storage')
    useAuth.getState().clearAuth()
  }
}

export default AuthService
