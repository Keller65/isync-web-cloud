'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Loader2, RefreshCw, TrendingUp, Plus, Search, User, ArrowRight, MapPin } from 'lucide-react';
import { useAuthStore } from '@/app/lib/store';
import { useCustomerStore } from '@/app/lib/store.customer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerType, CustomerResponseType, CustomerAddress } from '@/types/customers';
import { Input } from "@/components/ui/input";
import { CalendarDots, Coins } from '@phosphor-icons/react';
import Avvvatars from 'avvvatars-react';
import { useCartStore } from '@/app/lib/store.cart';

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
  const { productsInCart, removeProduct } = useCartStore();

  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const PAGE_SIZE = 20;
  const { salesPersonCode, token } = useAuthStore();
  const {
    setSelectedCustomer,
    selectedCustomer,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress
  } = useCustomerStore();

  const FETCH_URL = '/api-proxy/api/Quotations/open';
  const CUSTOMERS_URL = '/api-proxy/api/Customers/by-sales-emp';
  const ADDRESSES_URL = '/api-proxy/api/Customers';

  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const fetchOrders = useCallback(async (pageToFetch: number, isRefresh = false) => {
    if (!salesPersonCode || !token) {
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
      setError(err.response?.data?.message || 'No se pudieron obtener las órdenes.');
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

  const fetchAddresses = useCallback(async (cardCode: string) => {
    if (!token) return;

    setIsLoadingAddresses(true);
    try {
      const res = await axios.get<CustomerAddress[]>(
        `${ADDRESSES_URL}/${cardCode}/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setAddresses(res.data);
      if (res.data.length > 0) {
        setSelectedAddress(res.data[0]);
      } else {
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error('Error al cargar direcciones:', err);
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [ADDRESSES_URL, token, setAddresses, setSelectedAddress]);

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

  useEffect(() => {
    if (isDialogOpen && customers.length === 0) {
      fetchCustomers();
    }
  }, [isDialogOpen, customers.length, fetchCustomers]);

  useEffect(() => {
    if (salesPersonCode && token) {
      fetchOrders(1, true);
    }
  }, [salesPersonCode, token, fetchOrders]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchAddresses(selectedCustomer.cardCode);
    }
  }, [selectedCustomer, fetchAddresses]);

  const filteredCustomers = customers.filter(c =>
    c.cardName.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.cardCode.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-screen">
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-1">Gestiona tus pedidos abiertos</p>
          </div>

          <div className='flex gap-2'>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              {productsInCart.length === 0 && (
                <DialogTrigger asChild>
                  <button className="p-2 bg-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors">
                    <Plus size={24} color="#4a5565" />
                  </button>
                </DialogTrigger>
              )}
              <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
                <div className="flex h-full divide-x divide-gray-100">

                  {/* PANEL IZQUIERDO: DETALLES DINÁMICOS */}
                  <div className="w-80 bg-gray-50/50 p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-6">Detalle del Cliente</h2>

                      {selectedCustomer ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                          <div className="flex flex-col items-center text-center">
                            <Avvvatars size={80} value={selectedCustomer.cardName} style="character" />
                            <h3 className="mt-4 font-bold text-gray-900 leading-tight">
                              {selectedCustomer.cardName}
                            </h3>
                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded mt-2 uppercase">
                              {selectedCustomer.cardCode}
                            </span>
                          </div>

                          <div className="space-y-4 pt-6 border-t border-gray-200">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Identificación / RTN</p>
                              <p className="text-sm font-medium text-gray-700">{selectedCustomer.federalTaxID || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Dirección</p>
                              <p className="text-sm font-medium text-gray-700 line-clamp-3">{selectedAddress?.street || 'Sin dirección registrada'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Lista de Precios</p>
                              <p className="text-sm font-medium text-gray-700">Lista #{selectedCustomer.priceListNum}</p>
                            </div>
                          </div>

                          <div className="space-y-3 pt-6 border-t border-gray-200">
                            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                              Direcciones de Entrega
                            </h4>
                            {isLoadingAddresses ? (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm">Cargando...</span>
                              </div>
                            ) : (
                              <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                                {addresses.map((addr) => (
                                  <div
                                    key={addr.rowNum}
                                    onClick={() => setSelectedAddress(addr)}
                                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${selectedAddress?.rowNum === addr.rowNum
                                        ? 'bg-blue-50 border-brand-primary'
                                        : 'bg-white hover:bg-gray-100 border-gray-200'
                                      }`}
                                  >
                                    <div className="flex items-start gap-2.5">
                                      <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-xs font-bold text-gray-800 leading-tight">
                                          {addr.addressName}
                                        </p>
                                        <p className="text-[11px] text-gray-500">{addr.street}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {addresses.length === 0 && (
                                  <p className="text-xs text-gray-500 italic">
                                    No hay direcciones de entrega.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center opacity-50">
                          <div className="bg-gray-200 p-4 rounded-full mb-4">
                            <User size={32} className="text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-500 italic">Selecciona un cliente de la lista</p>
                        </div>
                      )}
                    </div>

                    {selectedCustomer && (
                      <button
                        onClick={() => {
                          setIsDialogOpen(false);
                          router.push('/dashboard/orders/shop');
                        }}
                        className="w-full bg-brand-primary cursor-pointer text-white font-semibold h-12 rounded-full transition-all flex items-center justify-center gap-2"
                      >
                        {addresses.length > 0 ? 'Realizar un Pedido' : 'Continuar sin Ubicación'}
                        <ArrowRight size={18} />
                      </button>
                    )}
                  </div>

                  {/* PANEL DERECHO: BUSCADOR Y LISTA */}
                  <div className="flex-1 flex flex-col bg-white">
                    <DialogHeader className="p-6 pb-2">
                      <DialogTitle className="text-2xl font-bold">Clientes</DialogTitle>
                      <DialogDescription>
                        Busca y selecciona un cliente para ver su perfil.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="px-6 py-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                          placeholder="Buscar por nombre o código SAP..."
                          className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex-1 pt-2 overflow-y-auto px-6 pb-6">
                      {isLoadingCustomers ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                          <Loader2 size={30} className="text-brand-primary animate-spin" />
                          <p className="text-gray-500 text-sm font-medium">Cargando maestros...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredCustomers.map((customer) => (
                            <div
                              key={customer.cardCode}
                              onClick={() => {
                                if (selectedCustomer?.cardCode !== customer.cardCode) {
                                  setSelectedCustomer(customer);
                                }
                              }}
                              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${selectedCustomer?.cardCode === customer.cardCode
                                ? 'border-brand-primary bg-blue-50 ring-1 ring-brand-primary'
                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                }`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`${selectedCustomer?.cardCode === customer.cardCode
                                  ? 'bg-brand-primary'
                                  : 'bg-gray-100'
                                  } p-2 rounded-full transition-colors shrink-0`}>
                                  <User size={18} className={selectedCustomer?.cardCode === customer.cardCode ? "text-white" : "text-gray-500"} />
                                </div>
                                <div className="overflow-hidden">
                                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                                    {customer.cardName}
                                  </h3>
                                  <p className="text-[11px] text-gray-500 font-mono">{customer.cardCode}</p>
                                </div>
                              </div>
                              {selectedCustomer?.cardCode === customer.cardCode && (
                                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse shrink-0" />
                              )}
                            </div>
                          ))}

                          {filteredCustomers.length === 0 && !isLoadingCustomers && (
                            <div className="text-center py-10 text-gray-500">
                              No se encontraron resultados para "{customerSearch}"
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={24}
                className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Órdenes */}
      <div className="py-4">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {orderData.map((item) => (
                <div
                  key={item.docEntry}
                  className="bg-white rounded-2xl p-5 border border-gray-200"
                >
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

                  <div className="flex items-start gap-3 mb-4">
                    <div className="bg-white size-10 rounded-full shrink-0">
                      <Avvvatars size={40} value={item.cardName} style="character" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-gray-500">Cliente</p>
                      <p className="text-base font-semibold text-gray-900 truncate">{item.cardName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-start gap-2">
                      <div className="bg-gray-100 p-1.5 rounded-full">
                        <CalendarDots size={18} color="#6a7282" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 leading-none">Fecha</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(item.docDate).toLocaleDateString('es-HN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-gray-100 p-1.5 rounded-full">
                        <Coins size={18} color="#6a7282" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 leading-none">Total</p>
                        <p className="text-sm font-bold text-gray-900">
                          L. {item.docTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard/orders/${item.docEntry}`)}
                    className="w-full bg-brand-primary text-white font-semibold py-2.5 rounded-full cursor-pointer hover:bg-brand-primary/90 transition-colors"
                  >
                    Ver detalles
                  </button>
                </div>
              ))}
            </div>

            {!isLastPage && (
              <div className="flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors flex items-center gap-2"
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
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="bg-gray-100 p-6 rounded-full">
              <TrendingUp size={48} className="text-gray-300" />
            </div>
            <p className="text-lg text-gray-500 font-medium">No hay pedidos cargados.</p>
            <button
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-brand-primary text-white font-medium rounded-lg transition-colors"
            >
              Intentar nuevamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}