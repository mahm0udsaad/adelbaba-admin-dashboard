"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Loader2, Plus, Eye, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import {
  FeatureAssignments,
  FeatureDefinition,
  PAYMENT_RATE_DEFAULT_DURATIONS,
  PAYMENT_RATE_OPTIONS,
  PaginatedMeta,
  PlanDetail,
  PlanFormValues,
  PlanSummary,
  buildFeatureAssignments,
  createPlanFormValues,
  featureTypeLabel,
  formatDate,
  formatFeatureValue,
  formatPaymentRate,
  formatPrice,
  normalizeFeatureDefinition,
  normalizePlanDetail,
  normalizePlanSummary,
  unpackCollection,
} from "@/lib/plans"

export function PlansPage({ initialPlans }: { initialPlans?: any }) {
  const router = useRouter()
  const { toast } = useToast()

  const [plans, setPlans] = useState<PlanSummary[]>(() =>
    Array.isArray(initialPlans) ? initialPlans.map(normalizePlanSummary) : [],
  )
  const [meta, setMeta] = useState<PaginatedMeta | null>(null)
  const [links, setLinks] = useState<{ first?: string; last?: string; prev?: string | null; next?: string | null } | null>(
    null,
  )
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loadingList, setLoadingList] = useState(false)

  const [features, setFeatures] = useState<FeatureDefinition[]>([])
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const [featuresError, setFeaturesError] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [formValues, setFormValues] = useState<PlanFormValues>(() => createPlanFormValues())
  const [featureAssignments, setFeatureAssignments] = useState<FeatureAssignments>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [savingForm, setSavingForm] = useState(false)

  const [viewOpen, setViewOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewPlan, setViewPlan] = useState<PlanDetail | null>(null)
  const [viewError, setViewError] = useState<string | null>(null)

  const [deleteTarget, setDeleteTarget] = useState<PlanSummary | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadPlans = useCallback(
    async (page = 1) => {
      setLoadingList(true)
      setError(null)

      try {
        const response = await apiService.fetchPlans({ page, per_page: 15 })
        const payload = response?.data ?? response
        const { items, meta: metaInfo, links: paginationLinks } = unpackCollection(payload)

        const normalized = items.map(normalizePlanSummary)
        setPlans(normalized)

        if (metaInfo) {
          setMeta(metaInfo)
          setCurrentPage(metaInfo.current_page ?? page)
        } else {
          setMeta(null)
          setCurrentPage(page)
        }

        setLinks(paginationLinks ?? null)
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "تعذر تحميل الخطط"
        setError(message)
        toast({
          title: "حدث خطأ أثناء تحميل الخطط",
          description: message,
          variant: "destructive",
        })
      } finally {
        setLoadingList(false)
      }
    },
    [toast],
  )

  const loadFeatures = useCallback(async () => {
    setLoadingFeatures(true)
    setFeaturesError(null)

    try {
      const aggregated: FeatureDefinition[] = []
      let page = 1
      let lastPage = 1

      do {
        const response = await apiService.fetchFeatures({ page, per_page: 100 })
        const payload = response?.data ?? response
        const { items, meta: metaInfo } = unpackCollection(payload)

        aggregated.push(...items.map(normalizeFeatureDefinition))
        lastPage = metaInfo?.last_page ?? page
        page += 1
      } while (page <= lastPage)

      setFeatures(aggregated)
      return aggregated
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "تعذر تحميل الميزات"
      setFeaturesError(message)
      return []
    } finally {
      setLoadingFeatures(false)
    }
  }, [])

  const ensureFeatures = useCallback(async () => {
    if (features.length > 0) {
      return features
    }
    return await loadFeatures()
  }, [features, loadFeatures])

  const resetFormState = useCallback(
    (definitions: FeatureDefinition[], plan?: PlanDetail | null) => {
      setFormValues(createPlanFormValues(plan))
      setFeatureAssignments(buildFeatureAssignments(definitions, plan))
      setFormError(null)
    },
    [],
  )

  useEffect(() => {
    loadPlans(1)
  }, [loadPlans])

  useEffect(() => {
    loadFeatures()
  }, [loadFeatures])

  useEffect(() => {
    if (Array.isArray(initialPlans) && initialPlans.length > 0) {
      setPlans(initialPlans.map(normalizePlanSummary))
    }
  }, [initialPlans])

  const filteredPlans = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) return plans

    return plans.filter((plan) => {
      const priceText =
        plan.price !== null && plan.price !== undefined ? String(plan.price).toLowerCase() : ""

      return (
        plan.name?.toLowerCase().includes(query) ||
        plan.payment_rate?.toLowerCase().includes(query) ||
        priceText.includes(query)
      )
    })
  }, [plans, searchTerm])

  const handleFeatureEnabled = useCallback(
    (featureId: number, enabled: boolean) => {
      setFeatureAssignments((prev) => {
        const definition = features.find((feature) => feature.id === featureId)
        if (!definition) return prev

        const current = prev[featureId]
        const defaultValue =
          definition.type === "bool"
            ? (current?.value as boolean | undefined) ?? true
            : typeof current?.value === "string" && current?.value.length > 0
              ? current.value
              : ""

        return {
          ...prev,
          [featureId]: {
            enabled,
            value: enabled
              ? defaultValue
              : definition.type === "bool"
                ? false
                : "",
          },
        }
      })
    },
    [features],
  )

  const handleFeatureValueChange = useCallback((featureId: number, value: boolean | string) => {
    setFeatureAssignments((prev) => {
      const existing = prev[featureId]
      return {
        ...prev,
        [featureId]: {
          enabled: existing?.enabled ?? true,
          value,
        },
      }
    })
  }, [])

  const handlePaymentRateChange = useCallback((value: string) => {
    setFormValues((prev) => {
      const nextDuration =
        value === "lifetime"
          ? ""
          : prev.duration_in_days && prev.duration_in_days.trim().length > 0
            ? prev.duration_in_days
            : PAYMENT_RATE_DEFAULT_DURATIONS[value] ?? ""

      return {
        ...prev,
        payment_rate: value,
        duration_in_days: nextDuration,
      }
    })
  }, [])

  const openCreateForm = useCallback(async () => {
    const definitions = await ensureFeatures()
    if (!definitions.length) {
      toast({
        title: "تعذر فتح نموذج إنشاء الخطة",
        description: featuresError ?? "لم يتم تحميل قائمة الميزات بعد.",
        variant: "destructive",
      })
      return
    }

    resetFormState(definitions, null)
    setFormOpen(true)
  }, [ensureFeatures, featuresError, resetFormState, toast])

  const goToEditPage = useCallback(
    (planId: string) => {
      router.push(`/subscriptions/plans/${planId}/edit`)
    },
    [router],
  )

  const openPlanDetails = useCallback(
    async (planId: string) => {
      setViewOpen(true)
      setViewLoading(true)
      setViewPlan(null)
      setViewError(null)

      try {
        const response = await apiService.fetchPlan(planId)
        const payload = response?.data?.data ?? response?.data ?? response
        const detail = normalizePlanDetail(payload)
        setViewPlan(detail)
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "تعذر تحميل تفاصيل الخطة"
        setViewError(message)
        toast({
          title: "خطأ في عرض الخطة",
          description: message,
          variant: "destructive",
        })
      } finally {
        setViewLoading(false)
      }
    },
    [toast],
  )

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page < 1) return
      if (meta?.last_page && page > meta.last_page) return
      await loadPlans(page)
    },
    [loadPlans, meta],
  )

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFormError(null)

      const trimmedName = formValues.name.trim()
      if (!trimmedName) {
        setFormError("الرجاء إدخال اسم الخطة.")
        return
      }

      if (!formValues.payment_rate) {
        setFormError("الرجاء اختيار معدل الدفع.")
        return
      }

      const priceValue = parseFloat(formValues.price)
      if (Number.isNaN(priceValue)) {
        setFormError("الرجاء إدخال سعر صالح.")
        return
      }
      if (priceValue < 0) {
        setFormError("السعر يجب أن يكون رقماً أكبر من أو يساوي صفر.")
        return
      }

      let durationValue: number | null = null
      if (formValues.payment_rate !== "lifetime") {
        if (!formValues.duration_in_days.trim()) {
          setFormError("الرجاء إدخال مدة الخطة بالأيام.")
          return
        }
        durationValue = parseInt(formValues.duration_in_days, 10)
        if (Number.isNaN(durationValue) || durationValue <= 0) {
          setFormError("الرجاء إدخال مدة صالحة (أكبر من صفر).")
          return
        }
      }

      const definitions = await ensureFeatures()
      if (!definitions.length) {
        setFormError("تعذر تحميل قائمة الميزات. حاول مرة أخرى.")
        return
      }

      const featuresPayload: { id: number; value: any }[] = []

      for (const definition of definitions) {
        const assignment = featureAssignments[definition.id]
        if (!assignment?.enabled) continue

        if (definition.type === "bool") {
          featuresPayload.push({ id: definition.id, value: Boolean(assignment.value) })
        } else if (definition.type === "int") {
          const parsed = parseInt(String(assignment.value).trim(), 10)
          if (Number.isNaN(parsed)) {
            setFormError(`الرجاء إدخال قيمة رقمية صحيحة للميزة "${definition.name}".`)
            return
          }
          featuresPayload.push({ id: definition.id, value: parsed })
        } else if (definition.type === "decimal") {
          const parsed = parseFloat(String(assignment.value).trim())
          if (Number.isNaN(parsed)) {
            setFormError(`الرجاء إدخال قيمة عشرية صحيحة للميزة "${definition.name}".`)
            return
          }
          featuresPayload.push({ id: definition.id, value: parsed })
        } else {
          const text = String(assignment.value ?? "").trim()
          if (!text) {
            setFormError(`الرجاء إدخال قيمة للميزة "${definition.name}".`)
            return
          }
          featuresPayload.push({ id: definition.id, value: text })
        }
      }

      const payload: Record<string, any> = {
        name: trimmedName,
        payment_rate: formValues.payment_rate,
        price: priceValue,
        features: featuresPayload,
      }

      if (formValues.payment_rate !== "lifetime" && durationValue !== null) {
        payload.duration_in_days = durationValue
      }

      setSavingForm(true)

      try {
        await apiService.createPlan(payload)
        toast({ title: "تم إنشاء الخطة بنجاح." })
        setFormOpen(false)
        resetFormState(definitions, null)
        await loadPlans(1)
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "تعذر حفظ الخطة"
        setFormError(message)
        toast({
          title: "تعذر حفظ الخطة",
          description: message,
          variant: "destructive",
        })
      } finally {
        setSavingForm(false)
      }
    },
    [
      ensureFeatures,
      featureAssignments,
      formValues.duration_in_days,
      formValues.name,
      formValues.payment_rate,
      formValues.price,
      loadPlans,
      resetFormState,
      toast,
    ],
  )

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return

    setDeleteLoading(true)
    setDeleteError(null)

    const planId = deleteTarget.id
    const nextPage = plans.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage

    try {
      await apiService.deletePlan(planId)
      toast({ title: "تم حذف الخطة بنجاح." })
      setDeleteTarget(null)
      await loadPlans(nextPage)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "تعذر حذف الخطة"
      setDeleteError(message)
      toast({
        title: "تعذر حذف الخطة",
        description: message,
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }, [currentPage, deleteTarget, loadPlans, plans.length, toast])

  const totalPlans = meta?.total ?? plans.length
  const hasPrev = Boolean(links?.prev) || (meta?.current_page ?? currentPage) > 1
  const hasNext = Boolean(links?.next) || (meta?.last_page ?? 1) > (meta?.current_page ?? currentPage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="ابحث عن خطة بالاسم أو معدل الدفع..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10 rtl:pl-3 rtl:pr-10"
          />
        </div>
        <Button onClick={openCreateForm} className="w-full md:w-auto">
          <Plus className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0" />
          خطة جديدة
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>حدث خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>معدل الدفع</TableHead>
              <TableHead>المدة (يوم)</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>عدد الميزات</TableHead>
              <TableHead className="w-[80px] text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
                    <Loader2 className="ml-2 h-4 w-4 animate-spin rtl:mr-2 rtl:ml-0" />
                    جاري تحميل الخطط...
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loadingList && filteredPlans.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="py-10 text-center text-sm text-muted-foreground">لا توجد خطط مطابقة للبحث الحالي.</div>
                </TableCell>
              </TableRow>
            )}

            {!loadingList &&
              filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{formatPaymentRate(plan.payment_rate)}</TableCell>
                  <TableCell>{plan.duration_in_days ?? (plan.payment_rate === "lifetime" ? "غير محدودة" : "-")}</TableCell>
                  <TableCell>{formatPrice(plan.price)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {plan.features_count ?? plan.features?.length ?? 0}
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
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault()
                            openPlanDetails(plan.id)
                          }}
                        >
                          <Eye className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault()
                            goToEditPage(plan.id)
                          }}
                        >
                          <Pencil className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0" />
                          تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={(event) => {
                            event.preventDefault()
                            setDeleteError(null)
                            setDeleteTarget(plan)
                          }}
                        >
                          <Trash2 className="ml-2 h-4 w-4 rtl:mr-2 rtl:ml-0" />
                          حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 px-4 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            إجمالي الخطط:{" "}
            <span className="font-medium text-foreground">{totalPlans}</span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((meta?.current_page ?? currentPage) - 1)}
              disabled={!hasPrev || loadingList}
            >
              السابق
            </Button>
            <span>
              صفحة {meta?.current_page ?? currentPage} من {meta?.last_page ?? 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((meta?.current_page ?? currentPage) + 1)}
              disabled={!hasNext || loadingList}
            >
              التالي
            </Button>
          </div>
        </div>
      </Card>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) {
            setFormError(null)
            setSavingForm(false)
            setFormValues(createPlanFormValues())
            setFeatureAssignments({})
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>إنشاء خطة جديدة</DialogTitle>
            <DialogDescription>
              قم بضبط تفاصيل الخطة والأسعار والميزات المتاحة بما يتوافق مع واجهة الـ API.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-6" onSubmit={handleSubmit}>
              {formError && (
                <Alert variant="destructive">
                  <AlertTitle>تعذر حفظ البيانات</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">اسم الخطة</Label>
                  <Input
                    id="plan-name"
                    value={formValues.name}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="مثال: خطة بريميوم"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-rate">معدل الدفع</Label>
                  <Select value={formValues.payment_rate} onValueChange={handlePaymentRateChange}>
                    <SelectTrigger id="plan-rate">
                      <SelectValue placeholder="اختر معدل الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_RATE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-duration">المدة بالأيام</Label>
                  <Input
                    id="plan-duration"
                    type="number"
                    min={1}
                    value={formValues.duration_in_days}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, duration_in_days: event.target.value }))}
                    placeholder="365"
                    disabled={formValues.payment_rate === "lifetime"}
                  />
                  {formValues.payment_rate === "lifetime" && (
                    <p className="text-xs text-muted-foreground">خطة مدى الحياة لا تحتاج إلى مدة بالأيام.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-price">السعر</Label>
                  <Input
                    id="plan-price"
                    type="number"
                    min={0}
                    step="0.01"
                    value={formValues.price}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, price: event.target.value }))}
                    placeholder="مثال: 1499.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-base font-semibold">الميزات المرتبطة بالخطة</h4>
                  <p className="text-sm text-muted-foreground">
                    قم بتفعيل الميزات وتحديد قيمها بما يتماشى مع المتطلبات ({featureTypeLabel("bool")}, {featureTypeLabel("int")}, {featureTypeLabel("decimal")}).
                  </p>
                </div>

                {featuresError && (
                  <Alert variant="destructive">
                    <AlertTitle>خطأ في تحميل الميزات</AlertTitle>
                    <AlertDescription>{featuresError}</AlertDescription>
                  </Alert>
                )}

                {loadingFeatures && features.length === 0 ? (
                  <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                    <Loader2 className="ml-2 h-4 w-4 animate-spin rtl:mr-2 rtl:ml-0" />
                    جاري تحميل قائمة الميزات...
                  </div>
                ) : features.length === 0 ? (
                  <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                    لم يتم العثور على ميزات متاحة. يرجى إنشاء الميزات أولاً.
                  </div>
                ) : (
                  <ScrollArea className="max-h-[320px] rounded-md border">
                    <div className="space-y-3 p-4">
                      {features.map((feature) => {
                        const assignment = featureAssignments[feature.id] ?? { enabled: false, value: feature.type === "bool" ? true : "" }
                        return (
                          <div key={feature.id} className="rounded-md border p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="font-medium">{feature.name}</p>
                                {feature.description && (
                                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground">نوع القيمة: {featureTypeLabel(feature.type)}</p>
                              </div>
                              <Checkbox
                                checked={assignment.enabled}
                                onCheckedChange={(value) => handleFeatureEnabled(feature.id, Boolean(value))}
                                aria-label={`تفعيل الميزة ${feature.name}`}
                              />
                            </div>

                            {assignment.enabled && (
                              <div className="mt-4 space-y-2">
                                {feature.type === "bool" ? (
                                  <div className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2">
                                    <span className="text-sm">القيمة</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        {assignment.value ? "مفعّل" : "غير مفعّل"}
                                      </span>
                                      <Switch
                                        checked={Boolean(assignment.value)}
                                        onCheckedChange={(checked) => handleFeatureValueChange(feature.id, checked)}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <Label htmlFor={`feature-${feature.id}-value`} className="text-sm">
                                      قيمة الميزة
                                    </Label>
                                    <Input
                                      id={`feature-${feature.id}-value`}
                                      type="number"
                                      step={feature.type === "decimal" ? "0.01" : "1"}
                                      inputMode="decimal"
                                      value={typeof assignment.value === "string" ? assignment.value : assignment.value ?? ""}
                                      onChange={(event) => handleFeatureValueChange(feature.id, event.target.value)}
                                      placeholder={feature.type === "int" ? "مثال: 10" : "مثال: 149.50"}
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)} disabled={savingForm}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={savingForm}>
                  {savingForm && <Loader2 className="ml-2 h-4 w-4 animate-spin rtl:mr-2 rtl:ml-0" />}
                  إنشاء
                </Button>
              </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={viewOpen}
        onOpenChange={(open) => {
          setViewOpen(open)
          if (!open) {
            setViewPlan(null)
            setViewError(null)
            setViewLoading(false)
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{viewPlan?.name ?? "تفاصيل الخطة"}</DialogTitle>
            <DialogDescription>عرض شامل للميزات والتسعير الخاصة بالخطة المختارة.</DialogDescription>
          </DialogHeader>

          {viewLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              <Loader2 className="ml-2 h-4 w-4 animate-spin rtl:mr-2 rtl:ml-0" />
              جاري تحميل تفاصيل الخطة...
            </div>
          )}

          {!viewLoading && viewError && (
            <Alert variant="destructive">
              <AlertTitle>خطأ في تحميل التفاصيل</AlertTitle>
              <AlertDescription>{viewError}</AlertDescription>
            </Alert>
          )}

          {!viewLoading && viewPlan && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">معدل الدفع</p>
                  <p className="font-medium">{formatPaymentRate(viewPlan.payment_rate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المدة (يوم)</p>
                  <p className="font-medium">
                    {viewPlan.payment_rate === "lifetime"
                      ? "غير محدودة"
                      : viewPlan.duration_in_days ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السعر</p>
                  <p className="font-medium">{formatPrice(viewPlan.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">آخر تحديث</p>
                  <p className="font-medium">{formatDate(viewPlan.updated_at)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-semibold">الميزات</h4>
                {viewPlan.features.length === 0 ? (
                  <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    لا توجد ميزات مرتبطة بهذه الخطة.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الميزة</TableHead>
                        <TableHead>الوصف</TableHead>
                        <TableHead>نوع القيمة</TableHead>
                        <TableHead>القيمة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewPlan.features.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium">{feature.name}</TableCell>
                          <TableCell>{feature.description ?? "-"}</TableCell>
                          <TableCell>{featureTypeLabel(feature.type)}</TableCell>
                          <TableCell>{formatFeatureValue(feature)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
            setDeleteLoading(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل تريد حذف هذه الخطة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الخطة "{deleteTarget?.name}" نهائياً ولن يكون بالإمكان استعادتها. يرجى التأكيد قبل المتابعة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteLoading}
              onClick={async (event) => {
                event.preventDefault()
                await handleConfirmDelete()
              }}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin rtl:mr-2 rtl:ml-0" />}
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

