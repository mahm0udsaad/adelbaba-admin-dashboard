import { Suspense } from "react"
import { EmployeesPage } from "@/components/dashboard/employees-page"
import { Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EmployeesRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل الموظفين...</span>
        </div>
      }
    >
      <EmployeesPage />
    </Suspense>
  )
}

