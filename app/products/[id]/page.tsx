import { getProduct } from "@/lib/server-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  DollarSign,
  ShoppingCart,
  Star,
  Image as ImageIcon,
  Video,
  FileText,
  Hash,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Store,
  Tag,
  Box,
  TrendingUp,
  Eye,
  Layers,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import React from "react"

export const dynamic = "force-dynamic"

function formatDate(dateString?: string | null) {
  if (!dateString) return "غير متوفر"
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      calendar: "gregory",
    }).format(date)
  } catch {
    return dateString
  }
}

function normalizeProduct(input: any) {
  const categoryObject = input?.category
  const normalizedCategory = categoryObject
    ? { id: categoryObject?.id, name: categoryObject?.name, image: categoryObject?.image, icon: categoryObject?.icon }
    : input?.category_name
      ? { name: input.category_name }
      : typeof input?.category === "string"
        ? { name: input.category }
        : undefined

  const supplierObject = input?.supplier
  const normalizedSupplier = supplierObject
    ? {
        id: supplierObject?.id,
        name: supplierObject?.name,
        location: supplierObject?.location,
        logo: supplierObject?.logo,
        on_time_delivery_rate: supplierObject?.on_time_delivery_rate,
        rating: supplierObject?.rating,
      }
    : undefined

  return {
    id: Number(input?.id ?? 0),
    name: input?.name ?? "",
    label: input?.label || undefined,
    image: input?.image || undefined,
    video: input?.video || undefined,
    description: input?.description || input?.short_description || undefined,
    content: input?.content || undefined,
    moq: input?.moq != null ? Number(input.moq) : undefined,
    rating: input?.rating != null ? Number(input.rating) : undefined,
    price_type: input?.price_type || undefined,
    is_active: typeof input?.is_active === "boolean" ? input.is_active : Boolean(input?.is_active),
    unit: typeof input?.unit === "string" ? input.unit : input?.unit?.name || undefined,
    created_at: input?.created_at || undefined,
    updated_at: input?.updated_at || undefined,
    inventory: input?.inventory != null ? Number(input.inventory) : undefined,
    is_rts: Boolean(input?.is_rts),
    shown_price: input?.shown_price || undefined,
    reviews_count: input?.reviews_count != null ? Number(input.reviews_count) : undefined,
    skus_count: input?.skus_count != null ? Number(input.skus_count) : undefined,
    category: normalizedCategory,
    supplier: normalizedSupplier,
  }
}

export default async function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await getProduct(id)
  const product = normalizeProduct(raw)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </Link>
      </div>

      {/* Product Profile Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {product.image ? (
              <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-lg overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 128px, 160px"
                />
              </div>
            ) : (
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-lg bg-amber-200 border-4 border-white shadow-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-16 w-16 text-amber-600" />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    className={
                      product.is_active
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-gray-100 text-gray-800 border-gray-300"
                    }
                    variant="outline"
                  >
                    {product.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        نشط
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 ml-1" />
                        غير نشط
                      </>
                    )}
                  </Badge>
                  {product.is_rts && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      <Box className="h-3 w-3 ml-1" />
                      جاهز للشحن
                    </Badge>
                  )}
                  {product.label && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      <Tag className="h-3 w-3 ml-1" />
                      {product.label}
                    </Badge>
                  )}
                </div>
              </div>
              {product.description && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{product.description}</p>
              )}
              {product.shown_price && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-600" />
                  <span className="text-xl font-bold text-amber-700">{product.shown_price}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Section */}
          {(product.image || product.video) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-amber-600" />
                  الوسائط
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.image && (
                  <div className="relative w-full h-64 sm:h-96 rounded-lg overflow-hidden border">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain bg-gray-50"
                      sizes="(max-width: 768px) 100vw, 66vw"
                    />
                  </div>
                )}
                {product.video && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-gray-900">
                    <video
                      src={product.video}
                      controls
                      className="w-full h-full"
                      style={{ maxHeight: "500px" }}
                    >
                      متصفحك لا يدعم تشغيل الفيديو
                    </video>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-amber-600" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem icon={<Hash className="h-4 w-4" />} label="المعرف" value={product.id.toString()} />
                {product.moq && (
                  <InfoItem
                    icon={<ShoppingCart className="h-4 w-4" />}
                    label="الحد الأدنى للطلب"
                    value={`${product.moq} ${product.unit || "قطعة"}`}
                  />
                )}
                {product.unit && (
                  <InfoItem icon={<Box className="h-4 w-4" />} label="الوحدة" value={product.unit} />
                )}
                {product.price_type && (
                  <InfoItem
                    icon={<DollarSign className="h-4 w-4" />}
                    label="نوع السعر"
                    value={product.price_type === "range" ? "نطاق سعري" : product.price_type === "fixed" ? "سعر ثابت" : product.price_type}
                  />
                )}
                {product.inventory != null && (
                  <InfoItem
                    icon={<Layers className="h-4 w-4" />}
                    label="المخزون"
                    value={product.inventory.toString()}
                  />
                )}
                {product.skus_count != null && (
                  <InfoItem icon={<Hash className="h-4 w-4" />} label="عدد المتغيرات" value={product.skus_count.toString()} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Section */}
          {product.content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  المحتوى التفصيلي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.content }}
                />
              </CardContent>
            </Card>
          )}

          {/* Category Information */}
          {product.category && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-amber-600" />
                  الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {product.category.image && (
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                      <Image
                        src={product.category.image}
                        alt={product.category.name || "فئة"}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-lg">{product.category.name || "غير محدد"}</p>
                    {product.category.id && (
                      <p className="text-sm text-gray-500">ID: {product.category.id}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Supplier Information */}
          {product.supplier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-amber-600" />
                  معلومات المورد
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {product.supplier.logo ? (
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={product.supplier.logo} alt={product.supplier.name} />
                      <AvatarFallback>{product.supplier.name?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        <Store className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.supplier.name || "غير متوفر"}</p>
                    {product.supplier.location && (
                      <p className="text-xs text-gray-500 truncate">{product.supplier.location}</p>
                    )}
                  </div>
                </div>
                <Separator />
                {product.supplier.rating && (
                  <InfoItem
                    icon={<Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />}
                    label="التقييم"
                    value={product.supplier.rating}
                    size="sm"
                  />
                )}
                {product.supplier.on_time_delivery_rate && (
                  <InfoItem
                    icon={<TrendingUp className="h-4 w-4" />}
                    label="معدل التسليم في الوقت المحدد"
                    value={`${product.supplier.on_time_delivery_rate}%`}
                    size="sm"
                  />
                )}
                {product.supplier.id && (
                  <Link href={`/companies/${product.supplier.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      عرض تفاصيل المورد
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Ratings & Reviews */}
          {(product.rating != null || product.reviews_count != null) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-600" />
                  التقييمات والمراجعات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.rating != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">التقييم</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                {product.reviews_count != null && (
                  <>
                    {product.rating != null && <Separator />}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">عدد المراجعات</span>
                      <Badge variant="secondary">{product.reviews_count}</Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dates & Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                التواريخ والحالة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.created_at && (
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="تاريخ الإنشاء"
                  value={formatDate(product.created_at)}
                  size="sm"
                />
              )}
              {product.updated_at && (
                <>
                  {product.created_at && <Separator />}
                  <InfoItem
                    icon={<Clock className="h-4 w-4" />}
                    label="آخر تحديث"
                    value={formatDate(product.updated_at)}
                    size="sm"
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-600" />
                معلومات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">جاهز للشحن</span>
                <Badge variant={product.is_rts ? "default" : "secondary"}>
                  {product.is_rts ? "نعم" : "لا"}
                </Badge>
              </div>
              {product.inventory != null && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">المخزون المتاح</span>
                    <Badge className="text-white" variant={product.inventory > 0 ? "default" : "destructive"}>
                      {product.inventory}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Helper component for info items
function InfoItem({
  icon,
  label,
  value,
  size = "default",
  className = "",
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode | string
  size?: "sm" | "default"
  className?: string
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className={`text-gray-500 ${size === "sm" ? "text-xs" : "text-sm"}`}>{label}</span>
      </div>
      <div className={`text-gray-900 ${size === "sm" ? "text-sm" : "text-base"} font-medium`}>
        {value}
      </div>
    </div>
  )
}

