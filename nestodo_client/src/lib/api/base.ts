import { useAuthStore } from "@/stores/authStore"

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
      this.baseUrl = import.meta.env.DEV 
        ? `http://localhost:3000${path}`
        : `${window.location.protocol}//${window.location.host}${path}`
    }
  
    protected async request<T>(
      endpoint: string,
      { auth = false, params, ...config }: RequestConfig = {}
    ): Promise<T> {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      if (params) {
        Object.entries(params).forEach(([key, value]) => 
          url.searchParams.append(key, value.toString())
        )
      }
  
      const headers: HeadersInit = {
        ...(auth && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
        ...config.headers,
      }
  
      const response = await fetch(url, { ...config, headers })
      const text = await response.text()
      const data = text ? JSON.parse(text) : undefined
      
      if (response.status === 401) {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }

      if (!response.ok) {
        throw { error: data?.error || 'Unknown error occurred', code: response.status, message: data?.message || 'Unknown error occurred' }
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

    protected postFile<T>(endpoint: string, data?: FormData, config?: RequestConfig) {
      return this.request<T>(endpoint, {
        ...config,
        method: 'POST',
        body: data,
      })
    }
  }