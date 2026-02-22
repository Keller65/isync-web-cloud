"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  Search,
  Settings,
  SlidersHorizontal,
  Calendar as CalendarIcon
} from "lucide-react"

type Visit = {
  id: string
  client: string
  role: string
  time: string
  date: Date
  durationMinutes: number
  status: "pending" | "completed" | "cancelled"
}

const sampleVisits: Visit[] = [
  {
    id: "1",
    client: "Daily checkin",
    role: "Team Sync",
    time: "9:00 AM",
    date: new Date(2026, 1, 16),
    durationMinutes: 60,
    status: "pending"
  },
  {
    id: "2",
    client: "Rico Oktananda",
    role: "UX Designer",
    time: "10:00 AM",
    date: new Date(2026, 1, 16),
    durationMinutes: 90,
    status: "pending"
  },
  {
    id: "3",
    client: "James Brown",
    role: "UX Designer",
    time: "10:00 AM",
    date: new Date(2026, 1, 17),
    durationMinutes: 60,
    status: "completed"
  },
]

const HOURS = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"]

export default function VisitasCalendarioPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [filterDate, setFilterDate] = useState<Date | undefined>(undefined)
  const [referenceDate, setReferenceDate] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    vendedor: "",
    cliente: "",
    ruta: "",
    fecha: "",
    hora: "",
    duracion: "60",
    notas: "",
  })

  const weekDays = useMemo(() => {
    const startOfWeek = new Date(referenceDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)

    return Array.from({ length: 5 }).map((_, i) => {
      const d = new Date(startOfWeek)
      d.setDate(startOfWeek.getDate() + i)
      return d
    })
  }, [referenceDate])

  const navigateWeek = (direction: number) => {
    const newDate = new Date(referenceDate)
    newDate.setDate(referenceDate.getDate() + direction * 7)
    setReferenceDate(newDate)
  }

  const formatWeekRange = () => {
    const first = weekDays[0]
    const last = weekDays[4]
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: '2-digit' }
    return `${first.toLocaleDateString('en-US', options)} - ${last.toLocaleDateString('en-US', options)} ${last.getFullYear()}`
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nueva visita:", formData)
    setIsModalOpen(false)
    setFormData({
      vendedor: "",
      cliente: "",
      ruta: "",
      fecha: "",
      hora: "",
      duracion: "60",
      notas: "",
    })
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] p-8 font-sans">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {referenceDate.toLocaleDateString("en-US", { month: 'long', day: '2-digit', year: 'numeric' })}
          </h1>
          <p className="text-sm text-gray-500">Gestión de visitas para esta semana 🗓️</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="bg-white" onClick={() => setReferenceDate(new Date())}>
            Hoy
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDate}
                onSelect={(date) => {
                  setFilterDate(date)
                  if (date) {
                    setReferenceDate(date)
                  }
                }}
                className="rounded-md"
              />
            </PopoverContent>
          </Popover>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#0F172A] text-white hover:bg-[#1E293B]">
                <Plus className="w-4 h-4 mr-2" /> Nueva Visita
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Nueva Visita</DialogTitle>
                  <DialogDescription>
                    Completa los datos para registrar una nueva visita
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="vendedor">Vendedor</Label>
                      <Input
                        id="vendedor"
                        name="vendedor"
                        value={formData.vendedor}
                        onChange={handleInputChange}
                        placeholder="Selecciona el vendedor"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cliente">Cliente</Label>
                      <Input
                        id="cliente"
                        name="cliente"
                        value={formData.cliente}
                        onChange={handleInputChange}
                        placeholder="Selecciona el cliente"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="ruta">Ruta</Label>
                      <Input
                        id="ruta"
                        name="ruta"
                        value={formData.ruta}
                        onChange={handleInputChange}
                        placeholder="Selecciona la ruta"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Fecha</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate ? new Date(selectedDate) : undefined}
                        onSelect={(date) => {
                          setSelectedDate(date)
                          if (date) {
                            setFormData(prev => ({ ...prev, fecha: date.toISOString().split('T')[0] }))
                          }
                        }}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="hora">Hora</Label>
                        <Input
                          id="hora"
                          name="hora"
                          type="time"
                          value={formData.hora}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="duracion">Duración (min)</Label>
                        <Input
                          id="duracion"
                          name="duracion"
                          type="number"
                          value={formData.duracion}
                          onChange={handleInputChange}
                          min="15"
                          step="15"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="notas">Notas</Label>
                      <Input
                        id="notas"
                        name="notas"
                        value={formData.notas}
                        onChange={handleInputChange}
                        placeholder="Notas adicionales..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-[#0F172A] text-white hover:bg-[#1E293B]">
                      Guardar Visita
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center bg-gray-50 rounded-lg p-1">
              <Button variant="ghost" size="sm" className="text-gray-600">Semana</Button>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm font-bold text-gray-800">
                <ChevronLeft
                  className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => navigateWeek(-1)}
                />
                <span className="min-w-45 text-center">{formatWeekRange()}</span>
                <ChevronRight
                  className="w-5 h-5 cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => navigateWeek(1)}
                />
              </div>
              <div className="flex items-center gap-3 text-gray-400 border-l pl-6">
                <Search className="w-5 h-5" />
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex border-b border-gray-100 ml-20">
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString()
              return (
                <div key={i} className="flex-1 py-4 text-center">
                  <span className={`text-[11px] font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {day.toLocaleDateString("en-US", { day: '2-digit', weekday: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-1 relative min-h-162.5">
            <div className="w-20 shrink-0 flex flex-col border-r border-gray-50">
              {HOURS.map((hour) => (
                <div key={hour} className="h-32 text-[11px] font-bold text-gray-400 text-center pt-4 uppercase">
                  {hour}
                </div>
              ))}
            </div>

            <div className="flex-1 grid grid-cols-5 relative">
              {weekDays.map((_, i) => (
                <div key={i} className="border-r border-gray-50 relative bg-grid-pattern">
                  {HOURS.map((_, j) => (
                    <div key={j} className="h-32 border-b border-gray-50/50" />
                  ))}
                </div>
              ))}

              {sampleVisits.map((visit) => {
                const visitDayIndex = weekDays.findIndex(d => d.toDateString() === visit.date.toDateString())
                if (visitDayIndex === -1) return null

                const startHour = parseInt(visit.time.split(":")[0])
                const topOffset = (startHour - 9) * 128
                const height = (visit.durationMinutes / 60) * 128

                return (
                  <div
                    key={visit.id}
                    className="absolute p-1.5 z-10"
                    style={{
                      width: '20%',
                      left: `${visitDayIndex * 20}%`,
                      top: `${topOffset}px`,
                      height: `${height}px`
                    }}
                  >
                    <div className={`h-full w-full rounded-2xl p-4 border flex flex-col shadow-sm transition-all hover:scale-[1.02] ${visit.status === 'completed'
                        ? 'bg-gray-50 border-gray-200 opacity-80'
                        : 'bg-[#E0F2FE] border-[#BAE6FD]'
                      }`}>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{visit.client}</h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-3">{visit.time}</p>

                      <div className="flex -space-x-1.5 mb-auto">
                        <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-white" />
                        <div className="w-6 h-6 rounded-full bg-purple-400 border-2 border-white" />
                      </div>

                      <button className="flex items-center text-[#0284C7] text-[11px] font-bold mt-2">
                        <Video className="w-3.5 h-3.5 mr-1.5" />
                        Detalles
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}