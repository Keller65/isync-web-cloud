"use client"

import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Package,
  Receipt,
  Target,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/app/lib/store'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

interface KPIMetric {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  trend: 'up' | 'down'
}

interface Order {
  docNum: string
  cardName: string
  docDate: string
  docTotal: number
  status: 'pending' | 'completed' | 'cancelled'
}

interface TopProduct {
  itemName: string
  quantity: number
  total: number
}

function CircularProgress({ value, max, label }: { value: number; max: number; label: string }) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative flex items-center justify-center">
      <svg className="transform -rotate-90 w-44 h-44">
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-brand-primary transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-black text-brand-primary">{Math.round(percentage)}%</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { token } = useAuthStore()

  const kpis: KPIMetric[] = [
    { title: 'Ventas del Día', value: 'L. 245,890', change: 12.5, icon: <DollarSign className="w-5 h-5" />, trend: 'up' },
    { title: 'Pedidos del Día', value: '48', change: 8.2, icon: <Receipt className="w-5 h-5" />, trend: 'up' },
    { title: 'Clientes Activos', value: '156', change: -2.4, icon: <Users className="w-5 h-5" />, trend: 'down' },
    { title: 'Productos Vendidos', value: '892', change: 15.3, icon: <Package className="w-5 h-5" />, trend: 'up' },
  ]

  const orders: Order[] = [
    { docNum: '1001', cardName: 'Distribuciones García', docDate: '15/03/2026', docTotal: 15420, status: 'pending' },
    { docNum: '1002', cardName: 'Ferretería López', docDate: '15/03/2026', docTotal: 8750, status: 'completed' },
    { docNum: '1003', cardName: 'Constructora ABC', docDate: '14/03/2026', docTotal: 42300, status: 'pending' },
    { docNum: '1004', cardName: 'Servicios Metals', docDate: '14/03/2026', docTotal: 12800, status: 'completed' },
    { docNum: '1005', cardName: 'Agroindustrias del Norte', docDate: '13/03/2026', docTotal: 6750, status: 'cancelled' },
    { docNum: '1006', cardName: 'Maquinarias Honduras', docDate: '13/03/2026', docTotal: 31500, status: 'completed' },
  ]

  const topProducts: TopProduct[] = [
    { itemName: 'Bomba Centrífuga 2HP', quantity: 45, total: 225000 },
    { itemName: 'Motor Eléctrico 5HP', quantity: 32, total: 384000 },
    { itemName: 'Válvula Check 2"', quantity: 120, total: 84000 },
    { itemName: 'Tubo PVC 3" x 6m', quantity: 250, total: 125000 },
    { itemName: 'Medidor de Agua', quantity: 85, total: 127500 },
  ]

  const monthlyGoal = 12000000
  const currentProgress = 9360000
  const remaining = monthlyGoal - currentProgress

  const salesData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Ventas (L)',
        data: [1450000, 1680000, 1320000, 1890000, 2100000, 2450000, 1580000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const ordersByStatus = {
    labels: ['Pendientes', 'Completados', 'Cancelados'],
    datasets: [
      {
        data: [12, 28, 5],
        backgroundColor: ['#F59E0B', '#10B981', '#EF4444'],
        borderWidth: 0,
      },
    ],
  }

  const salesByCategory = {
    labels: ['Bombas', 'Motor Eléc.', 'Tubería', 'Válvulas', 'Otros'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#6B7280'],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
        },
      },
    },
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendiente</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completado</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelado</Badge>
    }
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Inicia sesión para ver el dashboard.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm">Resumen de tu negocio</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Esta Semana
          </Button>
          <Button size="sm">
            Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs ${
                    kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    <span className="font-medium">{Math.abs(kpi.change)}%</span>
                    <span className="text-gray-400">vs mes anterior</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary">
                  {kpi.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Ventas de la Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <Line data={salesData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Monthly Goal */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-primary" />
              Meta Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CircularProgress 
              value={currentProgress} 
              max={monthlyGoal} 
              label="Completado"
            />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Actual</span>
                <span className="font-bold">{formatCurrency(currentProgress)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Meta</span>
                <span className="font-bold">{formatCurrency(monthlyGoal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Restante</span>
                <span className="font-bold text-amber-600">{formatCurrency(remaining)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Ventas por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <Doughnut data={salesByCategory} options={doughnutOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Pedidos Recientes</CardTitle>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.docNum} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white">
                      <Receipt className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.cardName}</p>
                      <p className="text-xs text-gray-500">#{order.docNum} • {order.docDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.docTotal)}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Productos Más Vendidos</CardTitle>
            <Button variant="ghost" size="sm">Ver todos</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{product.itemName}</p>
                      <p className="text-xs text-gray-500">{product.quantity} unidades</p>
                    </div>
                  </div>
                  <p className="font-bold text-brand-primary">{formatCurrency(product.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
