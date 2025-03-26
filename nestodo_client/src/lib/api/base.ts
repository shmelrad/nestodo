import { useAuthStore } from '@/stores/authStore'
import { LoginResponse } from '@/lib/api/auth'
import { AUTH_PATH, SERVER_URL } from './constants'
interface RequestConfig extends RequestInit {
  auth?: boolean
  params?: Record<string, string | number>
}

export interface ApiError {
  error: string
  statusCode: number
  message: string
}

export class BaseApi {
  private baseUrl: string

  constructor(path: string) {
    this.baseUrl = SERVER_URL + path
  }

  private async fetchWithConfig(endpoint: string, config: RequestConfig = {}): Promise<Response> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (config.params) {
      Object.entries(config.params).forEach(([key, value]) =>
        url.searchParams.append(key, value.toString()),
      )
    }

    const headers: HeadersInit = {
      ...(config.auth && {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }),
      ...config.headers,
    }

    const response = await fetch(url, { ...config, headers, credentials: 'include' })

    if (response.status === 401) {
      const newToken = await this.refreshToken()
      if (newToken) {
        localStorage.setItem('token', newToken.accessToken)
        return this.fetchWithConfig(endpoint, config)
      }
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }

    return response
  }

  private async refreshToken(): Promise<LoginResponse | null> {
    const response = await fetch(`${SERVER_URL}${AUTH_PATH}/refresh`, {
      credentials: 'include',
      method: 'POST',
    })

    if (!response.ok) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      return null
    }

    return response.json() as Promise<LoginResponse>
  }

  protected async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const response = await this.fetchWithConfig(endpoint, config)
    const text = await response.text()
    const data = text ? JSON.parse(text) : undefined

    if (!response.ok) {
      throw {
        error: data?.error || 'Unknown error occurred',
        code: response.status,
        message: data?.message || 'Unknown error occurred',
      }
    }

    return data
  }

  protected get<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  protected post<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...config?.headers },
    })
  }

  protected patch<T>(endpoint: string, data?: unknown, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json', ...config?.headers },
    })
  }

  protected delete<T>(endpoint: string, config?: RequestConfig) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  protected postFile<T>(endpoint: string, data?: FormData, config?: RequestConfig) {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data,
    })
  }

  protected async getFileBlob(endpoint: string, config?: RequestConfig): Promise<Blob> {
    const response = await this.fetchWithConfig(endpoint, config)

    if (!response.ok) {
      const text = await response.text()
      const data = text ? JSON.parse(text) : undefined
      throw {
        error: data?.error || 'Unknown error occurred',
        code: response.status,
        message: data?.message || 'Unknown error occurred',
      }
    }

    return await response.blob()
  }
}
