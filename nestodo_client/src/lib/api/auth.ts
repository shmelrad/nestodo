import { User } from '@/types/user';
import { BaseApi } from './base'

interface LoginRequestDto {
  username: string
  password: string
}

interface RegisterRequestDto {
  email: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string
}

class AuthApi extends BaseApi {
  constructor() {
    super('/api/auth')
  }

  login(data: LoginRequestDto): Promise<LoginResponse> {
    return this.post<LoginResponse>('/login', data)
  }

  register(data: RegisterRequestDto): Promise<LoginResponse> {
    return this.post<LoginResponse>('/register', data)
  }

  getProfile(): Promise<User> {
    return this.get<User>('/profile', { auth: true })
  }
}

export const authApi = new AuthApi() 