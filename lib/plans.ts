export type FeatureType = "bool" | "int" | "decimal" | (string & {})

export interface FeatureDefinition {
  id: number
  name: string
  description?: string | null
  type: FeatureType
  key: string
}

export interface PlanFeature extends FeatureDefinition {
  value: boolean | number | string | null
  rawValue?: any
}

export interface PlanSummary {
  id: string
  name: string
  payment_rate?: string
  duration_in_days?: number | null
  price?: number | null
  created_at?: string
  updated_at?: string
  features?: PlanFeature[]
  features_count?: number | null
}

export interface PlanDetail extends PlanSummary {
  features: PlanFeature[]
}

export interface PlanFormValues {
  name: string
  payment_rate: string
  duration_in_days: string
  price: string
}

export type FeatureAssignments = Record<number, { enabled: boolean; value: boolean | string }>

export interface PaginatedMeta {
  current_page?: number
  last_page?: number
  per_page?: number
  total?: number
}

export const PAYMENT_RATE_OPTIONS = [
  { value: "monthly", label: "شهري" },
  { value: "quarterly", label: "ربع سنوي" },
  { value: "biyearly", label: "كل عامين" },
  { value: "yearly", label: "سنوي" },
  { value: "lifetime", label: "مدى الحياة" },
]

export const PAYMENT_RATE_DEFAULT_DURATIONS: Record<string, string> = {
  monthly: "30",
  quarterly: "90",
  biyearly: "730",
  yearly: "365",
  lifetime: "",
}

export function boolFromValue(value: any): boolean {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on"
  }
  return false
}

export function toNumber(value: any): number | null {
  if (value === null || value === undefined || value === "") return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

export function unpackCollection(payload: any): {
  items: any[]
  meta: PaginatedMeta | undefined
  links: { first?: string; last?: string; prev?: string | null; next?: string | null } | undefined
} {
  if (!payload) {
    return { items: [], meta: undefined, links: undefined }
  }

  const container =
    Array.isArray(payload?.data) || payload?.meta || payload?.links
      ? payload
      : payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)
        ? payload.data
        : payload

  const items = Array.isArray(container?.data)
    ? container.data
    : Array.isArray(container)
      ? container
      : []

  const meta = container?.meta ?? payload?.meta
  const links = container?.links ?? payload?.links

  return { items, meta, links }
}

export function normalizeFeatureDefinition(payload: any): FeatureDefinition {
  return {
    id: Number(payload?.id ?? 0),
    name: payload?.name ?? "",
    description: payload?.description ?? null,
    type: (payload?.type ?? "bool") as FeatureType,
    key: payload?.key ?? "",
  }
}

export function normalizePlanFeature(payload: any): PlanFeature {
  const type = (payload?.type ?? "bool") as FeatureType
  const rawValue = payload?.value ?? payload?.pivot?.value ?? null
  let value: boolean | number | string | null = null

  if (type === "bool") {
    value = boolFromValue(rawValue)
  } else if (type === "int") {
    const parsed = toNumber(rawValue)
    value = parsed !== null ? Math.trunc(parsed) : null
  } else if (type === "decimal") {
    value = toNumber(rawValue)
  } else if (rawValue !== null && rawValue !== undefined) {
    value = String(rawValue)
  }

  return {
    id: Number(payload?.id ?? 0),
    name: payload?.name ?? "",
    description: payload?.description ?? null,
    type,
    key: payload?.key ?? "",
    value,
    rawValue,
  }
}

export function normalizePlanSummary(payload: any): PlanSummary {
  const id = payload?.id !== undefined && payload?.id !== null ? String(payload.id) : ""
  const price = toNumber(payload?.price)
  const duration = toNumber(payload?.duration_in_days)
  const featuresArray = Array.isArray(payload?.features) ? payload.features.map(normalizePlanFeature) : []
  const featuresCountValue = toNumber(payload?.features_count)

  return {
    id,
    name: payload?.name ?? "",
    payment_rate: payload?.payment_rate ?? "",
    duration_in_days: duration,
    price,
    created_at: payload?.created_at ?? "",
    updated_at: payload?.updated_at ?? "",
    features: featuresArray,
    features_count:
      featuresCountValue !== null
        ? featuresCountValue
        : featuresArray.length,
  }
}

export function normalizePlanDetail(payload: any): PlanDetail {
  const summary = normalizePlanSummary(payload)
  const featuresArray = Array.isArray(payload?.features)
    ? payload.features.map(normalizePlanFeature)
    : summary.features ?? []

  return {
    ...summary,
    features: featuresArray,
  }
}

export function buildFeatureAssignments(definitions: FeatureDefinition[], plan?: PlanDetail | null): FeatureAssignments {
  const assignments: FeatureAssignments = {}

  definitions.forEach((definition) => {
    const planFeature = plan?.features?.find((feature) => feature.id === definition.id)

    if (definition.type === "bool") {
      const defaultValue = planFeature ? Boolean(planFeature.value) : true
      assignments[definition.id] = {
        enabled: Boolean(planFeature),
        value: defaultValue,
      }
    } else {
      assignments[definition.id] = {
        enabled: Boolean(planFeature),
        value:
          planFeature && planFeature.value !== null && planFeature.value !== undefined
            ? String(planFeature.value)
            : "",
      }
    }
  })

  return assignments
}

export function featureTypeLabel(type: FeatureType): string {
  switch (type) {
    case "bool":
      return "قيمة منطقية"
    case "int":
      return "قيمة رقمية (عدد صحيح)"
    case "decimal":
      return "قيمة رقمية عشرية"
    default:
      return "قيمة نصية"
  }
}

export function formatPrice(price?: number | null): string {
  if (price === null || price === undefined) return "-"
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

export function formatDate(timestamp?: string): string {
  if (!timestamp) return "-"
  try {
    return new Intl.DateTimeFormat("ar-EG", {
      dateStyle: "medium",
      timeStyle: "short",
      calendar: "gregory",
    }).format(new Date(timestamp))
  } catch {
    return timestamp
  }
}

export function formatFeatureValue(feature: PlanFeature): string {
  if (feature.type === "bool") {
    return feature.value ? "مفعّل" : "غير مفعّل"
  }

  if (feature.value === null || feature.value === undefined || feature.value === "") {
    return "-"
  }

  if (feature.type === "int") {
    return typeof feature.value === "number" ? feature.value.toString() : String(feature.value)
  }

  if (feature.type === "decimal") {
    const numeric = typeof feature.value === "number" ? feature.value : Number(feature.value)
    if (!Number.isNaN(numeric)) {
      return formatPrice(numeric)
    }
  }

  return typeof feature.value === "number" ? feature.value.toString() : String(feature.value)
}

export function formatPaymentRate(rate?: string): string {
  const option = PAYMENT_RATE_OPTIONS.find((item) => item.value === rate)
  return option ? option.label : rate || "-"
}

export function createPlanFormValues(plan?: PlanDetail | null): PlanFormValues {
  const defaultRate = PAYMENT_RATE_OPTIONS[0]?.value ?? "monthly"
  const paymentRate = plan?.payment_rate ?? defaultRate
  const duration =
    paymentRate === "lifetime"
      ? ""
      : plan?.duration_in_days !== null && plan?.duration_in_days !== undefined
        ? String(plan.duration_in_days)
        : PAYMENT_RATE_DEFAULT_DURATIONS[paymentRate] ?? ""
  const priceValue = plan?.price

  return {
    name: plan?.name ?? "",
    payment_rate: paymentRate,
    duration_in_days: duration,
    price: priceValue !== null && priceValue !== undefined ? String(priceValue) : "",
  }
}


