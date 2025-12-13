"use client"

import { type Paginated, type SupplierRequest } from "@/lib/server-actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Check, X } from "lucide-react"
import { useOptimistic, useState, useTransition } from "react"
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

export default function RequestsTable({ 
  payload, 
  params, 
  quickAction, 
  updateAction,
  onDataChange 
}: { 
  payload: Paginated<SupplierRequest>
  params: any
  quickAction?: any
  updateAction?: any
  onDataChange?: () => void // Add callback to refresh data
}) {
  const [openId, setOpenId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()
  
  const [optimisticData, setOptimisticData] = useOptimistic(
    payload.data, 
    (state, next: { id: number; status: string; reason?: string }) => {
      return state.map((r) => (r.id === next.id ? { ...r, status: next.status as any, reason: next.reason ?? r.reason } : r))
    }
  )

  const onQuick = async (id: number, status: "approved" | "rejected") => {
    try {
      let reason: string | undefined

      if (status === "rejected") {
        reason = prompt("أدخل سبب الرفض:") || ""
        if (!reason.trim()) {
          toast({ title: "سبب مطلوب", description: "يرجى كتابة سبب الرفض" })
          return
        }
      }

      // Optimistically update the UI
      startTransition(() => {
        setOptimisticData({ id, status, reason })
      })

      // Perform the server action
      if (quickAction) {
        const fd = new FormData()
        fd.set("id", String(id))
        fd.set("status", status)
        if (reason) fd.set("reason", reason)
        await quickAction({}, fd)
      } else {
        await updateVerificationRequest(id, { status, reason })
      }

      // Refresh the data from the server
      if (onDataChange) {
        onDataChange()
      }

      toast({ 
        title: "تم الحفظ", 
        description: "تم تحديث حالة الطلب" 
      })
    } catch (e: any) {
      toast({ 
        title: "فشل التحديث", 
        description: e.message, 
        variant: "destructive" 
      })
    }
  }

  const handleDialogUpdate = (next: { id: number; status: string; reason?: string }) => {
    startTransition(() => {
      setOptimisticData(next)
    })
    
    // Refresh the data from the server
    if (onDataChange) {
      onDataChange()
    }
  }

  if (!optimisticData.length) {
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
            <TableHead>اسم الشركة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الدولة</TableHead>
            <TableHead>المدينة</TableHead>
            <TableHead>السجل التجاري</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {optimisticData.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="flex items-center gap-2">
                <img src={r.company?.logo || "/placeholder-logo.png"} alt="logo" className="size-8 rounded" />
                <span>{r.company?.name}</span>
              </TableCell>
              <TableCell>
                <Badge className="text-white" variant={statusVariant(r.status) as any}>{r.status}</Badge>
              </TableCell>
              <TableCell>
                {r.company?.region?.name || "—"}
              </TableCell>
              <TableCell>
                {r.company?.location || "—"}
              </TableCell>
              <TableCell>
                {r.company?.commercial_register || "—"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setOpenId(r.id)}
                    disabled={isPending}
                  >
                    <Eye className="h-4 w-4 ml-1" /> عرض
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 text-white" 
                    onClick={() => onQuick(r.id, "approved")}
                    disabled={isPending}
                  >
                    <Check className="h-4 w-4 ml-1" /> قبول سريع
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => onQuick(r.id, "rejected")}
                    disabled={isPending}
                  >
                    <X className="h-4 w-4 ml-1" /> رفض سريع
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" disabled={isPending}>
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
          onUpdated={handleDialogUpdate}
          updateAction={updateAction}
        />
      )}
    </div>
  )
}