"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const statuses = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "under_review", label: "قيد المراجعة" },
  { value: "needs_more_info", label: "بحاجة لمزيد من المعلومات" },
  { value: "approved", label: "مقبول" },
  { value: "rejected", label: "مرفوض" },
]

export default function FiltersBar({ initialParams }: { initialParams?: Record<string, any> }) {
  const router = useRouter()
  const params = useSearchParams()

  const [status, setStatus] = useState<string>(String(initialParams?.status ?? params.get("status") ?? "all"))
  const [companyId, setCompanyId] = useState<string>(String(initialParams?.company_id ?? params.get("company_id") ?? ""))
  const [verifiedBy, setVerifiedBy] = useState<string>(String(initialParams?.verified_by ?? params.get("verified_by") ?? ""))
  const [perPage, setPerPage] = useState<string>(String(initialParams?.per_page ?? params.get("per_page") ?? "20"))

  const buildQuery = () => {
    const usp = new URLSearchParams()
    if (status && status !== "all") usp.set("status", status)
    if (companyId) usp.set("company_id", companyId)
    if (verifiedBy) usp.set("verified_by", verifiedBy)
    if (perPage) usp.set("per_page", perPage)
    usp.set("page", "1")
    return usp.toString()
  }

  const apply = () => {
    router.push(`/admin/verification/requests?${buildQuery()}`)
  }

  const reset = () => {
    router.push(`/admin/verification/requests`)
  }

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="رقم الشركة" />
        <Input value={verifiedBy} onChange={(e) => setVerifiedBy(e.target.value)} placeholder="المراجع" />
        <Select value={perPage} onValueChange={setPerPage}>
          <SelectTrigger>
            <SelectValue placeholder="لكل صفحة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2 justify-end">
          <Button onClick={apply} className="min-w-24">بحث</Button>
          <Button variant="outline" onClick={reset} className="min-w-24">إعادة ضبط</Button>
        </div>
      </div>
    </Card>
  )
}


