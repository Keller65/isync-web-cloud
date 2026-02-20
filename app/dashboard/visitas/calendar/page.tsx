"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Video,
  Search,
  Settings,
  SlidersHorizontal
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
  const [referenceDate, setReferenceDate] = useState(new Date())

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
          <Button className="bg-[#0F172A] text-white hover:bg-[#1E293B]">
            <Plus className="w-4 h-4 mr-2" /> Nueva Visita
          </Button>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col flex-1 overflow-hidden">
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
  )
}