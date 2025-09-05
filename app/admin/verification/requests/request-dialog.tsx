"use client"

import { useEffect, useState, useActionState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getVerificationRequest, updateVerificationRequest, type SupplierRequest } from "@/lib/server-actions"

export default function RequestDialog({ id, open, onOpenChange, onUpdated, updateAction }: { id: number; open: boolean; onOpenChange: (o: boolean) => void; onUpdated: (r: SupplierRequest) => void; updateAction?: any }) {
  const [data, setData] = useState<SupplierRequest | null>(null)
  const [status, setStatus] = useState<string>("under_review")
  const [reason, setReason] = useState<string>("")
  const [pending, setPending] = useState(false)
  const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
    if (!updateAction) return prev
    return await updateAction(prev, formData)
  }, { ok: false } as any)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const res = await getVerificationRequest(id)
        if (!mounted) return
        setData(res)
        setStatus(res.status)
        setReason(res.reason || "")
      } catch (e: any) {
        toast({ title: "فشل التحميل", description: e.message, variant: "destructive" })
      }
    }
    if (open) load()
    return () => {
      mounted = false
    }
  }, [id, open])

  const save = async () => {
    if (["rejected", "needs_more_info"].includes(status) && !reason.trim()) {
      return toast({ title: "سبب مطلوب", description: "الرجاء إدخال السبب" })
    }
    try {
      setPending(true)
      let res: SupplierRequest
      if (updateAction) {
        const fd = new FormData()
        fd.set("id", String(id))
        fd.set("status", status)
        if (reason) fd.set("reason", reason)
        const out = await updateAction({}, fd)
        res = out?.data
      } else {
        res = await updateVerificationRequest(id, { status: status as any, ...(reason ? { reason } : {}) })
      }
      onUpdated(res)
      toast({ title: "تم الحفظ", description: "تم تحديث حالة الطلب" })
      onOpenChange(false)
    } catch (e: any) {
      toast({ title: "فشل التحديث", description: e.message, variant: "destructive" })
    } finally {
      setPending(false)
    }
  }

  useEffect(() => {
    if ((state as any)?.ok && (state as any)?.data) {
      onUpdated((state as any).data)
      onOpenChange(false)
      toast({ title: "تم الحفظ", description: "تم تحديث حالة الطلب" })
    } else if ((state as any)?.error) {
      toast({ title: "خطأ", description: (state as any).error, variant: "destructive" })
    }
  }, [state])

  if (!data) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-6">جارٍ التحميل...</div>
      </DialogContent>
    </Dialog>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>تفاصيل طلب التوثيق #{data.id}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={data.company.logo || "/placeholder-logo.png"} className="size-14 rounded" />
              <div>
                <div className="font-semibold">{data.company.name}</div>
                <div className="text-sm text-muted-foreground">{data.company.location}</div>
                <div className="text-xs">سنة التأسيس: {data.company.founded_year}</div>
              </div>
            </div>
            <div className="text-sm leading-6 whitespace-pre-line">{data.company.description}</div>
          </div>
          <div className="space-y-2 text-sm">
            <div>الحالة الحالية: <Badge>{data.status}</Badge></div>
            <div>أُنشئ: {new Date(data.created_at).toLocaleString()}</div>
            <div>آخر تحديث: {new Date(data.updated_at).toLocaleString()}</div>
            <div>
              المراجع: {data.verifiedBy ? (
                <span className="inline-flex items-center gap-2">
                  <img src={data.verifiedBy.picture || "/placeholder-user.jpg"} className="size-6 rounded-full" />
                  {data.verifiedBy.name}
                </span>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="font-medium mb-2">الوثائق</div>
          {data.documents && data.documents.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.documents.map((d) => (
                <div key={d.id} className="flex items-center justify-between border rounded p-3">
                  <div>
                    <div className="font-medium text-sm">{d.file_name}</div>
                    <div className="text-xs text-muted-foreground">{d.human_readable_size || d.size}</div>
                  </div>
                  <div className="flex gap-2">
                    <a className="text-primary underline" href={d.url} target="_blank" rel="noreferrer">معاينة</a>
                    <a className="text-primary underline" href={d.url} download>
                      تنزيل
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">لا توجد وثائق مرفوعة</div>
          )}
        </div>

        <form action={formAction as any} className="mt-6 space-y-3">
          <input type="hidden" name="id" value={id} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="reason" value={reason} />
          <div className="font-medium">تحديث الحالة</div>
          <RadioGroup className="grid grid-cols-2 gap-2" value={status} onValueChange={setStatus as any}>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="approved" id="approved" />
              <Label htmlFor="approved">قبول</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="rejected" id="rejected" />
              <Label htmlFor="rejected">رفض</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="under_review" id="under_review" />
              <Label htmlFor="under_review">قيد المراجعة</Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="needs_more_info" id="needs_more_info" />
              <Label htmlFor="needs_more_info">بحاجة لمزيد من المعلومات</Label>
            </div>
          </RadioGroup>

          <div>
            <Label htmlFor="reason">السبب</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="اكتب الملاحظات هنا" />
            <div className="text-xs text-muted-foreground text-left">{reason.length}/500</div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
            <Button onClick={save} disabled={pending || isPending}>{pending || isPending ? "جارٍ الحفظ..." : "حفظ"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


