export const SERVER_URL = import.meta.env.DEV
  ? 'https://localhost:3000'
  : `${window.location.protocol}//${window.location.host}`

export const AUTH_PATH = '/api/auth'
