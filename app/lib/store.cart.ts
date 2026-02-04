import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types/products'

interface CartItem extends Product {
  quantity: number
  unitPrice: number
}

interface CartState {
  productsInCart: CartItem[]
  addProduct: (product: CartItem) => void
  updateQuantity: (itemCode: string, quantity: number, unitPrice: number, inStock: number) => void
  removeProduct: (itemCode: string) => void
  clearCart: () => void
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
    }),
    {
      name: 'cart-storage',
    }
  )
)
