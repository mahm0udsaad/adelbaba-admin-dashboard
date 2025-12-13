import { Suspense } from "react"
import { SectionsPage } from "@/components/dashboard/sections-page"
import { Loader2 } from "lucide-react"
import { getSections } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function SectionsRoutePage() {
  const sections = await getSections()
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل الأقسام...</span>
        </div>
      }
    >
      <SectionsPage initialSections={sections} />
    </Suspense>
  )
}

