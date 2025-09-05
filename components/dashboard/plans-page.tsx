"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiService } from "@/lib/api"

type Plan = {
  id: number
  name: string
  payment_rate?: string
  price?: number
  support_level?: string
  features?: any[]
}

export function PlansPage({ initialPlans }: { initialPlans?: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialPlans === undefined) {
      const load = async () => {
        try {
          const res = await apiService.fetchPlans()
          setPlans(res.data.data || res.data)
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load plans")
        }
      }
      load()
    }
  }, [initialPlans])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">خطأ في تحميل الخطط: {error}</p>
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
          placeholder="ابحث عن خطة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rtl:pl-3 rtl:pr-10"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>معدل الدفع</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>مستوى الدعم</TableHead>
              <TableHead>عدد الميزات</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans
              .filter((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.payment_rate || "-"}</TableCell>
                  <TableCell>{plan.price ?? "-"}</TableCell>
                  <TableCell>{plan.support_level || "-"}</TableCell>
                  <TableCell>{plan.features?.length ?? 0}</TableCell>
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


