import { Suspense } from "react"
import { VariationValuesPage } from "@/components/dashboard/variation-values-page"
import { Loader2 } from "lucide-react"
import { getVariationValues } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

interface Props {
  params: { variationId: string }
}

export default async function VariationValuesRoutePage({ params }: Props) {
  const values = await getVariationValues(params.variationId)
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل قيم الخاصية...</span>
        </div>
      }
    >
      <VariationValuesPage initialValues={values} />
    </Suspense>
  )
}


