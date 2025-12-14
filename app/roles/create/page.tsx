import { Suspense } from "react"
import { RoleCreatePage } from "@/components/dashboard/role-create-page"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default function CreateRoleRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
        </div>
      }
    >
      <RoleCreatePage />
    </Suspense>
  )
}

