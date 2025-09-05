import { Suspense } from "react"
import { CompaniesPage } from "@/components/dashboard/companies-page"
import { Loader2 } from "lucide-react"
import { getCompanies } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function CompaniesRoutePage() {
  const companies = await getCompanies()
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل الشركات...</span>
        </div>
      }
    >
      <CompaniesPage initialCompanies={companies} />
    </Suspense>
  )
}


