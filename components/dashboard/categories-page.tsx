"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiService } from "@/lib/api"

interface Category {
  id: number
  name: {
    ar: string
    en: string
  }
  is_featured: boolean
  image?: string | null
  parent_name?: {
    ar: string
    en: string
  } | null
  created_at?: string
  updated_at?: string
}

function normalizeCategory(payload: any): Category {
  // Handle both old string format and new bilingual object format
  const normalizeName = (nameValue: any) => {
    if (typeof nameValue === 'object' && nameValue !== null) {
      return {
        ar: nameValue.ar || '',
        en: nameValue.en || ''
      }
    }
    // Fallback for old string format
    return {
      ar: String(nameValue || ''),
      en: String(nameValue || '')
    }
  }

  return {
    id: Number(payload?.id),
    name: normalizeName(payload?.name),
    is_featured: Boolean(payload?.is_featured ?? payload?.featured),
    image: payload?.image ?? payload?.thumbnail ?? null,
    parent_name: payload?.parent?.name ? normalizeName(payload.parent.name) : null,
    created_at: payload?.created_at,
    updated_at: payload?.updated_at,
  }
}

export function CategoriesPage({ initialCategories }: { initialCategories?: any }) {
  const [categories, setCategories] = useState<Category[]>(() => {
    if (!initialCategories) return []
    if (Array.isArray(initialCategories?.data)) {
      return initialCategories.data.map(normalizeCategory)
    }
    if (Array.isArray(initialCategories)) {
      return initialCategories.map(normalizeCategory)
    }
    return []
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "non-featured">("all")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const response = await apiService.fetchCategories()
      const payload = response?.data?.data ?? response?.data
      setCategories(Array.isArray(payload) ? payload.map(normalizeCategory) : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialCategories === undefined) {
      loadCategories()
    }
  }, [initialCategories])

  const filteredCategories = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return categories.filter((category) => {
      const matchesSearch =
        !term ||
        category.name.ar.toLowerCase().includes(term) ||
        category.name.en.toLowerCase().includes(term) ||
        category.parent_name?.ar.toLowerCase().includes(term) ||
        category.parent_name?.en.toLowerCase().includes(term)

      const matchesFeatured =
        featuredFilter === "all" ||
        (featuredFilter === "featured" && category.is_featured) ||
        (featuredFilter === "non-featured" && !category.is_featured)

      return matchesSearch && matchesFeatured
    })
  }, [categories, searchTerm, featuredFilter])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error loading categories: {error}</p>
        <Button onClick={loadCategories} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="ابحث عن تصنيف..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Select value={featuredFilter} onValueChange={(value) => setFeaturedFilter(value as any)}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التصنيفات</SelectItem>
            <SelectItem value="featured">مميزة</SelectItem>
            <SelectItem value="non-featured">غير مميزة</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={loadCategories}
          disabled={loading}
        >
          تحديث القائمة
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الصورة</TableHead>
              <TableHead>الاسم (عربي)</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead>التصنيف الرئيسي</TableHead>
              <TableHead>مميزة؟</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  {category.image ? (
                    <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                      <Image src={category.image} alt={category.name.ar || category.name.en} fill sizes="40px" className="object-cover" />
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">لا توجد صورة</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm">{category.name.ar || "—"}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-sm">{category.name.en || "—"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {category.parent_name ? (
                    <div className="flex flex-col text-xs">
                      <span>{category.parent_name.ar || "—"}</span>
                      <span className="text-gray-500">{category.parent_name.en || "—"}</span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={category.is_featured ? "default" : "secondary"} className={category.is_featured ? "bg-amber-100 text-amber-800" : ""}>
                    {category.is_featured ? "مميزة" : "عادية"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {category.created_at
                    ? new Intl.DateTimeFormat("ar-SA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        calendar: "gregory",
                      }).format(new Date(category.created_at))
                    : "—"}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>عرض التفاصيل</DropdownMenuItem>
                      <DropdownMenuItem>تعديل</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">حذف</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredCategories.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-500">
                  لا توجد تصنيفات مطابقة للبحث الحالي.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

