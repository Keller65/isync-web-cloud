import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CustomerType } from '@/types/customers';

interface CustomerState {
  selectedCustomer: CustomerType | null;
  hostUrl: string;
  cloudflareUrl: string;
  setSelectedCustomer: (customer: CustomerType | null) => void;
  setUrls: (hostUrl: string, cloudflareUrl: string) => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      selectedCustomer: null,
      hostUrl: '',
      cloudflareUrl: '',
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      setUrls: (hostUrl, cloudflareUrl) => set({ hostUrl, cloudflareUrl }),
    }),
    {
      name: 'customer-storage',
    }
  )
)