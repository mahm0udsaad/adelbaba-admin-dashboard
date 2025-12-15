"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Headphones, CreditCard, TrendingUp, Clock, CheckCircle } from "lucide-react"
// Server-fetched data is passed in via props

interface Company {
  id: number
  name: string
  is_active: boolean
}

interface User {
  id: number
  name: string
  is_active: boolean
}

interface SupportTicket {
  id: number
  status: string
}

export function DashboardOverview({
  initialCompanies,
  initialUsers,
  initialTickets,
}: {
  initialCompanies: Company[]
  initialUsers: User[]
  initialTickets: SupportTicket[]
}) {
  const totalCompanies = useMemo(() => initialCompanies.length, [initialCompanies])
  const totalUsers = useMemo(() => initialUsers.length, [initialUsers])
  const openTickets = useMemo(
    () => initialTickets.filter((t) => t.status === "open").length,
    [initialTickets],
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-4">
        <Card className="border-blue-200 bg-blue-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCompanies}</div>
            <p className="text-xs text-white">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Live data from API
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
            <Users className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
            <p className="text-xs text-white">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Live data from API
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Open Tickets</CardTitle>
            <Headphones className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{openTickets}</div>
            <p className="text-xs text-white">
              <Clock className="inline h-3 w-3 mr-1" />
              Live data from API
            </p>
          </CardContent>
        </Card>

          <Card className="border-red-200 bg-red-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">System Status</CardTitle>
            <CreditCard className="h-4 w-4 text-white" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Online</div>
            <p className="text-xs text-white">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              API Connected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-black font-bold">Recent Activity</CardTitle>
            <CardDescription>Latest system activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New company verified</p>
                  <p className="text-xs text-muted-foreground">TechCorp Industries - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Support ticket created</p>
                  <p className="text-xs text-muted-foreground">Payment processing issue - 4 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
              <CardTitle className="text-black font-bold">System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response Time</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Good
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Performance</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Optimal
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Load</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Moderate
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
