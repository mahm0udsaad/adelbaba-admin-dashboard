"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Eye, Loader2, Download } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { apiService } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

type Order = {
  id: number
  order_number?: string
  user?: {
    id: number
    name: string
    email: string
    phone: string
  }
  payment_status: string
  shipment_status: string
  total?: number
  currency?: string
  created_at: string
  updated_at: string
}

const PAYMENT_STATUSES = [
  { value: "all", label: "جميع حالات الدفع" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "completed", label: "مكتمل" },
  { value: "failed", label: "فشل" },
  { value: "cancelled", label: "ملغي" },
  { value: "refunded", label: "مسترد" },
  { value: "expired", label: "منتهي" },
]

const SHIPMENT_STATUSES = [
  { value: "all", label: "جميع حالات الشحن" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "in_transit", label: "في الطريق" },
  { value: "out_for_delivery", label: "خارج للتسليم" },
  { value: "delivered", label: "تم التسليم" },
  { value: "failed_delivery", label: "فشل التسليم" },
  { value: "returned", label: "مرتجع" },
  { value: "cancelled", label: "ملغي" },
]

export function OrdersPage({ initialOrders }: { initialOrders?: Order[] }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders ?? [])
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("all")
  const [shipmentStatus, setShipmentStatus] = useState("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { toast } = useToast()

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        const params: any = { sort: sortOrder }
        if (paymentStatus !== "all") params.payment_status = paymentStatus
        if (shipmentStatus !== "all") params.shipment_status = shipmentStatus

        const res = await apiService.fetchOrders(params)
        setOrders(res.data?.data || res.data || [])
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "فشل تحميل الطلبات"
        setError(errorMessage)
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (initialOrders === undefined) {
      loadOrders()
    }
  }, [initialOrders, paymentStatus, shipmentStatus, sortOrder, toast])

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      processing: { variant: "secondary", className: "bg-blue-100 text-blue-800" },
      completed: { variant: "default", className: "bg-green-100 text-green-800" },
      failed: { variant: "destructive", className: "bg-red-100 text-red-800" },
      cancelled: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
      refunded: { variant: "secondary", className: "bg-purple-100 text-purple-800" },
      expired: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
    }
    return variants[status] || { variant: "secondary", className: "" }
  }

  const getShipmentStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; className: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
      processing: { variant: "secondary", className: "bg-blue-100 text-blue-800" },
      shipped: { variant: "secondary", className: "bg-indigo-100 text-indigo-800" },
      in_transit: { variant: "secondary", className: "bg-cyan-100 text-cyan-800" },
      out_for_delivery: { variant: "secondary", className: "bg-teal-100 text-teal-800" },
      delivered: { variant: "default", className: "bg-green-100 text-green-800" },
      failed_delivery: { variant: "destructive", className: "bg-red-100 text-red-800" },
      returned: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
      cancelled: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
    }
    return variants[status] || { variant: "secondary", className: "" }
  }

  const getStatusLabel = (status: string, type: "payment" | "shipment") => {
    const statuses = type === "payment" ? PAYMENT_STATUSES : SHIPMENT_STATUSES
    return statuses.find((s) => s.value === status)?.label || status
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      order.order_number?.toLowerCase().includes(searchLower) ||
      order.user?.name?.toLowerCase().includes(searchLower) ||
      order.user?.email?.toLowerCase().includes(searchLower) ||
      order.user?.phone?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rtl:pl-3 rtl:pr-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="حالة الدفع" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={shipmentStatus} onValueChange={setShipmentStatus}>
            <SelectTrigger>
              <SelectValue placeholder="حالة الشحن" />
            </SelectTrigger>
            <SelectContent>
              {SHIPMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={(v: any) => setSortOrder(v)}>
            <SelectTrigger>
              <SelectValue placeholder="الترتيب" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">الأحدث أولاً</SelectItem>
              <SelectItem value="asc">الأقدم أولاً</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && orders.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
              <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد طلبات"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>حالة الدفع</TableHead>
                    <TableHead>حالة الشحن</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-left rtl:text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const paymentBadge = getPaymentStatusBadge(order.payment_status)
                    const shipmentBadge = getShipmentStatusBadge(order.shipment_status)

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number || `#${order.id}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{order.user?.name || "-"}</span>
                            <span className="text-sm text-gray-500">{order.user?.email || "-"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={paymentBadge.variant} className={paymentBadge.className}>
                            {getStatusLabel(order.payment_status, "payment")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={shipmentBadge.variant} className={shipmentBadge.className}>
                            {getStatusLabel(order.shipment_status, "shipment")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleDateString("ar-SA")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="ml-2 rtl:mr-2 rtl:ml-0 h-4 w-4" />
                                تحميل الفاتورة
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

