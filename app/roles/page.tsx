import { Suspense } from "react"
import { RolesPage } from "@/components/dashboard/roles-page"
import { Loader2 } from "lucide-react"
import { getRoles } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function RolesRoutePage() {
  const roles = await getRoles()
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل الأدوار...</span>
        </div>
      }
    >
      <RolesPage initialRoles={roles} />
    </Suspense>
  )
}


