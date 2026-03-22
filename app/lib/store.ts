import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  token: string | null
  salesPersonCode: number | null
  fullName: string | null
  u_WhsCode: string | null
  u_SerieCot: string | null
  isAuthenticated: boolean
  setAuth: (data: { token: string; salesPersonCode: number; fullName: string; u_WhsCode?: string; u_SerieCot?: string }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      salesPersonCode: null,
      fullName: null,
      u_WhsCode: null,
      u_SerieCot: null,
      isAuthenticated: false,
      setAuth: (data) => set({ 
        token: data.token, 
        salesPersonCode: data.salesPersonCode, 
        fullName: data.fullName,
        u_WhsCode: data.u_WhsCode ?? null,
        u_SerieCot: data.u_SerieCot ?? null,
        isAuthenticated: true 
      }),
      logout: () => set({ 
        token: null, 
        salesPersonCode: null, 
        fullName: null,
        u_WhsCode: null,
        u_SerieCot: null,
        isAuthenticated: false 
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
