import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerType, CustomerAddress } from '@/types/customers';

interface CustomerState {
  selectedCustomer: CustomerType | null;
  addresses: CustomerAddress[];
  selectedAddress: CustomerAddress | null;
  hostUrl: string;
  cloudflareUrl: string;
  sellerDifferent: boolean;
  selectedSlpCode: number | null;
  setSelectedCustomer: (customer: CustomerType | null) => void;
  setAddresses: (addresses: CustomerAddress[]) => void;
  setSelectedAddress: (address: CustomerAddress | null) => void;
  setUrls: (hostUrl: string, cloudflareUrl: string) => void;
  setSellerDifferent: (different: boolean) => void;
  setSelectedSlpCode: (slpCode: number | null) => void;
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
      sellerDifferent: false,
      selectedSlpCode: null,
      setSelectedCustomer: (customer) => set({
        selectedCustomer: customer,
        addresses: [],
        selectedAddress: null
      }),
      setAddresses: (addresses) => set({ addresses }),
      setSelectedAddress: (address) => set({ selectedAddress: address }),
      setUrls: (hostUrl, cloudflareUrl) => set({ hostUrl, cloudflareUrl }),
      setSellerDifferent: (different) => set({ sellerDifferent: different }),
      setSelectedSlpCode: (slpCode) => set({ selectedSlpCode: slpCode }),
      clearSelectedCustomer: () => set({
        selectedCustomer: null,
        addresses: [],
        selectedAddress: null,
        sellerDifferent: false,
        selectedSlpCode: null
      }),
    }),

    {
      name: 'customer-storage',

    }
  )
)