// API & Auth
export const AUTH_PROVIDERS = {
  CREDENTIALS: 'credentials',
} as const

// Routes
export const ROUTES = {
  LOGIN: '/',
  DASHBOARD: '/dashboard',
  CATALOG: '/dashboard/catalog',
  ORDERS: '/dashboard/orders',
  PAYMENTS: '/dashboard/payments',
  USERS: '/dashboard/users',
  LOCATIONS: '/dashboard/locations',
  MAPS: '/dashboard/maps',
  VISITAS: '/dashboard/visitas',
  SETTINGS: '/dashboard/settings',
} as const

// Messages
export const MESSAGES = {
  ERROR_INVALID_CREDENTIALS: 'Credenciales inválidas.',
  ERROR_GENERIC: 'Algo salió mal.',
} as const
