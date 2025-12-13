"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Loader2, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { apiService } from "@/lib/api"
import Link from "next/link"

type ProductUnit = string | { id?: number; name?: string }

type ProductCategory = string | { id?: number; name?: string; image?: string | null }

type ProductMedia = {
  id: number
  name?: string
  url: string
  type?: string
}

type ProductSku = {
  id: number
  code?: string
  price?: string | number
  inventory?: number
}

type Product = {
  id: number
  name: string
  short_description?: string
  moq?: number
  unit?: ProductUnit
  price_type?: string
  is_active?: boolean
  category?: ProductCategory
  variants_count?: number
}

type ProductDetail = Product & {
  description?: string
  media: ProductMedia[]
  supplier_name?: string
  tiered_prices?: { minQuantity?: number; price?: string | number }[]
  skus?: ProductSku[]
}

function normalizeProductSummary(input: any): Product {
  if (!input) {
    return { id: 0, name: "" }
  }
  const categoryObject = input?.category
  const normalizedCategory: ProductCategory | undefined = categoryObject
    ? { id: categoryObject?.id, name: categoryObject?.name, image: categoryObject?.image }
    : input?.category_name
      ? { name: input.category_name }
      : typeof input?.category === "string"
        ? input.category
        : undefined

  return {
    id: Number(input?.id ?? 0),
    name: input?.name ?? "",
    short_description: input?.short_description ?? input?.description ?? undefined,
    moq: input?.moq != null ? Number(input.moq) : undefined,
    unit:
      typeof input?.unit === "string"
        ? input.unit
        : input?.unit
          ? { id: input.unit?.id, name: input.unit?.name }
          : input?.unit_name
            ? { name: input.unit_name }
            : undefined,
    price_type: input?.price_type ?? input?.pricing_type ?? undefined,
    is_active:
      typeof input?.is_active === "boolean"
        ? input.is_active
        : input?.is_active != null
          ? Boolean(Number(input.is_active))
          : input?.status
            ? String(input.status).toLowerCase() === "active"
            : undefined,
    category: normalizedCategory,
    variants_count:
      input?.variants_count != null
        ? Number(input.variants_count)
        : Array.isArray(input?.skus)
          ? input.skus.length
          : undefined,
  }
}

function normalizeProductList(payload: any): Product[] {
  const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : []
  return items.map(normalizeProductSummary)
}

function normalizeProductDetail(payload: any): ProductDetail {
  const base = normalizeProductSummary(payload)
  const media: ProductMedia[] = Array.isArray(payload?.media)
    ? payload.media
        .filter((item: any) => item?.url)
        .map((item: any) => ({
          id: Number(item?.id ?? Math.random()),
          name: item?.name ?? undefined,
          url: item?.url,
          type: item?.type ?? undefined,
        }))
    : []

  const skus: ProductSku[] | undefined = Array.isArray(payload?.skus)
    ? payload.skus.map((sku: any) => ({
        id: Number(sku?.id ?? 0),
        code: sku?.code ?? undefined,
        price: sku?.price ?? undefined,
        inventory: sku?.inventory != null ? Number(sku.inventory) : undefined,
      }))
    : undefined

  const tieredPrices = Array.isArray(payload?.tieredPrices)
    ? payload.tieredPrices.map((tier: any) => ({
        minQuantity: tier?.minQuantity != null ? Number(tier.minQuantity) : undefined,
        price: tier?.price ?? undefined,
      }))
    : undefined

  return {
    ...base,
    description: payload?.description ?? payload?.long_description ?? base.short_description,
    media,
    supplier_name: payload?.supplier?.name ?? undefined,
    tiered_prices: tieredPrices,
    skus,
  }
}

export function ProductsPage({ initialProducts }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(() => normalizeProductList(initialProducts))
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<{ active?: string; price_type?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null)

  const closeDetail = () => {
    setIsDetailOpen(false)
    setProductDetail(null)
    setDetailError(null)
  }

  const loadProducts = async () => {
    try {
      const res = await apiService.fetchProducts()
      const payload = res?.data ?? res
      setProducts(normalizeProductList(payload))
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to load products")
    }
  }

  useEffect(() => {
    if (initialProducts === undefined) {
      loadProducts()
    }
  }, [initialProducts])

  const handleViewProduct = async (productId: number) => {
    setIsDetailOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    setProductDetail(null)

    try {
      const response = await apiService.fetchProduct(productId)
      const payload = response?.data?.data ?? response?.data ?? response
      setProductDetail(normalizeProductDetail(payload))
    } catch (err: any) {
      setDetailError(err?.response?.data?.message || err?.message || "تعذر تحميل تفاصيل المنتج")
    } finally {
      setDetailLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    return products.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(q)
      const descMatch = p.short_description?.toLowerCase().includes(q)
      const okSearch = !q || nameMatch || descMatch

      const okActive =
        !filters.active ||
        (filters.active === "true" && p.is_active) ||
        (filters.active === "false" && p.is_active === false)

      const okPrice = !filters.price_type || p.price_type === filters.price_type

      return okSearch && okActive && okPrice
    })
  }, [filters.active, filters.price_type, products, searchTerm])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">خطأ في تحميل المنتجات: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث عن منتج..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, price_type: v }))}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="نوع السعر" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">ثابت</SelectItem>
            <SelectItem value="variable">متغير</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, active: v }))}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">نشط</SelectItem>
            <SelectItem value="false">غير نشط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>الوصف المختصر</TableHead>
              <TableHead>الحد الأدنى</TableHead>
              <TableHead>الوحدة</TableHead>
              <TableHead>نوع السعر</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>الفئة</TableHead>
              <TableHead>عدد المتغيرات</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => (window.location.href = `/products/${p.id}`)}>
                <TableCell className="font-medium">
                  <Link href={`/products/${p.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                    {p.name}
                  </Link>
                </TableCell>
                <TableCell className="max-w-xs truncate">{p.short_description || "-"}</TableCell>
                <TableCell>{p.moq ?? "-"}</TableCell>
                <TableCell>{typeof p.unit === "string" ? p.unit : p.unit?.name || "-"}</TableCell>
                <TableCell>{p.price_type || "-"}</TableCell>
                <TableCell>
                  <Badge variant={p.is_active ? "default" : "secondary"} className={p.is_active ? "bg-green-100 text-green-800" : ""}>
                    {p.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
                <TableCell>{typeof p.category === "string" ? p.category : p.category?.name || "-"}</TableCell>
                <TableCell>{p.variants_count ?? 0}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/products/${p.id}`} className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          عرض التفاصيل
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>تعديل</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeDetail()
          } else {
            setIsDetailOpen(true)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{productDetail?.name || "تفاصيل المنتج"}</DialogTitle>
            <DialogDescription>
              {productDetail?.category && typeof productDetail.category !== "string"
                ? productDetail.category?.name
                : typeof productDetail?.category === "string"
                  ? productDetail.category
                  : ""}
            </DialogDescription>
          </DialogHeader>

          {detailLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-gray-600">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              جاري تحميل تفاصيل المنتج...
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{detailError}</div>
          )}

          {!detailLoading && !detailError && productDetail && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-gray-500">الوصف</h3>
                <p className="mt-1 text-sm text-gray-700">
                  {productDetail.description || productDetail.short_description || "لا يوجد وصف متاح."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 text-sm">
                  <div className="text-gray-500">الحد الأدنى للطلب</div>
                  <div className="font-medium">{productDetail.moq ?? "-"}</div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-500">نوع السعر</div>
                  <div className="font-medium">{productDetail.price_type || "-"}</div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-500">الوحدة</div>
                  <div className="font-medium">
                    {typeof productDetail.unit === "string"
                      ? productDetail.unit
                      : productDetail.unit?.name || "-"}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="text-gray-500">المورد</div>
                  <div className="font-medium">{productDetail.supplier_name || "-"}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm text-gray-500">الصور</h3>
                {productDetail.media.length ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {productDetail.media.map((media) => (
                      <div key={media.id} className="relative h-32 w-full overflow-hidden rounded-md border">
                        <Image
                          src={media.url}
                          alt={media.name || productDetail.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">لا توجد صور مرفقة لهذا المنتج.</p>
                )}
              </div>

              {productDetail.skus && productDetail.skus.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm text-gray-500">المتغيرات</h3>
                  <div className="max-h-56 overflow-auto rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>الكود</TableHead>
                          <TableHead>السعر</TableHead>
                          <TableHead>المخزون</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {productDetail.skus.map((sku) => (
                          <TableRow key={sku.id}>
                            <TableCell>{sku.code || "-"}</TableCell>
                            <TableCell>{sku.price ?? "-"}</TableCell>
                            <TableCell>{sku.inventory ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {productDetail.tiered_prices && productDetail.tiered_prices.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm text-gray-500">التسعير حسب الكمية</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {productDetail.tiered_prices.map((tier, index) => (
                      <div key={index} className="rounded-md border p-3 text-sm">
                        <div className="text-gray-500">الحد الأدنى: {tier.minQuantity ?? "-"}</div>
                        <div className="font-medium">السعر: {tier.price ?? "-"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
