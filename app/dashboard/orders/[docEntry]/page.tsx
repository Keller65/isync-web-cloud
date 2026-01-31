'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { AlertCircle, ArrowLeft, Loader2, Package, User, Calendar, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/app/lib/store';
import { OrderDetailType } from '@/types/orders';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const docEntry = params.docEntry as string;

  const [orderDetail, setOrderDetail] = useState<OrderDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuthStore();
  const FETCH_URL = '/api-proxy/api/Quotations';

  const fetchOrderDetail = useCallback(async () => {
    if (!token) {
      setError('Token de autenticación no disponible');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await axios.get(`${FETCH_URL}/${docEntry}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setOrderDetail(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Error al obtener detalles del pedido:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'No se pudieron obtener los detalles del pedido.');
    } finally {
      setIsLoading(false);
    }
  }, [docEntry, token, FETCH_URL]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} color="#1A3D59" className="animate-spin" />
          <p className="text-lg text-gray-600 font-medium">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetail) {
    return (
      <div className="min-h-screen bg-white p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Volver
        </button>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle size={20} color="#1A3D59" className="shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm">{error || 'Pedido no encontrado'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 font-medium"
          >
            <ArrowLeft size={20} color="#1A3D59" />
            Volver a pedidos
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pedido #{orderDetail.docNum}</h1>
              <p className="text-gray-600 mt-1">Detalles completos del pedido</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Código de documento</p>
              <p className="text-xl font-bold text-gray-900">{orderDetail.docEntry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Cliente y Información General */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Cliente */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#1A3D59] p-3 rounded-full">
                <User size={24} color="white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Cliente</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Nombre</p>
                <p className="text-base font-semibold text-gray-900">{orderDetail.cardName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Código Cliente</p>
                <p className="text-base font-semibold text-gray-900">{orderDetail.cardCode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">RTN</p>
                <p className="text-base font-semibold text-gray-900">{orderDetail.federalTaxID}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Dirección</p>
                <p className="text-sm text-gray-700">{orderDetail.address}</p>
              </div>
            </div>
          </div>

          {/* Información del Pedido */}
          <div className="space-y-6">
            {/* Fecha */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="bg-[#1A3D59] p-3 rounded-full">
                  <Calendar size={24} color="white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Fecha</h2>
              </div>
              <p className="text-base font-semibold text-gray-900">
                {new Date(orderDetail.docDate).toLocaleDateString('es-HN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            {/* Observaciones */}
            {orderDetail.comments && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Observaciones</h2>
                <p className="text-gray-700">{orderDetail.comments}</p>
              </div>
            )}
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-[#1A3D59] p-3 rounded-full">
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Subtotal</p>
                <p className="text-lg font-bold text-gray-900">
                  L. {(orderDetail.docTotal - orderDetail.vatSum).toLocaleString('es-HN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="bg-[#1A3D59] p-3 rounded-full">
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Impuesto (ISV)</p>
                <p className="text-lg font-bold text-gray-900">
                  L. {orderDetail.vatSum.toLocaleString('es-HN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1A3D59] rounded-2xl p-6">
            <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-full">
                <DollarSign size={24} color="white" />
              </div>
              <div>
                <p className="text-xs text-blue-100">Total</p>
                <p className="text-lg font-bold text-white">
                  L. {orderDetail.docTotal.toLocaleString('es-HN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Líneas del Pedido */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-200">
            <div className="bg-[#1A3D59] p-3 rounded-full">
              <Package size={24} color="white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Productos ({orderDetail.lines.length})</h2>
          </div>

          <Table>
            <TableCaption>Lista de productos incluidos en el pedido</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Código</TableHead>
                <TableHead className="text-left">Descripción</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unitario</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Impuesto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderDetail.lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell className="font-semibold text-gray-900">{line.itemCode}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-900">{line.itemDescription}</p>
                      <p className="text-xs text-gray-500">Código de barras: {line.barCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {line.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-gray-900">
                    L. {line.priceAfterVAT.toLocaleString('es-HN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900">
                    L. {(line.priceAfterVAT * line.quantity).toLocaleString('es-HN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      {line.taxCode}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Acciones */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors"
          >
            Volver
          </button>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-full transition-colors">
              Descargar PDF
            </button>
            <button className="px-6 py-3 bg-[#1A3D59] text-white font-semibold rounded-full transition-colors">
              Editar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
