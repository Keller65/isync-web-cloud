"use client"

import {
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  MoreHorizontal,
  Search,
  User,
  Users,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Line, Doughnut } from "react-chartjs-2"
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
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function AnalyticsPage() {
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
    datasets: [
      {
        label: "Average Team KPI",
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  }

  const doughnutChartData = {
    labels: ["Satisfied", "Neutral", "Unsatisfied"],
    datasets: [
      {
        data: [75, 15, 10],
        backgroundColor: ["#34D399", "#FBBF24", "#F87171"],
        hoverBackgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8 bg-gray-50/50">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Good morning, Oscar Piastri!
          </h1>
          <p className="text-gray-500">It&apos;s Wednesday, 24 August 2024</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            <span>Calendar</span>
          </Button>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Employee
            </CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+3.5%</span>
              <span className="text-gray-500 ml-1">Than last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payrolls</CardTitle>
            <Briefcase className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+5%</span>
              <span className="text-gray-500 ml-1">Than last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8%</div>
            <p className="text-xs text-red-500 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />
              <span>-1%</span>
              <span className="text-gray-500 ml-1">Than last month</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Job Applicants
            </CardTitle>
            <User className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              <span>+6%</span>
              <span className="text-gray-500 ml-1">Than last month</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle>Schedule</CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Today, Wed, 24 Aug 2024</span>
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="meetings">
                <TabsList>
                  <TabsTrigger value="meetings">Meetings</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>
                <TabsContent value="meetings" className="mt-4">
                  <div className="space-y-4">
                    <div className="border p-4 rounded-lg">
                      <p className="font-semibold">
                        Interview Candidate - UI/UX Designer
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>13:00 - 13:30</span>
                        </div>
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="https://github.com/shadcn.png" />
                          <AvatarFallback>AK</AvatarFallback>
                        </Avatar>
                      </div>
                      <a
                        href="#"
                        className="text-sm text-blue-500 flex items-center gap-1 mt-2"
                      >
                        Go to link <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="border p-4 rounded-lg">
                      <p className="font-semibold">Retro Day - HR Departement</p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>15:00 - 16:00</span>
                        </div>
                        <div className="flex items-center -space-x-2">
                           <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                           <Avatar className="w-6 h-6 border-2 border-white">
                            <AvatarImage src="https://github.com/vercel.png" />
                            <AvatarFallback>VC</AvatarFallback>
                          </Avatar>
                           <Avatar className="w-6 h-6 border-2 border-white">
                             <AvatarFallback>+4</AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                       <a
                        href="#"
                        className="text-sm text-blue-500 flex items-center gap-1 mt-2"
                      >
                        Go to link <ChevronRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>List Employee</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input placeholder="Search employee..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      Sarah Schmidt
                    </TableCell>
                    <TableCell>203142131</TableCell>
                    <TableCell>Senior Engineer</TableCell>
                    <TableCell>j.jones@outlook.com</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                    </TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="font-medium">
                      Mikayla Laudrup
                    </TableCell>
                    <TableCell>203142132</TableCell>
                    <TableCell>Product Designer</TableCell>
                    <TableCell>rodger913@aol.com</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-500 border-green-500">Active</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Team KPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-60">
                <Line data={lineChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Employment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-blue-600 h-2.5 rounded-l-full" style={{ width: '49%' }}></div>
                <div className="bg-teal-400 h-2.5" style={{ width: '31%', float: 'left' }}></div>
                <div className="bg-red-500 h-2.5 rounded-r-full" style={{ width: '20%', float: 'left' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                 <div><span className="inline-block w-2 h-2 mr-2 bg-blue-600 rounded-full"></span>Permanent</div>
                 <div><span className="inline-block w-2 h-2 mr-2 bg-teal-400 rounded-full"></span>Contract</div>
                 <div><span className="inline-block w-2 h-2 mr-2 bg-red-500 rounded-full"></span>Probation</div>
              </div>
               <div className="flex justify-between text-lg font-bold mt-1">
                 <div>232</div>
                 <div>112</div>
                 <div>46</div>
              </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Leave Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
               <div>
                 <p className="text-gray-500 text-sm">Annual Leave</p>
                 <p className="text-lg font-bold">12 Days</p>
                 <a href="#" className="text-sm text-blue-500 flex items-center gap-1">Request Leave <ChevronRight className="w-4 h-4" /></a>
               </div>
                <div>
                 <p className="text-gray-500 text-sm">Sick Leave Used</p>
                 <p className="text-lg font-bold">5 Days</p>
                 <a href="#" className="text-sm text-blue-500 flex items-center gap-1">Request Leave <ChevronRight className="w-4 h-4" /></a>
               </div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle>Employee Satisfactory</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="h-40">
                <Doughnut data={doughnutChartData} options={{ maintainAspectRatio: false }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
