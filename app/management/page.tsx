import { Suspense } from "react"
import { ManagementPage } from "@/components/dashboard/management-page"
import { Loader2 } from "lucide-react"
import { getManagement } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function ManagementRoutePage() {
  const members = await getManagement({ type: "admin" })
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل الإدارة والموظفين...</span>
        </div>
      }
    >
      <ManagementPage initialMembers={members} initialType="admin" />
    </Suspense>
  )
}


