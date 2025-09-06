import axios from "axios"

const api = axios.create({
  baseURL: "https://api.adil-baba.com/api/v1/admin",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
})

api.interceptors.request.use((config) => {
  // Prefer admin_token per guide, fallback to authToken for compatibility
  const token = localStorage.getItem("admin_token") || localStorage.getItem("authToken")
  console.log("[v0] Token from localStorage:", token ? "Present" : "Missing")
  console.log("[v0] Request URL:", config.url)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log("[v0] Authorization header set:", config.headers.Authorization)
  } else {
    console.log("[v0] No token found - request will be unauthorized")
  }

  console.log("[v0] Request headers:", config.headers)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log("[v0] API Response success:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.log("[v0] API Error:", error.response?.status, error.config?.url)
    console.log("[v0] Error details:", error.response?.data)

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("[v0] Unauthorized - clearing token and redirecting to login")
      localStorage.removeItem("admin_token")
      localStorage.removeItem("authToken")
      if (window.location.pathname !== "/") {
        window.location.href = "/"
      }
    }
    return Promise.reject(error)
  },
)

// API service functions
export const apiService = {
  // Authentication
  login: (email: string, password: string) => api.post("/login", { email, password }),

  // Companies
  fetchCompanies: (params?: { page?: number; search?: string }) => api.get("/companies", { params }),
  fetchCompany: (id: number) => api.get(`/companies/${id}`),
  createCompany: (data: FormData) =>
    api.post("/companies", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateCompany: (id: number, data: any) => api.patch(`/companies/${id}`, data),
  deleteCompany: (id: number) => api.delete(`/companies/${id}`),

  // Users
  fetchUsers: (params?: { page?: number; search?: string }) => api.get("/users", { params }),
  fetchUser: (id: number) => api.get(`/users/${id}`),
  createUser: (data: any) => api.post("/users", data),
  updateUser: (id: number, data: any) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),

  // Roles & Permissions
  fetchRoles: () => api.get("/roles"),
  fetchRole: (id: number) => api.get(`/roles/${id}`),
  createRole: (data: { name: string; permissions: number[] }) => api.post("/roles", data),
  updateRole: (id: number, data: { name: string; permissions: number[] }) => api.put(`/roles/${id}`, data),
  deleteRole: (id: number) => api.delete(`/roles/${id}`),
  fetchPermissions: () => api.get("/roles/permissions"),

  // Admins & Employees
  fetchManagement: (type: "admin" | "employee") => api.get("/management", { params: { type } }),
  fetchManagementUser: (id: number) => api.get(`/management/${id}`),
  createManagementUser: (data: any) => api.post("/management", data),
  updateManagementUser: (id: number, data: any) => api.put(`/management/${id}`, data),
  deleteManagementUser: (id: number) => api.delete(`/management/${id}`),

  // Support Tickets
  fetchSupportTickets: (params?: { page?: number; priority?: string; status?: string }) =>
    api.get("/support-tickets", { params }),
  fetchAssignedTickets: () => api.get("/support-tickets/assigned"),
  fetchSupportTicket: (id: number) => api.get(`/support-tickets/${id}`),
  fetchTicketLogs: () => api.get("/support-ticket-logs"),
  replyToTicket: (id: number, data: { message: string }) => api.post(`/support-tickets/${id}/reply`, data),
  updateTicket: (id: number, data: { status?: string; priority?: string }) => api.patch(`/support-tickets/${id}`, data),
  assignTicket: (id: number, assignee_id: number) => api.patch(`/support-tickets/${id}/assign`, { assignee_id }),
  deleteTicket: (id: number) => api.delete(`/support-tickets/${id}`),

  // Subscriptions
  fetchPlans: () => api.get("/subscriptions/plans"),
  fetchPlan: (id: number) => api.get(`/subscriptions/plans/${id}`),
  createPlan: (data: any) => api.post("/subscriptions/plans", data),
  updatePlan: (id: number, data: any) => api.put(`/subscriptions/plans/${id}`, data),
  fetchFeatures: () => api.get("/subscriptions/features"),
  fetchFeature: (id: number) => api.get(`/subscriptions/features/${id}`),
  createFeature: (data: { name: string }) => api.post("/subscriptions/features", data),
  updateFeature: (id: number, data: { name: string }) => api.put(`/subscriptions/features/${id}`, data),
  deleteFeature: (id: number) => api.delete(`/subscriptions/features/${id}`),

  // Ads
  fetchAds: () => api.get("/ads"),
  fetchAd: (id: number) => api.get(`/ads/${id}`),
  createAd: (data: FormData) => api.post("/ads", data, { headers: { "Content-Type": "multipart/form-data" } }),
  updateAd: (id: number, data: any) => api.put(`/ads/${id}`, data),
  addMediaToAd: (id: number, media: FormData) =>
    api.post(`/ads/${id}/media`, media, { headers: { "Content-Type": "multipart/form-data" } }),
  deleteAdMedia: (adId: number, mediaId: number) => api.delete(`/ads/${adId}/media/${mediaId}`),

  // Products
  fetchUnits: () => api.get("/units"),
  createUnit: (data: { name: string }) => api.post("/units", data),
  fetchUnit: (id: number) => api.get(`/units/${id}`),
  updateUnit: (id: number, data: { name: string }) => api.put(`/units/${id}`, data),
  deleteUnit: (id: number) => api.delete(`/units/${id}`),

  fetchVariations: () => api.get("/variations"),
  fetchVariation: (id: number) => api.get(`/variations/${id}`),
  createVariation: (data: { name: string }) => api.post("/variations", data),
  updateVariation: (id: number, data: { name: string }) => api.put(`/variations/${id}`, data),
  deleteVariation: (id: number) => api.delete(`/variations/${id}`),

  fetchVariationValues: (variationId: number) => api.get(`/variations/${variationId}/values`),
  fetchVariationValue: (variationId: number, id: number) => api.get(`/variations/${variationId}/values/${id}`),
  createVariationValue: (variationId: number, data: { value: string }) =>
    api.post(`/variations/${variationId}/values`, data),
  updateVariationValue: (variationId: number, id: number, data: { value: string }) =>
    api.put(`/variations/${variationId}/values/${id}`, data),
  deleteVariationValue: (variationId: number, id: number) => api.delete(`/variations/${variationId}/values/${id}`),

  fetchProducts: (params?: { page?: number; search?: string }) => api.get("/products", { params }),
  fetchProduct: (id: number) => api.get(`/products/${id}`),
  createProduct: (data: any) => api.post("/products", data),
  updateProduct: (id: number, data: any) => api.put(`/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/products/${id}`),

  // Verification Requests (Companies)
  fetchVerificationRequests: (params?: {
    status?: string
    company_id?: string
    verified_by?: string
    per_page?: number
    page?: number
  }) => api.get("/companies/requests", { params }),
  fetchVerificationRequest: (id: number) => api.get(`/companies/requests/${id}`),
}

export default api
