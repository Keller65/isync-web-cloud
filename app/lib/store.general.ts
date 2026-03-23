import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SettingsState {
  biometricEnabled: boolean
  pushEnabled: boolean
  soundEnabled: boolean
  showTraffic: boolean
  productsWithImage: boolean
  mapStyle: 'color' | 'minimalista'
  setBiometricEnabled: (val: boolean) => void
  setPushEnabled: (val: boolean) => void
  setSoundEnabled: (val: boolean) => void
  setShowTraffic: (val: boolean) => void
  setProductsWithImage: (val: boolean) => void
  setMapStyle: (val: 'color' | 'minimalista') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      biometricEnabled: false,
      pushEnabled: true,
      soundEnabled: true,
      showTraffic: false,
      productsWithImage: false,
      mapStyle: 'color',
      setBiometricEnabled: (val) => set({ biometricEnabled: val }),
      setPushEnabled: (val) => set({ pushEnabled: val }),
      setSoundEnabled: (val) => set({ soundEnabled: val }),
      setShowTraffic: (val) => set({ showTraffic: val }),
      setProductsWithImage: (val) => set({ productsWithImage: val }),
      setMapStyle: (val) => set({ mapStyle: val }),
    }),
    {
      name: 'settings-storage',
    }
  )
)
