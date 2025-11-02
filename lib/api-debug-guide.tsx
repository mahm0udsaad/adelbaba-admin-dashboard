import axios from "axios"

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_ADMIN_API_URL ??
    (process.env.NEXT_PUBLIC_BACKEND_URL
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "")}/api/v1/admin`
      : "https://api.adil-baba.com/api/v1/admin"),
  headers: { Accept: "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
