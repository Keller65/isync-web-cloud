'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@/app/lib/store';

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

  const PAGE_SIZE = 20;
  const { salesPersonCode, token } = useAuthStore()
  const FETCH_URL = '/api-proxy/Quotations/open';

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
    if (salesPersonCode && token) {
      fetchOrders(1, true);
    }
  }, [salesPersonCode, token, fetchOrders]);

  return (
    <div className="flex-1 bg-white min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-1">Gestiona tus pedidos abiertos</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              size={24}
              className={`text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
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
