import { Suspense } from "react"
import { CategoriesManagementPage } from "@/components/dashboard/categories-management-page"
import { Loader2 } from "lucide-react"
import { getCategories } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function CategoriesRoutePage() {
  const categories = await getCategories()
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل الفئات...</span>
        </div>
      }
    >
      <CategoriesManagementPage initialCategories={categories} />
    </Suspense>
  )
}
