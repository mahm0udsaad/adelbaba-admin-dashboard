"use client"

import { useState, Suspense } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Building2,
  Users,
  Shield,
  UserCog,
  Headphones,
  CreditCard,
  Star,
  Megaphone,
  Package,
  Palette,
  Settings,
  Filter,
  BarChart3,
  Loader2,
  Layers,
} from "lucide-react"

import { DashboardOverview } from "./dashboard/dashboard-overview"
import { CompaniesPage } from "./dashboard/companies-page"
import { UsersPage } from "./dashboard/users-page"
import { SupportTicketsPage } from "./dashboard/support-tickets-page"
import { CategoriesPage } from "./dashboard/categories-page"

const navigation = [
  { name: "Dashboard", icon: BarChart3, id: "dashboard" },
  { name: "Companies", icon: Building2, id: "companies" },
  { name: "Users", icon: Users, id: "users" },
  { name: "Roles & Permissions", icon: Shield, id: "roles" },
  { name: "Admins & Employees", icon: UserCog, id: "admins" },
  { name: "Support Tickets", icon: Headphones, id: "tickets" },
  { name: "Subscription Plans", icon: CreditCard, id: "plans" },
  { name: "Subscription Features", icon: Star, id: "features" },
  { name: "Ads", icon: Megaphone, id: "ads" },
  { name: "Categories", icon: Layers, id: "categories" },
  { name: "Units", icon: Package, id: "units" },
  { name: "Variations", icon: Palette, id: "variations" },
  { name: "Variation Values", icon: Settings, id: "variation-values" },
  { name: "Products", icon: Package, id: "products" },
]

const LoadingFallback = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
    <span className="ml-2 text-amber-800">{message}</span>
  </div>
)

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Suspense fallback={<LoadingFallback message="Loading dashboard..." />}>
            <DashboardOverview />
          </Suspense>
        )
      case "companies":
        return (
          <Suspense fallback={<LoadingFallback message="Loading companies..." />}>
            <CompaniesPage />
          </Suspense>
        )
      case "users":
        return (
          <Suspense fallback={<LoadingFallback message="Loading users..." />}>
            <UsersPage />
          </Suspense>
        )
      case "tickets":
        return (
          <Suspense fallback={<LoadingFallback message="Loading support tickets..." />}>
            <SupportTicketsPage />
          </Suspense>
        )
      case "categories":
        return (
          <Suspense fallback={<LoadingFallback message="Loading categories..." />}>
            <CategoriesPage />
          </Suspense>
        )
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>
                This section is under development. The {navigation.find((nav) => nav.id === activeTab)?.name} module
                will be available soon.
              </CardDescription>
            </CardHeader>
          </Card>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900">Adelbaba</h1>
              <p className="text-sm text-amber-600">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white"
                    : "text-gray-700 hover:bg-amber-50 hover:text-amber-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigation.find((nav) => nav.id === activeTab)?.name || "Dashboard"}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === "dashboard" && "Overview of your admin activities and system performance"}
                {activeTab === "companies" && "Manage registered companies and their information"}
                {activeTab === "users" && "Manage user accounts and permissions"}
                {activeTab === "tickets" && "Handle customer support requests and issues"}
                {activeTab === "categories" && "Organize product categories and featured listings"}
                {!["dashboard", "companies", "users", "tickets", "categories"].includes(activeTab) &&
                  "Manage system resources and configurations"}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
                Add New
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>
    </div>
  )
}
