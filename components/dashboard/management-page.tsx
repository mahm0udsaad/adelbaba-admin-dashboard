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

type Member = {
  id: number
  name: string
  email: string
  phone?: string
  roles?: { name: string }[] | string[]
  type: "admin" | "employee"
  is_active: boolean
}

export function ManagementPage({ initialMembers, initialType = "admin" }: { initialMembers?: Member[]; initialType?: "admin" | "employee" }) {
  const [members, setMembers] = useState<Member[]>(initialMembers ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [type, setType] = useState<"admin" | "employee" | "all">((initialType as any) ?? "admin")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialMembers === undefined) {
      const load = async () => {
        try {
          const t = type === "all" ? "admin" : type
          const res = await apiService.fetchManagement(t as any)
          setMembers(res.data.data || res.data)
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load members")
        }
      }
      load()
    }
  }, [initialMembers])

  const filtered = members.filter((m) => {
    const q = searchTerm.toLowerCase()
    const rolesText = Array.isArray(m.roles) ? (m.roles as any[]).map((r: any) => (r?.name || r)).join(",") : ""
    return (
      m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q) || m.phone?.toLowerCase().includes(q) || rolesText.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث بالاسم أو البريد أو الهاتف..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Select onValueChange={(v) => setType(v as any)} defaultValue={initialType}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">المديرون</SelectItem>
            <SelectItem value="employee">الموظفون</SelectItem>
            <SelectItem value="all">الكل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-red-600">{error}</div>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>الأدوار</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.email}</TableCell>
                <TableCell>{m.phone || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {(Array.isArray(m.roles) ? m.roles : []).map((r: any, i: number) => (
                      <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800">
                        {r?.name || r}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{m.type === "admin" ? "مدير" : "موظف"}</TableCell>
                <TableCell>
                  <Badge variant={m.is_active ? "default" : "secondary"} className={m.is_active ? "bg-green-100 text-green-800" : ""}>
                    {m.is_active ? "نشط" : "غير نشط"}
                  </Badge>
                </TableCell>
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


