"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { apiService } from "@/lib/api"
import {
  FeatureAssignments,
  FeatureDefinition,
  PAYMENT_RATE_DEFAULT_DURATIONS,
  PAYMENT_RATE_OPTIONS,
  PlanDetail,
  PlanFormValues,
  buildFeatureAssignments,
  createPlanFormValues,
  featureTypeLabel,
  normalizeFeatureDefinition,
  normalizePlanDetail,
  unpackCollection,
} from "@/lib/plans"

type PlanEditPageProps = {
  planId: string
  initialPlan?: PlanDetail | null
}

export function PlanEditPage({ planId, initialPlan = null }: PlanEditPageProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [plan, setPlan] = useState<PlanDetail | null>(initialPlan)
  const [loadingPlan, setLoadingPlan] = useState<boolean>(!initialPlan)
  const [planError, setPlanError] = useState<string | null>(null)

  const [features, setFeatures] = useState<FeatureDefinition[]>([])
  const [loadingFeatures, setLoadingFeatures] = useState(false)
  const [featuresError, setFeaturesError] = useState<string | null>(null)

  const [formValues, setFormValues] = useState<PlanFormValues>(() => createPlanFormValues(initialPlan))
  const [featureAssignments, setFeatureAssignments] = useState<FeatureAssignments>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState<boolean>(false)

  const loadPlan = useCallback(async () => {
    setLoadingPlan(true)
    setPlanError(null)
    try {
      const response = await apiService.fetchPlan(planId)
      const payload = response?.data?.data ?? response?.data ?? response
      const detail = normalizePlanDetail(payload)
      setPlan(detail)
      setFormError(null)
      setInitialized(false)
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "تعذر تحميل بيانات الخطة"
      setPlanError(message)
    } finally {
      setLoadingPlan(false)
    }
  }, [planId])

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
        const { items, meta } = unpackCollection(payload)
        aggregated.push(...items.map(normalizeFeatureDefinition))
        lastPage = meta?.last_page ?? page
        page += 1
      } while (page <= lastPage)

      setFeatures(aggregated)
      setInitialized(false)
      return aggregated
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "تعذر تحميل قائمة الميزات"
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

  const handleFeatureEnabled = useCallback(
    (featureId: number, enabled: boolean) => {
      const definition = features.find((feature) => feature.id === featureId)
      if (!definition) return

      setFeatureAssignments((prev) => {
        const existing = prev[featureId]
        const defaultValue =
          definition.type === "bool"
            ? (existing?.value as boolean | undefined) ?? true
            : typeof existing?.value === "string" && existing.value.length > 0
              ? existing.value
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

  useEffect(() => {
    if (!initialPlan) {
      loadPlan()
    }
  }, [initialPlan, loadPlan])

  useEffect(() => {
    loadFeatures()
  }, [loadFeatures])

  useEffect(() => {
    if (plan && features.length > 0 && !initialized) {
      setFormValues(createPlanFormValues(plan))
      setFeatureAssignments(buildFeatureAssignments(features, plan))
      setInitialized(true)
    }
  }, [features, initialized, plan])

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

      setSaving(true)

      try {
        await apiService.updatePlan(planId, payload)
        toast({ title: "تم تحديث الخطة بنجاح." })
        router.push("/subscriptions/plans")
        router.refresh()
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || "تعذر حفظ الخطة"
        setFormError(message)
        toast({
          title: "تعذر حفظ الخطة",
          description: message,
          variant: "destructive",
        })
      } finally {
        setSaving(false)
      }
    },
    [ensureFeatures, featureAssignments, formValues, planId, router, toast],
  )

  const isLoading = loadingPlan || (!plan && !planError)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">تعديل الخطة</h1>
          <p className="text-sm text-muted-foreground">قم بتحديث تفاصيل التسعير والميزات المرتبطة بالخطة.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => router.push("/subscriptions/plans")}
          className="flex items-center gap-2"
        >
          العودة إلى الخطط
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
          <Loader2 className="ml-2 h-5 w-5 animate-spin rtl:mr-2 rtl:ml-0" />
          جاري تحميل بيانات الخطة...
        </div>
      )}

      {!isLoading && planError && (
        <Alert variant="destructive">
          <AlertTitle>تعذر تحميل الخطة</AlertTitle>
          <AlertDescription>{planError}</AlertDescription>
          <div className="mt-4 flex items-center gap-2">
            <Button variant="outline" onClick={loadPlan}>
              إعادة المحاولة
            </Button>
            <Button variant="ghost" onClick={() => router.push("/subscriptions/plans")}>
              العودة للقائمة
            </Button>
          </div>
        </Alert>
      )}

      {!isLoading && plan && (
        <Card className="p-6">
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
                <h2 className="text-base font-semibold">الميزات المرتبطة بالخطة</h2>
                <p className="text-sm text-muted-foreground">
                  قم بتفعيل الميزات وتحديد قيمها بما يتماشى مع المتطلبات ({featureTypeLabel("bool")},{" "}
                  {featureTypeLabel("int")}, {featureTypeLabel("decimal")}).
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
                <ScrollArea className="max-h-[360px] overflow-y-auto rounded-md border">
                  <div className="space-y-3 p-4">
                    {features.map((feature) => {
                      const assignment =
                        featureAssignments[feature.id] ?? { enabled: false, value: feature.type === "bool" ? true : "" }
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
                                    value={
                                      typeof assignment.value === "string"
                                        ? assignment.value
                                        : assignment.value !== undefined && assignment.value !== null
                                          ? String(assignment.value)
                                          : ""
                                    }
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
              <Button type="button" variant="outline" onClick={() => router.push("/subscriptions/plans")} disabled={saving}>
                إلغاء
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin rtl:mr-2 rtl:ml-0" />}
                حفظ التعديلات
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}

export default PlanEditPage


