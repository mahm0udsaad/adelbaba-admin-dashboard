"use client"

import { useEffect, useState, useActionState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { getVerificationRequest, updateVerificationRequest, type SupplierRequest } from "@/lib/server-actions"
import { Building2, MapPin, Calendar, User, FileText, Download, ExternalLink, Clock } from "lucide-react"

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

  if (!data) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-center justify-center p-12">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">جارٍ التحميل...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl">تفاصيل طلب التوثيق #{data.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Company Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                معلومات الشركة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <img 
                  src={data.company.logo || "/placeholder-logo.png"} 
                  alt={data.company.name}
                  className="size-20 sm:size-24 rounded-lg border object-cover"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="text-lg font-semibold">{data.company.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {data.company.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{data.company.location}</span>
                        {data.company.region?.name && (
                          <span className="text-xs">({data.company.region.name})</span>
                        )}
                      </div>
                    )}
                    {data.company.founded_year && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>سنة التأسيس: {data.company.founded_year}</span>
                      </div>
                    )}
                    {data.company.commercial_register && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        <span>السجل التجاري: {data.company.commercial_register}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {data.company.description && (
                <div className="pt-2 border-t">
                  <p className="text-sm leading-6 whitespace-pre-line text-muted-foreground">
                    {data.company.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Status & Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                حالة الطلب والتفاصيل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">الحالة الحالية</Label>
                  <div>
                    <Badge className="text-white" variant={statusVariant(data.status) as any}>
                      {data.status}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">المراجع</Label>
                  <div>
                    {data.verifiedBy ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={data.verifiedBy.picture || "/placeholder-user.jpg"} 
                          alt={data.verifiedBy.name}
                          className="size-6 rounded-full"
                        />
                        <span className="text-sm">{data.verifiedBy.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    تاريخ الإنشاء
                  </Label>
                  <p className="text-sm">{new Date(data.created_at).toLocaleString("ar-EG", {
                    calendar: "gregory",
                    numberingSystem: "latn"
                  })}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    آخر تحديث
                  </Label>
                  <p className="text-sm">{new Date(data.updated_at).toLocaleString("ar-SA")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                الوثائق المرفقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.documents && data.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.documents.map((d) => (
                    <div 
                      key={d.id} 
                      className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{d.file_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {d.human_readable_size || d.size}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          asChild
                        >
                          <a href={d.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2"
                          asChild
                        >
                          <a href={d.url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  لا توجد وثائق مرفوعة
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Update Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>تحديث حالة الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={formAction as any} className="space-y-6">
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="status" value={status} />
                <input type="hidden" name="reason" value={reason} />
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">اختر الحالة الجديدة</Label>
                  <RadioGroup 
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3" 
                    value={status} 
                    onValueChange={setStatus as any}
                  >
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="approved" id="approved" />
                      <Label htmlFor="approved" className="cursor-pointer flex-1">قبول</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="rejected" id="rejected" />
                      <Label htmlFor="rejected" className="cursor-pointer flex-1">رفض</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="under_review" id="under_review" />
                      <Label htmlFor="under_review" className="cursor-pointer flex-1">قيد المراجعة</Label>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                      <RadioGroupItem value="needs_more_info" id="needs_more_info" />
                      <Label htmlFor="needs_more_info" className="cursor-pointer flex-1">بحاجة لمزيد من المعلومات</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium">
                    الملاحظات أو السبب
                    {(["rejected", "needs_more_info"].includes(status)) && (
                      <span className="text-destructive mr-1">*</span>
                    )}
                  </Label>
                  <Textarea 
                    id="reason" 
                    value={reason} 
                    onChange={(e) => setReason(e.target.value)} 
                    placeholder="اكتب الملاحظات أو السبب هنا..."
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {(["rejected", "needs_more_info"].includes(status)) && (
                        <span className="text-destructive">هذا الحقل مطلوب</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{reason.length}/500</p>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => onOpenChange(false)}
                    className="w-full sm:w-auto"
                  >
                    إلغاء
                  </Button>
                  <Button 
                    type="button"
                    onClick={save} 
                    disabled={pending || isPending}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                  >
                    {pending || isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}


