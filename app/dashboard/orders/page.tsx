'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CustomerType, CustomerResponseType, CustomerAddress } from '@/types/customers';
import { Input } from "@/components/ui/input";
import { ArrowClockwise, CalendarDots, Coins } from '@phosphor-icons/react';
import Avvvatars from 'avvvatars-react';
import { useCartStore } from '@/app/lib/store.cart';
import { Button } from '@/components/ui/button';
import { logClient } from '@/lib/logger/logger.client';

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
  const [customerPage, setCustomerPage] = useState(1);
  const [isLastCustomerPage, setIsLastCustomerPage] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{ title: string; description: string; onConfirm?: () => void; showCancel?: boolean } | null>(null);
  const [pendingCustomer, setPendingCustomer] = useState<CustomerType | null>(null);
  const CUSTOMER_PAGE_SIZE = 50;
  const customerObserverRef = useRef<IntersectionObserver | null>(null);
  const customerSearchRef = useRef(customerSearch);

  const PAGE_SIZE = 20;
  const isLoadingRef = useRef(false);
  const isLastPageRef = useRef(false);
  const { salesPersonCode, token, fullName } = useAuthStore();
  const {
    setSelectedCustomer,
    selectedCustomer,
    addresses,
    setAddresses,
    selectedAddress,
    setSelectedAddress,
    setSellerDifferent,
    setSelectedSlpCode,
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

    if (!isRefresh && isLastPageRef.current) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
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

      const lastPage = newOrders.length < PAGE_SIZE;
      isLastPageRef.current = lastPage;
      setIsLastPage(lastPage);
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'No se pudieron obtener las órdenes.';
      setError(message);
      logClient({
        level: 'ERROR',
        category: 'PEDIDO',
        endpoint: `${FETCH_URL}/${salesPersonCode}`,
        errorCode: err.response?.status,
        message,
        responseBody: err.response?.data,
        pageUrl: '/dashboard/orders',
        userId: fullName ?? undefined,
      });
    } finally {
      isLoadingRef.current = false;
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [FETCH_URL, token, salesPersonCode, fullName]);

  const fetchCustomers = useCallback(async (pageToFetch = 1, isRefresh = false) => {
    if (!salesPersonCode || !token) return;
    if (!isRefresh && isLastCustomerPage) return;

    const scrollContainer = document.getElementById('customer-list-container');
    let scrollTop = 0;
    if (!isRefresh && scrollContainer) {
      scrollTop = scrollContainer.scrollTop;
    }

    const searchValue = customerSearchRef.current;
    const searchParam = searchValue.trim() ? `&search=${encodeURIComponent(searchValue.trim())}` : '';
    const url = `${CUSTOMERS_URL}?slpCode=${searchParam}&page=${pageToFetch}&pageSize=${CUSTOMER_PAGE_SIZE}`;

    setIsLoadingCustomers(true);
    try {
      const res = await axios.get<CustomerResponseType>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const newCustomers = res.data.items ?? [];
      if (isRefresh || pageToFetch === 1) {
        setCustomers(newCustomers);
        setCustomerPage(2);
      } else {
        setCustomers(prev => [...prev, ...newCustomers]);
        setCustomerPage(pageToFetch + 1);
        requestAnimationFrame(() => {
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollTop;
          }
        });
      }
      setIsLastCustomerPage(newCustomers.length < CUSTOMER_PAGE_SIZE);
    } catch (err: any) {
      logClient({
        level: 'ERROR',
        category: 'CLIENTES',
        endpoint: CUSTOMERS_URL,
        errorCode: err.response?.status,
        message: err.response?.data?.message || err.response?.data?.error || 'Error al cargar clientes',
        responseBody: err.response?.data,
        pageUrl: '/dashboard/orders',
        userId: fullName ?? undefined,
      });
    } finally {
      setIsLoadingCustomers(false);
    }
  }, [CUSTOMERS_URL, salesPersonCode, token, isLastCustomerPage]);

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
    } catch (err: any) {
      logClient({
        level: 'ERROR',
        category: 'CLIENTES',
        endpoint: `${ADDRESSES_URL}/${cardCode}/addresses`,
        errorCode: err.response?.status,
        message: err.response?.data?.message || err.response?.data?.error || 'Error al cargar direcciones',
        responseBody: err.response?.data,
        pageUrl: '/dashboard/orders',
        userId: fullName ?? undefined,
      });
      setAddresses([]);
      setSelectedAddress(null);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [ADDRESSES_URL, token, setAddresses, setSelectedAddress]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    isLastPageRef.current = false;
    setIsLastPage(false);
    fetchOrders(1, true);
  }, [fetchOrders]);

  const handleLoadMore = useCallback(() => {
    if (!isLastPage) {
      fetchOrders(page, false);
    }
  }, [fetchOrders, page, isLastPage]);

  useEffect(() => {
    if (isDialogOpen && customers.length === 0) {
      setCustomerPage(1);
      setIsLastCustomerPage(false);
      fetchCustomers(1, true);
    }
  }, [isDialogOpen, customers.length, fetchCustomers]);

  useEffect(() => {
    customerSearchRef.current = customerSearch;
  }, [customerSearch]);

  useEffect(() => {
    if (!isDialogOpen) return;

    const timer = setTimeout(() => {
      setCustomerPage(1);
      setIsLastCustomerPage(false);
      fetchCustomers(1, true);
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearch, isDialogOpen]);

  useEffect(() => {
    if (!isDialogOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingCustomers && !isLastCustomerPage) {
          fetchCustomers(customerPage, false);
        }
      },
      { threshold: 0.1 }
    );

    customerObserverRef.current = observer;

    const sentinelEl = document.getElementById('customer-scroll-sentinel');
    if (sentinelEl) {
      observer.observe(sentinelEl);
    }

    return () => {
      observer.disconnect();
    };
  }, [isDialogOpen, isLoadingCustomers, isLastCustomerPage, customerPage, fetchCustomers]);

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
    <div className="flex-1 min-h-screen p-4 sm:p-6 bg-gray-50/50">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Cotizaciones</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {orderData.length > 0 ? `${orderData.length} cotizaciones cargadas` : 'Historial reciente de cotizaciones'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-full border-gray-200"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <ArrowClockwise size={15} className={isRefreshing ? 'animate-spin' : ''} />
            Actualizar
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {productsInCart.length === 0 && (
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white">
                  <Plus size={15} />
                  Nueva Cotización
                </Button>
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
                      className="w-full bg-brand-primary cursor-pointer text-white font-semibold h-12 py-2 rounded-full transition-all flex items-center justify-center gap-2"
                    >
                      {addresses.length > 0 ? 'Realizar una Cotizacion' : 'Continuar sin Ubicación'}
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

                  <div id="customer-list-container" className="flex-1 pt-2 overflow-y-auto px-6 pb-6">
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
                                // Verificar si el vendedor asignado al cliente es diferente del vendedor logueado
                                if (salesPersonCode && customer.slpCode && salesPersonCode !== customer.slpCode) {
                                  setPendingCustomer(customer);
                                  setAlertInfo({
                                    title: 'Vendedor asignado diferente',
                                    description: `Este cliente está asignado a ${customer.slpName}, pero tú estás logueado como ${fullName}.\n\n¿Con cuál vendedor deseas realizar la cotizacion?`,
                                    showCancel: true,
                                    onConfirm: () => {
                                      // Usar el vendedor del cliente
                                      setSellerDifferent(true);
                                      setSelectedSlpCode(customer.slpCode ?? null);
                                      setSelectedCustomer(customer);
                                      logClient({ level: 'INFO', category: 'CLIENTES', message: `Cliente seleccionado con vendedor diferente: ${customer.cardName}`, pageUrl: '/dashboard/orders', userId: fullName ?? undefined });
                                      setPendingCustomer(null);
                                    }
                                  });
                                } else {
                                  setSelectedCustomer(customer);
                                  logClient({ level: 'INFO', category: 'CLIENTES', message: `Cliente seleccionado: ${customer.cardName} (${customer.cardCode})`, pageUrl: '/dashboard/orders', userId: fullName ?? undefined });
                                }
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

                        <div id="customer-scroll-sentinel" className="h-4" />

                        {isLoadingCustomers && customers.length > 0 && (
                          <div className="flex items-center justify-center py-4 gap-2">
                            <Loader2 size={16} className="text-brand-primary animate-spin" />
                            <span className="text-xs text-gray-500">Cargando más...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Grid de Órdenes */}
      <div>
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 text-sm font-semibold">Error al cargar</p>
              <p className="text-red-700 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {isRefreshing && orderData.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                  <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
                </div>
                <div className="h-9 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        ) : orderData.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {orderData.map((item) => (
                <div
                  key={item.docEntry}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all"
                >
                  {/* Header de la card */}
                  <div className="px-5 pt-5 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center">
                        <TrendingUp size={15} className="text-brand-primary" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Cotización <span className="font-bold text-gray-900">#{item.docNum}</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                      En Proceso
                    </span>
                  </div>

                  {/* Cliente */}
                  <div className="px-5 pb-4 flex items-center gap-3">
                    <Avvvatars size={38} value={item.cardName} style="character" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Cliente</p>
                      <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{item.cardName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{item.cardCode}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mx-5 mb-4 grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <CalendarDots size={11} /> Fecha
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        {new Date(item.docDate).toLocaleDateString('es-HN')}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-3 py-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                        <Coins size={11} /> Total
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        L.{item.docTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-5 pb-5">
                    <button
                      onClick={() => router.push(`/dashboard/orders/${item.docEntry}`)}
                      className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold py-2.5 rounded-full cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      Ver detalles
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!isLastPage && (
              <div className="flex justify-center pb-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold border border-gray-200 rounded-full transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más cotizaciones'
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          !error && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
                <TrendingUp size={36} className="text-gray-300" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-700">Sin cotizaciones</p>
                <p className="text-sm text-gray-400 mt-1">No hay cotizaciones registradas aún.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full gap-2 border-gray-200" onClick={handleRefresh}>
                <RefreshCw size={14} />
                Intentar nuevamente
              </Button>
            </div>
          )
        )}
      </div>

      <AlertDialog open={!!alertInfo} onOpenChange={(isOpen) => !isOpen && setAlertInfo(null)}>
        <AlertDialogContent className='min-w-fit'>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertInfo?.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {alertInfo?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                alertInfo?.onConfirm?.();
                setAlertInfo(null);
              }}
            >
              Con {pendingCustomer?.slpName}
            </AlertDialogAction>

            <AlertDialogCancel
              onClick={() => {
                if (pendingCustomer) {
                  setSellerDifferent(false);
                  setSelectedSlpCode(salesPersonCode);
                  setSelectedCustomer(pendingCustomer);
                  logClient({ level: 'INFO', category: 'CLIENTES', message: `Cliente seleccionado (vendedor propio): ${pendingCustomer.cardName} (${pendingCustomer.cardCode})`, pageUrl: '/dashboard/orders', userId: fullName ?? undefined });
                  setPendingCustomer(null);
                }
                setAlertInfo(null);
              }}
            >
              Con {fullName}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}