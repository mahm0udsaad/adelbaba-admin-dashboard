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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Total Companies</CardTitle>
            <Building2 className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{totalCompanies}</div>
            <p className="text-xs text-amber-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Live data from API
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Active Users</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{totalUsers}</div>
            <p className="text-xs text-amber-600">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Live data from API
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Open Tickets</CardTitle>
            <Headphones className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{openTickets}</div>
            <p className="text-xs text-amber-600">
              <Clock className="inline h-3 w-3 mr-1" />
              Live data from API
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">System Status</CardTitle>
            <CreditCard className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">Online</div>
            <p className="text-xs text-amber-600">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              API Connected
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-900">Recent Activity</CardTitle>
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
            <CardTitle className="text-amber-900">System Status</CardTitle>
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
