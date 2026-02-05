'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import {
  AlertCircle, ArrowLeft, Loader2, Package, User,
  Calendar, FileText, Download, Edit3, Hash, Printer
} from 'lucide-react';
import { useAuthStore } from '@/app/lib/store';
import { OrderDetailType } from '@/types/orders';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Coins } from '@phosphor-icons/react';
import Avvvatars from 'avvvatars-react';

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
      setError(err.response?.data?.message || 'No se pudieron obtener los detalles.');
    } finally {
      setIsLoading(false);
    }
  }, [docEntry, token, FETCH_URL]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <Loader2 size={48} className="text-brand-primary animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Cargando pedido...</p>
      </div>
    );
  }

  if (error || !orderDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Pedido no encontrado.'}</p>
          <button onClick={() => router.back()} className="bg-brand-primary text-white px-6 py-2 rounded-xl font-bold">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const subtotal = orderDetail.docTotal - orderDetail.vatSum;

  return (
    <div className="min-h-fit">
      {/* Header sin sombras, con borde sutil */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                <ArrowLeft size={24} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-xl font-bold text-gray-900">Pedido #{orderDetail.docNum}</h1>
                  <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Borrador</span>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Hash size={12} /> SAP DocEntry: {orderDetail.docEntry}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
                <Download size={18} /> PDF
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-xl hover:opacity-95 transition-all">
                <Edit3 size={18} /> Editar
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto px-4 sm:px-6 py-8">
        {/* Grid mejorado: align-start para evitar saltos de altura extraños */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Fecha del Pedido', value: new Date(orderDetail.docDate).toLocaleDateString('es-HN'), icon: Calendar },
                { label: 'Vendedor', value: `Cod. ${orderDetail.salesPersonCode}`, icon: User },
                { label: 'RTN Cliente', value: orderDetail.federalTaxID || 'Consumidor Final', icon: FileText }
              ].map((item, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-2 text-brand-primary">
                    <item.icon size={18} />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Tabla de Productos sin sombras */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package size={20} className="text-gray-400" />
                  Items del Pedido ({orderDetail.lines.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-white">
                    <TableRow className="hover:bg-transparent border-gray-100">
                      <TableHead className="text-xs uppercase font-bold text-gray-400">Código</TableHead>
                      <TableHead className="text-xs uppercase font-bold text-gray-400">Descripción</TableHead>
                      <TableHead className="text-center text-xs uppercase font-bold text-gray-400">Cant.</TableHead>
                      <TableHead className="text-right text-xs uppercase font-bold text-gray-400">Precio</TableHead>
                      <TableHead className="text-right text-xs uppercase font-bold text-gray-400">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetail.lines.map((line, idx) => (
                      <TableRow key={idx} className="hover:bg-gray-50/30 border-gray-100">
                        <TableCell className="font-mono text-xs font-bold text-brand-primary">{line.itemCode}</TableCell>
                        <TableCell>
                          <p className="text-sm font-bold text-gray-900 leading-none mb-1">{line.itemDescription}</p>
                          <span className="text-[10px] text-gray-400 font-medium">EAN: {line.barCode || 'N/A'}</span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                            {line.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-gray-600">
                          {line.priceAfterVAT.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-gray-900">
                          {(line.priceAfterVAT * line.quantity).toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-white border border-gray-200 border-l-4 border-l-brand-primary p-5 rounded-r-2xl">
              <h4 className="text-[10px] font-bold text-brand-primary mb-1 uppercase tracking-widest">Observaciones</h4>
              <p className="text-sm text-gray-700 italic">
                {orderDetail.comments || 'Sin comentarios adicionales.'}
              </p>
            </div>
          </div>

          {/* Columna Derecha: Sidebar */}
          <div className="lg:col-span-4 space-y-6">

            {/* Info Cliente sin sombras */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <Avvvatars size={48} value={orderDetail.cardName} style="character" />
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 leading-tight truncate">{orderDetail.cardName}</h3>
                  <p className="text-xs font-mono text-gray-500 uppercase">{orderDetail.cardCode}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Dirección de Entrega</p>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">{orderDetail.address}</p>
              </div>
            </div>

            {/* Resumen de Totales (Diseño Plano) */}
            <div className="bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
              <h3 className="text-[10px] font-bold text-gray-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                <Coins size={16} /> Resumen
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="font-bold text-gray-200">L. {subtotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">ISV (15%)</span>
                  <span className="font-bold text-orange-400">L. {orderDetail.vatSum.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-sm font-bold text-white uppercase">Total</span>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white leading-none">
                      L. {orderDetail.docTotal.toLocaleString('es-HN', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-1 uppercase">Lempiras Hondureños</p>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full cursor-pointer flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm">
              <Printer size={18} /> Imprimir Pedido
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}