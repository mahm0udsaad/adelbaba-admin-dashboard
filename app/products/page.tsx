import { Suspense } from "react"
import { ProductsPage } from "@/components/dashboard/products-page"
import { Loader2 } from "lucide-react"
import { getProducts } from "@/lib/server-actions"

export const dynamic = "force-dynamic"

export default async function ProductsRoutePage() {
  const products = await getProducts()
  console.log(products[0])
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري تحميل المنتجات...</span>
        </div>
      }
    >
      <ProductsPage initialProducts={products} />
    </Suspense>
  )
}


