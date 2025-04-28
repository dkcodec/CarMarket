import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'

interface AuthState {
  isAuthenticated: boolean
  phone: string | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (phone: string, accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  updateTokens: (accessToken: string, refreshToken: string) => void
  isTokenExpired: () => boolean
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      phone: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (phone, accessToken, refreshToken) =>
        set({
          isAuthenticated: true,
          phone,
          accessToken,
          refreshToken,
        }),
      clearAuth: () =>
        set({
          isAuthenticated: false,
          phone: null,
          accessToken: null,
          refreshToken: null,
        }),
      updateTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),
      isTokenExpired: () => {
        const { accessToken } = get()
        if (!accessToken) return true

        try {
          const decodedToken = jwtDecode(accessToken) as { exp: number }
          const currentTime = Date.now() / 1000
          return decodedToken.exp < currentTime
        } catch (error) {
          return true
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
