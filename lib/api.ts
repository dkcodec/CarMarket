import { useAuth } from '@/hooks/useAuth'

// Типы для интерцепторов
type RequestInterceptor = (
  config: RequestConfig
) => Promise<RequestConfig> | RequestConfig
type ResponseInterceptor = (response: Response) => Promise<Response> | Response
type ErrorInterceptor = (error: Error) => Promise<Response> | never

// Конфигурация запроса
interface RequestConfig extends RequestInit {
  url: string
  _retry?: boolean
}

// Расширенный тип ошибки для хранения конфигурации запроса
interface ApiError extends Error {
  config?: RequestConfig
  response?: Response
}

// Интерфейс для очереди запросов
interface QueueItem {
  resolve: (value: Response) => void
  reject: (reason?: any) => void
  config: RequestConfig
}

// Класс API клиента
class ApiClient {
  private baseURL: string
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []
  private isRefreshing = false
  private failedQueue: QueueItem[] = []

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  // Добавление интерцептора запроса
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  // Добавление интерцептора ответа
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  // Добавление интерцептора ошибки
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  // Обработка очереди запросов
  processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach((item) => {
      if (error) {
        item.reject(error)
      } else if (token) {
        // Обновляем заголовок авторизации с новым токеном
        const config = { ...item.config }
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        }
        // Повторяем запрос
        this.request(config).then(item.resolve).catch(item.reject)
      }
    })
    this.failedQueue = []
  }

  // Основной метод для выполнения запросов
  async request(config: RequestConfig): Promise<Response> {
    // Применяем интерцепторы запроса
    for (const interceptor of this.requestInterceptors) {
      config = await interceptor(config)
    }

    // Формируем URL
    const url = config.url.startsWith('http')
      ? config.url
      : `${this.baseURL}${
          config.url.startsWith('/') ? config.url : `/${config.url}`
        }`

    try {
      // Выполняем запрос
      let response = await fetch(url, config)

      // Применяем интерцепторы ответа
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response)
      }

      return response
    } catch (error) {
      // Применяем интерцепторы ошибки
      for (const interceptor of this.errorInterceptors) {
        try {
          return await interceptor(error as Error)
        } catch (interceptorError) {
          error = interceptorError
        }
      }
      throw error
    }
  }

  // Методы для удобства использования
  async get(
    url: string,
    config: Omit<RequestConfig, 'url' | 'method'> = {}
  ): Promise<Response> {
    return this.request({ ...config, url, method: 'GET' })
  }

  async post(
    url: string,
    data?: any,
    config: Omit<RequestConfig, 'url' | 'method' | 'body'> = {}
  ): Promise<Response> {
    return this.request({
      ...config,
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(
    url: string,
    data?: any,
    config: Omit<RequestConfig, 'url' | 'method' | 'body'> = {}
  ): Promise<Response> {
    return this.request({
      ...config,
      url,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(
    url: string,
    config: Omit<RequestConfig, 'url' | 'method'> = {}
  ): Promise<Response> {
    return this.request({ ...config, url, method: 'DELETE' })
  }

  // Метод для обновления токена
  async refreshToken(): Promise<{
    access_token: string
    refresh_token: string
  }> {
    const { refreshToken } = useAuth.getState()

    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }

    return response.json()
  }

  // Метод для добавления запроса в очередь
  addToQueue(config: RequestConfig): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.failedQueue.push({ resolve, reject, config })
    })
  }

  // Геттер для проверки, идет ли обновление токена
  get isTokenRefreshing(): boolean {
    return this.isRefreshing
  }

  // Сеттер для установки флага обновления токена
  set isTokenRefreshing(value: boolean) {
    this.isRefreshing = value
  }
}

// Создаем экземпляр API клиента
const api = new ApiClient(process.env.NEXT_PUBLIC_API_URL || '')

// Добавляем интерцептор для добавления токена к запросам
api.addRequestInterceptor(async (config) => {
  const { accessToken } = useAuth.getState()
  if (accessToken) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${accessToken}`,
    }
  }
  return config
})

// Добавляем интерцептор для обработки ошибок и обновления токена
api.addErrorInterceptor(async (error) => {
  if (error instanceof Response && error.status === 401) {
    const apiError = error as ApiError
    const config = apiError.config || { url: '' }

    if (!config._retry && !config.url.includes('/auth/refresh')) {
      if (api.isTokenRefreshing) {
        return api.addToQueue(config)
      }

      config._retry = true
      api.isTokenRefreshing = true

      try {
        const { access_token, refresh_token } = await api.refreshToken()
        useAuth.getState().updateTokens(access_token, refresh_token)
        api.processQueue(null, access_token)

        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${access_token}`,
        }
        return api.request(config)
      } catch (refreshError) {
        api.processQueue(refreshError as Error, null)
        useAuth.getState().clearAuth()
        throw refreshError
      } finally {
        api.isTokenRefreshing = false
      }
    }
  }

  throw error
})

export default api
