import { Suspense } from "react"
import { SupportTicketsPage } from "@/components/dashboard/support-tickets-page"
import { Loader2 } from "lucide-react"
import { getSupportTickets } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function SupportTicketsRoutePage() {
  const tickets = await getSupportTickets()
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل تذاكر الدعم...</span>
        </div>
      }
    >
      <SupportTicketsPage initialTickets={tickets} />
    </Suspense>
  )
}


