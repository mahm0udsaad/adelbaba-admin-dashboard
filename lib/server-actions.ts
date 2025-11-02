"use server"

import { cookies } from "next/headers"

const BASE_URL =
  process.env.ADMIN_API_URL ??
  process.env.NEXT_PUBLIC_ADMIN_API_URL ??
  "https://api.adil-baba.com/api/v1/admin"

async function getAuthTokenFromCookies(): Promise<string | undefined> {
  const store = await cookies()
  return store.get("authToken")?.value
}

async function fetchWithAuth(path: string, params?: Record<string, any>) {
  const token = await getAuthTokenFromCookies()
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Request failed ${res.status}: ${text}`)
  }
  return res.json()
}

export async function getCompanies(params?: { page?: number; search?: string }) {
  const data = await fetchWithAuth("/companies", params)
  return data?.data ?? data
}

export async function getCompany(id: number | string) {
  const data = await fetchWithAuth(`/companies/${id}`)
  return data?.data ?? data
}

export async function getUsers(params?: { page?: number; search?: string }) {
  const data = await fetchWithAuth("/users", params)
  return data?.data ?? data
}

export async function getSupportTickets(params?: { page?: number; priority?: string; status?: string }) {
  const data = await fetchWithAuth("/support-tickets", params)
  return data?.data ?? data
}

export async function getDashboardOverviewData() {
  const [companies, users, tickets] = await Promise.all([
    getCompanies(),
    getUsers(),
    getSupportTickets(),
  ])
  return { companies, users, tickets }
}

export async function setAuthToken(token: string) {
  // Set auth token cookie for SSR fetching
  ;(await cookies()).set("authToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function clearAuthToken() {
  ;(await cookies()).set("authToken", "", { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 0 })
}


// Roles & Permissions
export async function getRoles() {
  const data = await fetchWithAuth("/roles")
  return data?.data ?? data
}

export async function getRole(id: number | string) {
  const data = await fetchWithAuth(`/roles/${id}`)
  return data?.data ?? data
}

export async function getPermissions() {
  const data = await fetchWithAuth("/roles/permissions")
  return data?.data ?? data
}

// Management (Admins & Employees)
export async function getManagement(params?: { type?: "admin" | "employee"; page?: number; search?: string }) {
  const data = await fetchWithAuth("/management", params)
  return data?.data ?? data
}

export async function getManagementUser(id: number | string) {
  const data = await fetchWithAuth(`/management/${id}`)
  return data?.data ?? data
}

// Subscriptions - Plans & Features
export async function getPlans() {
  const data = await fetchWithAuth("/subscriptions/plans")
  return data?.data ?? data
}

export async function getPlan(id: number | string) {
  const data = await fetchWithAuth(`/subscriptions/plans/${id}`)
  return data?.data ?? data
}

export async function getFeatures() {
  const data = await fetchWithAuth("/subscriptions/features")
  return data?.data ?? data
}

export async function getFeature(id: number | string) {
  const data = await fetchWithAuth(`/subscriptions/features/${id}`)
  return data?.data ?? data
}

// Ads
export async function getAds(params?: { page?: number; search?: string; status?: string; type?: string; location?: string }) {
  const data = await fetchWithAuth("/ads", params)
  return data?.data ?? data
}

export async function getAd(id: number | string) {
  const data = await fetchWithAuth(`/ads/${id}`)
  return data?.data ?? data
}

export async function getCategories(params?: { page?: number; search?: string }) {
  const data = await fetchWithAuth("/categories", params)
  return data?.data ?? data
}

export async function getCategory(id: number | string) {
  const data = await fetchWithAuth(`/categories/${id}`)
  return data?.data ?? data
}

// Products - Units, Variations, Variation Values, Products
export async function getUnits() {
  const data = await fetchWithAuth("/units")
  return data?.data ?? data
}

export async function getUnit(id: number | string) {
  const data = await fetchWithAuth(`/units/${id}`)
  return data?.data ?? data
}

export async function getVariations() {
  const data = await fetchWithAuth("/variations")
  return data?.data ?? data
}

export async function getVariation(id: number | string) {
  const data = await fetchWithAuth(`/variations/${id}`)
  return data?.data ?? data
}

export async function getVariationValues(variationId: number | string) {
  const data = await fetchWithAuth(`/variations/${variationId}/values`)
  return data?.data ?? data
}

export async function getProducts(params?: { page?: number; search?: string; category_id?: number; active?: string; price_type?: string }) {
  const data = await fetchWithAuth("/products", params)
  return data?.data ?? data
}

export async function getProduct(id: number | string) {
  const data = await fetchWithAuth(`/products/${id}`)
  return data?.data ?? data
}


// ================= Verification Requests (Companies) =================
export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "under_review"
  | "needs_more_info"

export interface Company {
  id: number
  name: string
  description: string
  founded_year: number
  is_active: boolean
  verified_at: string | null
  location: string
  logo: string
}

export interface Verifier {
  id: number
  name: string
  picture: string
  email: string
  phone: string
  company_name: string
  unread_notifications_count: number
}

export interface RequestDoc {
  id: number
  file_name: string
  size: string
  human_readable_size: string
  url: string
  type: string
}

export interface SupplierRequest {
  id: number
  status: RequestStatus
  reason: string | null
  created_at: string
  updated_at: string
  company: Company
  verifiedBy: Verifier | null
  documents: RequestDoc[]
}

export interface Paginated<T> {
  data: T[]
  links: { first: string; last: string; prev: string | null; next: string | null }
  meta: { current_page: number; per_page?: number; total: number; last_page?: number }
}

function normalizePaginated<T>(input: any): Paginated<T> {
  // Endpoints may respond as { data: [...], meta, links }
  // or as { data: { data: [...], meta, links } }
  const container = (input && input.data && !Array.isArray(input.data) && (input.data.data || input.data.meta || input.data.links))
    ? input.data
    : input

  const dataArray = Array.isArray(container?.data) ? (container.data as T[]) : []
  const links = container?.links ?? { first: "", last: "", prev: null, next: null }
  const meta = container?.meta ?? { current_page: 1, per_page: 20, total: 0, last_page: 1 }

  return { data: dataArray, links, meta }
}

function mapSupplierRequestShape(input: any): SupplierRequest {
  return {
    id: input?.id,
    status: input?.status,
    reason: input?.reason ?? null,
    created_at: input?.created_at,
    updated_at: input?.updated_at,
    company: input?.company,
    verifiedBy: input?.verifiedBy ?? input?.verified_by ?? null,
    documents: Array.isArray(input?.documents) ? input.documents : [],
  } as SupplierRequest
}

export async function listVerificationRequests(params?: {
  status?: RequestStatus
  company_id?: string
  verified_by?: string
  per_page?: number
  page?: number
}): Promise<Paginated<SupplierRequest>> {
  const data = await fetchWithAuth("/companies/requests", params)
  const normalized = normalizePaginated<any>(data)
  return {
    ...normalized,
    data: (normalized.data || []).map(mapSupplierRequestShape),
  }
}

export async function getVerificationRequest(id: number | string): Promise<SupplierRequest> {
  const data = await fetchWithAuth(`/companies/requests/${id}`)
  const payload = data?.data ?? data
  return mapSupplierRequestShape(payload)
}

export async function updateVerificationRequest(
  id: number | string,
  body: { status: Exclude<RequestStatus, "pending">; reason?: string },
): Promise<SupplierRequest> {
  const token = await getAuthTokenFromCookies()
  const url = `${BASE_URL}/companies/requests/${id}`
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (res.status === 401 || res.status === 403) {
    throw new Error("Session expired. Please login again.")
  }
  if (res.status === 422) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || "Validation error")
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Failed to update request: ${text}`)
  }
  const json = await res.json()
  const payload = json?.data ?? json
  return mapSupplierRequestShape(payload)
}
