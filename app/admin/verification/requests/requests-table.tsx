"use client"

import { type Paginated, type SupplierRequest } from "@/lib/server-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Check, X } from "lucide-react"
import { useMemo, useOptimistic, useState } from "react"
import RequestDialog from "./request-dialog"
import { toast } from "@/components/ui/use-toast"
import { updateVerificationRequest } from "@/lib/server-actions"
import Link from "next/link"

function statusVariant(status: string) {
  switch (status) {
    case "pending":
      return "warning"
    case "under_review":
      return "secondary"
    case "needs_more_info":
      return "outline"
    case "approved":
      return "default"
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function RequestsTable({ payload, params, quickAction, updateAction }: { payload: Paginated<SupplierRequest>; params: any; quickAction?: any; updateAction?: any }) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [optimistic, setOptimistic] = useOptimistic(payload.data, (state, next: { id: number; status: string; reason?: string }) => {
    return state.map((r) => (r.id === next.id ? { ...r, status: next.status as any, reason: next.reason ?? r.reason } : r))
  })

  const onQuick = async (id: number, status: "approved" | "rejected") => {
    try {
      if (status === "rejected") {
        const reason = prompt("أدخل سبب الرفض:") || ""
        if (!reason.trim()) return toast({ title: "سبب مطلوب", description: "يرجى كتابة سبب الرفض" })
        setOptimistic({ id, status, reason })
        if (quickAction) {
          const fd = new FormData()
          fd.set("id", String(id))
          fd.set("status", status)
          fd.set("reason", reason)
          await quickAction({}, fd)
        } else {
          await updateVerificationRequest(id, { status, reason })
        }
      } else {
        setOptimistic({ id, status })
        if (quickAction) {
          const fd = new FormData()
          fd.set("id", String(id))
          fd.set("status", status)
          await quickAction({}, fd)
        } else {
          await updateVerificationRequest(id, { status })
        }
      }
      toast({ title: "تم الحفظ", description: "تم تحديث حالة الطلب" })
    } catch (e: any) {
      toast({ title: "فشل التحديث", description: e.message, variant: "destructive" })
    }
  }

  const rows = optimistic

  if (!rows.length) {
    return (
      <div className="p-8 text-center">
        <div className="text-lg mb-2">لا توجد طلبات مطابقة</div>
        <Link href="/admin/verification/requests" className="text-primary underline">
          مسح عوامل التصفية
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>رقم الطلب</TableHead>
            <TableHead>الشركة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>التواريخ</TableHead>
            <TableHead>المراجع</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>#{r.id}</TableCell>
              <TableCell className="flex items-center gap-2">
                <img src={r.company?.logo || "/placeholder-logo.png"} alt="logo" className="size-8 rounded" />
                <span>{r.company?.name}</span>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(r.status) as any}>{r.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="text-sm">{new Date(r.created_at).toLocaleDateString()}</div>
                <div className="text-xs text-muted-foreground">تحديث: {new Date(r.updated_at).toLocaleDateString()}</div>
              </TableCell>
              <TableCell>
                {r.verifiedBy ? (
                  <div className="flex items-center gap-2">
                    <img src={r.verifiedBy.picture || "/placeholder-user.jpg"} className="size-6 rounded-full" />
                    <span className="text-sm">{r.verifiedBy.name}</span>
                  </div>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setOpenId(r.id)}>
                    <Eye className="h-4 w-4 ml-1" /> عرض
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onQuick(r.id, "approved")}>
                    <Check className="h-4 w-4 ml-1" /> قبول سريع
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onQuick(r.id, "rejected")}>
                    <X className="h-4 w-4 ml-1" /> رفض سريع
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOpenId(r.id)}>عرض</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onQuick(r.id, "approved")}>قبول</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onQuick(r.id, "rejected")} className="text-red-600">
                        رفض
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {openId !== null && (
        <RequestDialog
          id={openId}
          open={openId !== null}
          onOpenChange={(o) => (!o ? setOpenId(null) : null)}
          onUpdated={(next) => setOptimistic({ id: next.id, status: next.status, reason: next.reason || undefined })}
          updateAction={updateAction}
        />
      )}
    </div>
  )
}


