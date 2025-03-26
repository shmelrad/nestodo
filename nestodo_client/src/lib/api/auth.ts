import { JwtUser } from '@/types/jwtUser'
import { BaseApi } from './base'
import { AUTH_PATH } from './constants'
interface LoginRequestDto {
  username: string
  password: string
}

interface RegisterRequestDto {
  email: string
  username: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

class AuthApi extends BaseApi {
  constructor() {
    super(AUTH_PATH)
  }

  login(data: LoginRequestDto): Promise<LoginResponse> {
    return this.post<LoginResponse>('/login', data)
  }

  register(data: RegisterRequestDto): Promise<LoginResponse> {
    return this.post<LoginResponse>('/register', data)
  }

  getProfile(): Promise<JwtUser> {
    return this.get<JwtUser>('/profile', { auth: true })
  }

  logout(): Promise<{ message: string }> {
    return this.post<{ message: string }>('/logout')
  }
}

export const authApi = new AuthApi()
