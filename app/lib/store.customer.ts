import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerType, CustomerAddress } from '@/types/customers';

interface CustomerState {
  selectedCustomer: CustomerType | null;
  addresses: CustomerAddress[];
  selectedAddress: CustomerAddress | null;
  hostUrl: string;
  cloudflareUrl: string;
  setSelectedCustomer: (customer: CustomerType | null) => void;
  setAddresses: (addresses: CustomerAddress[]) => void;
  setSelectedAddress: (address: CustomerAddress | null) => void;
  setUrls: (hostUrl: string, cloudflareUrl: string) => void;
  clearSelectedCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set) => ({
      selectedCustomer: null,
      addresses: [],
      selectedAddress: null,
      hostUrl: '',
      cloudflareUrl: '',
      setSelectedCustomer: (customer) => set({
        selectedCustomer: customer,
        addresses: [],
        selectedAddress: null
      }),
      setAddresses: (addresses) => set({ addresses }),
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setUrls: (hostUrl, cloudflareUrl) => set({ hostUrl, cloudflareUrl }),
      clearSelectedCustomer: () => set({
        selectedCustomer: null,
        addresses: [],
        selectedAddress: null
      }),
    }),

    {
      name: 'customer-storage',

    }
  )
)