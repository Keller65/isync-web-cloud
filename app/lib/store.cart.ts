import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  itemCode: string
  barCode: string
  quantity: number
  priceList: number        // precio base / real
  priceAfterVAT: number    // precio final con descuento aplicado
  taxCode: string
}

interface CartState {
  productsInCart: CartItem[]
  addProduct: (product: CartItem) => void
  updateQuantity: (itemCode: string, quantity: number, unitPrice: number, inStock: number) => void
  removeProduct: (itemCode: string) => void
  clearCart: () => void
  loadCartWithProducts: (products: CartItem[]) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      productsInCart: [],
      addProduct: (product) =>
        set((state) => ({
          productsInCart: [...state.productsInCart, product]
        })),
      updateQuantity: (itemCode, quantity, unitPrice) =>
        set((state) => ({
          productsInCart: state.productsInCart.map((p) =>
            p.itemCode === itemCode
              ? { ...p, quantity, unitPrice }
              : p
          ),
        })),
      removeProduct: (itemCode) =>
        set((state) => ({
          productsInCart: state.productsInCart.filter((p) => p.itemCode !== itemCode),
        })),
      clearCart: () => set({ productsInCart: [] }),
      loadCartWithProducts: (products) => set({ productsInCart: products }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
