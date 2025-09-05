"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiService } from "@/lib/api"

type Product = {
  id: number
  name: string
  short_description?: string
  moq?: number
  unit?: string | { id: number; name: string }
  price_type?: string
  is_active?: boolean
  category?: string | { id: number; name: string; image?: string }
  variants_count?: number
}

export function ProductsPage({ initialProducts }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<{ active?: string; price_type?: string }>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialProducts === undefined) {
      const load = async () => {
        try {
          const res = await apiService.fetchProducts()
          setProducts(res.data.data || res.data)
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load products")
        }
      }
      load()
    }
  }, [initialProducts])

  const filtered = products.filter((p) => {
    const q = searchTerm.toLowerCase()
    const okSearch = p.name?.toLowerCase().includes(q) || p.short_description?.toLowerCase().includes(q)
    const okActive = !filters.active || String(p.is_active) === String(filters.active === "true")
    const okPrice = !filters.price_type || p.price_type === filters.price_type
    return okSearch && okActive && okPrice
  })

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
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
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
                      <DropdownMenuItem>عرض</DropdownMenuItem>
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
    </div>
  )
}


