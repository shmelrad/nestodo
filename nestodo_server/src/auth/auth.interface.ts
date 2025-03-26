export interface UserPayload {
  sub: number
  email: string
  username: string
}

export interface AccessToken {
  access_token: string
}

export interface RefreshToken {
  refresh_token: string
}

export interface TokensPair {
  accessToken: string
  refreshToken: string
}