"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import axios from "axios"
import Link from "next/link"
import { useAuthStore } from "@/app/lib/store"
import { Payment } from "@/types/general"

import {
  ArrowLeft,
  CalendarDots,
  Coins,
  CreditCard,
  Info,
} from "@phosphor-icons/react"

import Avvvatars from "avvvatars-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export default function PaymentPage() {
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuthStore()
  const { docEntry } = useParams()

  useEffect(() => {
    if (!docEntry) return

    const fetchPayment = async () => {
      setIsLoading(true)
      try {
        const { data } = await axios.get(
          `/api-proxy/api/Payments/${docEntry}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setPayment(data)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayment()
  }, [docEntry, token])

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-500 mb-2">No se encontró el pago</p>
        <Link
          href="/dashboard/payments"
          className="text-brand-primary text-sm font-medium"
        >
          Volver a pagos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard/payments"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={16} />
        Pagos
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Pago #{payment.docNum}
          </h1>
          <Badge variant="secondary">Recibido</Badge>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <CalendarDots size={16} />
          {new Date(payment.docDate).toLocaleDateString("es-HN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Facturas */}
        <div className="lg:col-span-2 w-120">
          <div className="bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Facturas aplicadas
            </h3>

            {payment.invoices.length > 0 ? (
              <div className="space-y-3">
                {payment.invoices.map((invoice) => (
                  <div
                    key={invoice.invoiceDocEntry}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        Factura #{invoice.invoiceDocNum}
                      </p>
                      <p className="text-xs text-gray-500">
                        Total factura: L.{" "}
                        {invoice.docTotal.toLocaleString("es-HN")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">Aplicado</p>
                      <p className="font-bold text-gray-900">
                        L.{" "}
                        {invoice.appliedAmount.toLocaleString("es-HN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                No hay facturas asociadas a este pago
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 w-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Cliente
            </h3>

            <div className="flex items-center gap-3">
              <Avvvatars value={payment.cardName} size={40} />
              <div>
                <p className="font-semibold text-gray-900">
                  {payment.cardName}
                </p>
                <p className="text-xs text-gray-500">
                  {payment.cardCode}
                </p>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-white w-100 border border-gray-200 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Resumen del pago
            </h3>

            <div className="space-y-3">
              <Row label="Monto del pago" value={payment.total} />

              <Separator />

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Medio</span>
                <div className="flex items-center gap-1">
                  <CreditCard size={14} />
                  <Badge variant="secondary">
                    {payment.paymentMeans}
                  </Badge>
                </div>
              </div>

              {payment.transfer > 0 && (
                <Row label="Transferencia" value={payment.transfer} />
              )}
              {payment.cash > 0 && (
                <Row label="Efectivo" value={payment.cash} />
              )}
              {payment.check > 0 && (
                <Row label="Cheque" value={payment.check} />
              )}
              {payment.credit > 0 && (
                <Row label="Crédito" value={payment.credit} />
              )}
            </div>
          </div>

          {/* Detalle transferencia */}
          {payment.paymentMeans === "Transfer" &&
            payment.payment?.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 w-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Detalle de transferencia
                </h3>

                <div className="space-y-3 text-sm">
                  <Detail
                    label="Referencia"
                    value={payment.payment[0].transferReference}
                  />
                  <Detail
                    label="Cuenta destino"
                    value={payment.payment[0].transferAccountName}
                  />
                  <Detail
                    label="Fecha"
                    value={new Date(
                      payment.payment[0].transferDate
                    ).toLocaleDateString("es-HN")}
                  />
                </div>
              </div>
            )}

          {/* Cancelado */}
          {payment.cancelled === "Y" && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
              <Info size={20} className="text-red-600 mt-0.5" />
              <p className="text-sm font-medium text-red-700">
                Este pago fue cancelado y no tiene efecto contable
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">
        L.{" "}
        {value.toLocaleString("es-HN", {
          minimumFractionDigits: 2,
        })}
      </span>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right">
        {value}
      </span>
    </div>
  )
}
