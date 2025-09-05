"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiService } from "@/lib/api"

type VariationValue = { id: number; value: string }

export function VariationValuesPage({ initialValues }: { initialValues?: VariationValue[] }) {
  const params = useParams<{ variationId: string }>()
  const variationId = Number(params.variationId)
  const [values, setValues] = useState<VariationValue[]>(initialValues ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialValues === undefined && variationId) {
      const load = async () => {
        try {
          const res = await apiService.fetchVariationValues(variationId)
          setValues(res.data.data || res.data)
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load variation values")
        }
      }
      load()
    }
  }, [initialValues, variationId])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">خطأ في تحميل القيم: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="ابحث عن قيمة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rtl:pl-3 rtl:pr-10"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>القيمة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values
              .filter((v) => v.value?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">{v.value}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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


