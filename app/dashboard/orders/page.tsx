'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Loader2, RefreshCw, TrendingUp, Plus, Search, User } from 'lucide-react';
import { useAuthStore } from '@/app/lib/store';
import { useCustomerStore } from '@/app/lib/store.customer';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger, } from "@/components/ui/drawer"
import { CustomerType, CustomerResponseType } from '@/types/customers';
import { Input } from "@/components/ui/input";

interface OrderDataType {
  docEntry: number;
  docNum: number;
  cardCode: string;
  cardName: string;
  federalTaxID: string;
  address: string;
  docDate: string;
  vatSum: number;
  docTotal: number;
  comments: string;
  salesPersonCode: number;
  priceListNum: number;
  lines: any[];
}

export default function OrdersPage() {
  const router = useRouter();
  const [orderData, setOrderData] = useState<OrderDataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para Clientes (Drawer)
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const PAGE_SIZE = 20;
  const { salesPersonCode, token } = useAuthStore()
  const { setSelectedCustomer } = useCustomerStore();
  const FETCH_URL = '/api-proxy/api/Quotations/open';
  const CUSTOMERS_URL = '/api-proxy/api/Customers/by-sales-emp';

  // Debug: Log cuando cambian los valores
  useEffect(() => {
    console.log('Auth Store State:', { salesPersonCode, token });
  }, [salesPersonCode, token]);

  const fetchOrders = useCallback(async (pageToFetch: number, isRefresh = false) => {
    if (!salesPersonCode || !token) {
      console.error('Missing auth data:', { salesPersonCode, token });
      setError('Datos de autenticación no disponibles');
      return;
    }

    if ((!isRefresh && isLastPage) || isLoading) return;

    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const res = await axios.get(
        `${FETCH_URL}/${salesPersonCode}?page=${pageToFetch}&pageSize=${PAGE_SIZE}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const newOrders = res.data;
      if (isRefresh) {
        setOrderData(newOrders);
        setPage(2);
      } else {
        setOrderData((prev) => [...prev, ...newOrders]);
        setPage(pageToFetch + 1);
      }

      setIsLastPage(newOrders.length < PAGE_SIZE);
    } catch (err: any) {
      console.error('Error al obtener órdenes:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'No se pudieron obtener las órdenes. Intenta nuevamente.');
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [FETCH_URL, token, isLastPage, isLoading, salesPersonCode]);

  const fetchCustomers = useCallback(async () => {
    if (!salesPersonCode || !token) return;
    
    setIsLoadingCustomers(true);
    try {
      const res = await axios.get<CustomerResponseType>(
        `${CUSTOMERS_URL}?slpCode=${salesPersonCode}&page=1&pageSize=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCustomers(res.data.items);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [CUSTOMERS_URL, salesPersonCode, token]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setIsLastPage(false);
    fetchOrders(1, true);
  }, [fetchOrders]);

  const handleLoadMore = useCallback(() => {
    if (!isRefreshing && !isLoading && !isLastPage) {
      fetchOrders(page, false);
    }
  }, [fetchOrders, page, isRefreshing, isLoading, isLastPage]);

  // Efecto para cargar clientes cuando se abre el drawer
  useEffect(() => {
    if (isDrawerOpen && customers.length === 0) {
      fetchCustomers();
    }
  }, [isDrawerOpen, customers.length, fetchCustomers]);

  useEffect(() => {
    if (salesPersonCode && token) {
      fetchOrders(1, true);
    }
  }, [salesPersonCode, token, fetchOrders]);

  const filteredCustomers = customers.filter(c => 
    c.cardName.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.cardCode.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-1">Gestiona tus pedidos abiertos</p>
          </div>

          <div className='flex gap-2'>
            <Drawer direction="right" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
              <DrawerTrigger className="p-2 bg-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus size={24} color="#4a5565" />
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-2xl font-bold">Seleccionar Cliente</DrawerTitle>
                  <DrawerDescription>Busca un cliente para iniciar un nuevo pedido.</DrawerDescription>
                </DrawerHeader>
                
                <div className="p-4 border-b border-gray-100">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input 
                      placeholder="Buscar por nombre o código..." 
                      className="pl-10"
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingCustomers ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <Loader2 size={30} className="text-[#1A3D59] animate-spin" />
                      <p className="text-gray-500 text-sm">Cargando clientes...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredCustomers.map((customer) => (
                        <div 
                          key={customer.cardCode}
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsDrawerOpen(false);
                          }}
                          className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <div className="bg-[#1A3D59] p-2.5 rounded-full">
                              <User size={20} color="white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-[#1A3D59]">{customer.cardName}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Código: {customer.cardCode}</p>
                              <p className="text-xs text-gray-400 mt-0.5">RTN: {customer.federalTaxID}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredCustomers.length === 0 && !isLoadingCustomers && (
                        <div className="text-center py-10 text-gray-500">
                          No se encontraron clientes.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <DrawerFooter className="border-t border-gray-100">
                  <DrawerClose asChild>
                    <button className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={24}
                className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {isRefreshing && orderData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={40} className="text-gray-400 animate-spin" />
            <p className="text-lg text-gray-600 font-medium">Cargando Pedidos...</p>
          </div>
        ) : orderData.length > 0 ? (
          <div>
            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {orderData.map((item) => (
                <div
                  key={item.docEntry}
                  className="bg-white rounded-2xl p-5 border border-gray-200"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={22} className="text-gray-700" />
                      <p className="text-sm text-gray-600">
                        Pedido <span className="font-semibold text-gray-900">#{item.docNum}</span>
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                      En Proceso
                    </span>
                  </div>

                  {/* Cliente */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-gray-100 p-2 rounded-full shrink-0">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {item.cardName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Cliente</p>
                      <p className="text-base font-semibold text-gray-900 truncate">{item.cardName}</p>
                    </div>
                  </div>

                  {/* Fecha */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-gray-100 p-2 rounded-full shrink-0">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="text-base font-semibold text-gray-900">
                        {new Date(item.docDate).toLocaleDateString('es-HN')}
                      </p>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-start gap-3 mb-6">
                    <div className="bg-gray-100 p-2 rounded-full shrink-0">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-lg font-bold text-gray-900">
                        L. {item.docTotal.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => router.push(`/dashboard/orders/${item.docEntry}`)}
                    className="w-full bg-[#1A3D59] text-white font-semibold py-3 px-4 rounded-full transition-colors"
                  >
                    Ver más detalles
                  </button>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {!isLastPage && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más'
                  )}
                </button>
              </div>
            )}

            {isLoading && orderData.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 size={24} className="text-gray-400 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m0 0l8 4m-8-4v10l8 4m0-10l8-4m-8 4v10l8-4m0 0l-8-4" />
            </svg>
            <p className="text-lg text-gray-500 font-medium">No hay pedidos cargados.</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-[#1A3D59] text-white font-medium rounded-lg transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
