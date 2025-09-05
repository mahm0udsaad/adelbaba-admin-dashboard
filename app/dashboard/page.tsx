import { Suspense } from "react"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { Loader2 } from "lucide-react"
import { getDashboardOverviewData } from "@/lib/server-actions"

export default async function DashboardPage() {
  const { companies, users, tickets } = await getDashboardOverviewData()
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل لوحة التحكم...</span>
        </div>
      }
    >
      <DashboardOverview initialCompanies={companies} initialUsers={users} initialTickets={tickets} />
    </Suspense>
  )
}


