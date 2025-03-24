import { create } from 'zustand'
import { jwtDecode } from 'jwt-decode'
import { JwtUser } from '@/types/jwtUser'

interface AuthState {
  token: string | null
  user: JwtUser | null
  login: (token: string) => void
  logout: () => void
  updateUser: (user: JwtUser) => void
}

interface DecodedUser {
  sub: string
  email: string
  username: string
}

const decodeUser = (token: string) => {
  const userInfo = jwtDecode<DecodedUser>(token)
  return {
    id: parseInt(userInfo.sub),
    email: userInfo.email,
    username: userInfo.username,
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token')
  const user = token ? decodeUser(token) : null

  return {
    token,
    user,
    login: (token) => {
      localStorage.setItem('token', token)
      const user = decodeUser(token)
      set({ token, user })
    },
    updateUser: (user) => {
      set({ user })
    },
    logout: () => {
      localStorage.removeItem('token')
      set({ token: null, user: null })
    },
  }
})
