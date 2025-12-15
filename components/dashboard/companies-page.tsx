"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { apiService } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Company {
  id: number
  name: string
  logo?: string
  commercial_register?: string
  description?: string
  founded_year?: number
  headquarters?: string
  contact_phone?: string
  contact_email?: string
  phone?: string
  email?: string
  region?: string
  state?: string
  city?: string
  created_at?: string
  is_active: boolean
  is_verified: boolean
}

export function CompaniesPage({ initialCompanies }: { initialCompanies?: Company[] }) {
  function normalizeCompany(input: any): Company {
    const cityName = input?.city?.name || input?.city_name || input?.city
    const stateName = input?.state?.name || input?.state_name || input?.state
    const regionName = input?.region?.name || input?.region_name || input?.region
    const email =
      input?.contact_email || input?.email || input?.contact?.email || input?.owner?.email || input?.owner_email
    const phone = input?.contact_phone || input?.phone || input?.owner?.phone || input?.owner_phone

    return {
      id: Number(input?.id),
      name: input?.name ?? "",
      logo: input?.logo || undefined,
      commercial_register: input?.commercial_register || undefined,
      description: input?.short_description || input?.description || undefined,
      founded_year: input?.founded_year ? Number(input?.founded_year) : undefined,
      headquarters: input?.headquarters || undefined,
      contact_email: email || undefined,
      email: email || undefined,
      contact_phone: phone || undefined,
      phone: phone || undefined,
      region: regionName || undefined,
      state: stateName || undefined,
      city: cityName || undefined,
      created_at: input?.created_at || undefined,
      is_active: Boolean(input?.is_active),
      is_verified: Boolean(input?.is_verified),
    }
  }

  function normalizeCompanies(list: any[]): Company[] {
    if (!Array.isArray(list)) return []
    return list.map((item) => normalizeCompany(item))
  }

  const [companies, setCompanies] = useState<Company[]>(normalizeCompanies((initialCompanies as any) ?? []))
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null)
  const [confirmState, setConfirmState] = useState<{ open: boolean; id: number | null; name: string }>(
    { open: false, id: null, name: "" },
  )

  // Optional client-side fetch only if no initial data provided
  useEffect(() => {
    if (initialCompanies === undefined) {
      const loadCompanies = async () => {
        try {
          const response = await apiService.fetchCompanies()
          const payload = response?.data?.data || response?.data
          setCompanies(normalizeCompanies(payload))
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || "Failed to load companies")
        }
      }
      loadCompanies()
    }
  }, [initialCompanies])

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">Error loading companies: {error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  const handleDelete = async (companyId: number) => {
    try {
      setIsDeletingId(companyId)
      await apiService.deleteCompany(companyId)
      setCompanies((prev) => prev.filter((c) => c.id !== companyId))
      toast({ title: "تم الحذف", description: "تم حذف الشركة بنجاح" })
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "فشل حذف الشركة"
      toast({ title: "خطأ", description: message, variant: "destructive" })
    } finally {
      setIsDeletingId(null)
    }
  }

  const onConfirmDelete = async () => {
    if (confirmState.id == null) return
    await handleDelete(confirmState.id)
    setConfirmState({ open: false, id: null, name: "" })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="ابحث عن شركة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="تصفية حسب المنطقة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المناطق</SelectItem>
            <SelectItem value="middle-east">الشرق الأوسط</SelectItem>
            <SelectItem value="africa">أفريقيا</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشطة</SelectItem>
            <SelectItem value="inactive">غير نشطة</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المعرف</TableHead>
              <TableHead>الشعار + اسم الشركة</TableHead>
              <TableHead>رقم السجل التجاري</TableHead>
              <TableHead>الدولة</TableHead>
              <TableHead>المدينة</TableHead>
              <TableHead>الهاتف</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>تاريخ الإنشاء</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies
              .filter(
                (company) =>
                  company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  company.email?.toLowerCase().includes(searchTerm.toLowerCase()),
              )
              .map((company) => {
                const formatDate = (dateString?: string) => {
                  if (!dateString) return "N/A"
                  try {
                    const date = new Date(dateString)
                    return new Intl.DateTimeFormat("ar-SA", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      calendar: "gregory",
                    }).format(date)
                  } catch {
                    return dateString
                  }
                }

                return (
                  <TableRow key={company.id} className="cursor-pointer" onClick={() => (window.location.href = `/companies/${company.id}`)}>
                    <TableCell className="font-medium">{company.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={company.logo} alt={company.name} />
                            <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        <Link href={`/companies/${company.id}`} className="hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                          {company.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>{company.commercial_register || "N/A"}</TableCell>
                    <TableCell>{company.region || "N/A"}</TableCell>
                    <TableCell>{company.city || "N/A"}</TableCell>
                    <TableCell>{company.phone || company.contact_phone || "N/A"}</TableCell>
                    <TableCell>{company.email || company.contact_email || "N/A"}</TableCell>
                    <TableCell>{formatDate(company.created_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.location.href = `/companies/${company.id}` }}>
                            <Eye className="mr-2 h-4 w-4" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit className="mr-2 h-4 w-4" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmState({ open: true, id: company.id, name: company.name })
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog open={confirmState.open} onOpenChange={(o) => setConfirmState((s) => ({ ...s, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف الشركة {confirmState.name ? `"${confirmState.name}"` : ""}؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingId !== null}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} disabled={isDeletingId !== null}>
              {isDeletingId !== null ? "جارٍ الحذف..." : "تأكيد الحذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
