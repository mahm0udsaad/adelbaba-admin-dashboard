"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiService } from "@/lib/api"

type Ad = {
  id: number
  title: string
  status?: string
  type?: string
  location?: string
  starts_at?: string
  ends_at?: string
  target_url?: string
}

export function AdsPage({ initialAds }: { initialAds?: Ad[] }) {
  const [ads, setAds] = useState<Ad[]>(initialAds ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<{ status?: string; type?: string; location?: string }>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialAds === undefined) {
      const load = async () => {
        try {
          const res = await apiService.fetchAds()
          setAds(res.data.data || res.data)
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load ads")
        }
      }
      load()
    }
  }, [initialAds])

  const filtered = ads.filter((a) => {
    const q = searchTerm.toLowerCase()
    const okSearch = a.title?.toLowerCase().includes(q) || a.target_url?.toLowerCase().includes(q)
    const okStatus = !filters.status || a.status === filters.status
    const okType = !filters.type || a.type === filters.type
    const okLoc = !filters.location || a.location === filters.location
    return okSearch && okStatus && okType && okLoc
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث بعنوان الإعلان أو الرابط..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="inactive">غير نشط</SelectItem>
            <SelectItem value="finished">منتهي</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="النوع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="banner">لافتة</SelectItem>
            <SelectItem value="slideshow">شرائح</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(v) => setFilters((f) => ({ ...f, location: v }))}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="الموضع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="header">رأس الصفحة</SelectItem>
            <SelectItem value="footer">تذييل الصفحة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>العنوان</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الموضع</TableHead>
              <TableHead>تاريخ البدء</TableHead>
              <TableHead>تاريخ الانتهاء</TableHead>
              <TableHead>الرابط</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell>{ad.status || "-"}</TableCell>
                <TableCell>{ad.type || "-"}</TableCell>
                <TableCell>{ad.location || "-"}</TableCell>
                <TableCell>
                  {ad.starts_at
                    ? new Intl.DateTimeFormat("ar-SA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        calendar: "gregory",
                      }).format(new Date(ad.starts_at))
                    : "-"}
                </TableCell>
                <TableCell>
                  {ad.ends_at
                    ? new Intl.DateTimeFormat("ar-SA", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        calendar: "gregory",
                      }).format(new Date(ad.ends_at))
                    : "-"}
                </TableCell>
                <TableCell className="truncate max-w-[200px]">{ad.target_url || "-"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>عرض الوسائط</DropdownMenuItem>
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


