import { create } from 'zustand'

interface AuthState {
  token: string | null
  salesPersonCode: number | null
  fullName: string | null
  isAuthenticated: boolean
  setAuth: (data: { token: string; salesPersonCode: number; fullName: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  salesPersonCode: null,
  fullName: null,
  isAuthenticated: false,
  setAuth: (data) => set({ 
    token: data.token, 
    salesPersonCode: data.salesPersonCode, 
    fullName: data.fullName,
    isAuthenticated: true 
  }),
  logout: () => set({ 
    token: null, 
    salesPersonCode: null, 
    fullName: null, 
    isAuthenticated: false 
  }),
}))
