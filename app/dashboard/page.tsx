"use client"
import SalesDonutCard from "@/components/dashboard/SalesDonutCard"
import KPICardApi from "@/components/dashboard/KPICard"

export default function AnalyticsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Resumen de Rendimiento</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Componente KPI conectado a la API internamente */}
        <KPICardApi />
        <SalesDonutCard />

        {/* Otras tarjetas estáticas de ejemplo (Placeholders) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm opacity-50">
          <h3 className="text-gray-500 text-sm font-medium">Próximo KPI</h3>
          <p className="text-sm text-gray-400 mt-2">En desarrollo...</p>
        </div>
      </div>
    </div>
  )
}
