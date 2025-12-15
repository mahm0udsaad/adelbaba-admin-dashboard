import { getCompany } from "@/lib/server-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  User,
  Globe,
  CheckCircle2,
  XCircle,
  Store,
  ShoppingBag,
  Clock,
  Hash,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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

function formatDateShort(dateString?: string | null) {
  if (!dateString) return "غير متوفر"
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "gregory",
    }).format(date)
  } catch {
    return dateString
  }
}

function normalizeCompany(input: any) {
  const cityName = input?.city?.name || input?.city_name || input?.city
  const stateName = input?.state?.name || input?.state_name || input?.state
  const regionName = input?.region?.name || input?.region_name || input?.region
  const email =
    input?.contact_email || input?.email || input?.contact?.email || input?.owner?.email || input?.owner_email
  const phone = input?.contact_phone || input?.phone || input?.owner?.phone || input?.owner_phone

  return {
    id: Number(input?.id),
    name: input?.name ?? "",
    logo: input?.logo || undefined,
    description: input?.short_description || input?.description || undefined,
    commercial_register: input?.commercial_register || undefined,
    founded_year: input?.founded_year ? Number(input?.founded_year) : undefined,
    headquarters: input?.headquarters || undefined,
    location: input?.location || undefined,
    contact_email: email || undefined,
    email: email || undefined,
    contact_phone: phone || undefined,
    phone: phone || undefined,
    region: input?.region || undefined,
    regionName: regionName || undefined,
    state: input?.state || undefined,
    stateName: stateName || undefined,
    city: input?.city || undefined,
    cityName: cityName || undefined,
    address: input?.address || undefined,
    company_type: input?.company_type || undefined,
    platforms: input?.platforms || undefined,
    is_supplier: Boolean(input?.is_supplier),
    is_buyer: Boolean(input?.is_buyer),
    is_active: Boolean(input?.is_active),
    is_verified: Boolean(input?.is_verified),
    verified_at: input?.verified_at || undefined,
    created_at: input?.created_at,
    updated_at: input?.updated_at,
    owner: input?.owner || undefined,
  }
}

export default async function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await getCompany(id)
  const company = normalizeCompany(raw)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowRight className="h-4 w-4" />
            العودة إلى القائمة
          </Button>
        </Link>
      </div>

      {/* Company Profile Header */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-lg">
              {company.logo ? (
                <AvatarImage src={company.logo} alt={company.name} />
              ) : null}
              <AvatarFallback className="text-2xl sm:text-3xl bg-amber-200 text-amber-800">
                {company.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    className={company.is_active ? "bg-green-100 text-green-800 border-green-300" : "bg-gray-100 text-gray-800 border-gray-300"}
                    variant="outline"
                  >
                    {company.is_active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 ml-1" />
                        نشطة
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 ml-1" />
                        غير نشطة
                      </>
                    )}
                  </Badge>
                  {company.is_verified && (
                    <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                      موثقة
                    </Badge>
                  )}
                  {company.is_supplier && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                      <Store className="h-3 w-3 ml-1" />
                      مورد
                    </Badge>
                  )}
                  {company.is_buyer && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                      <ShoppingBag className="h-3 w-3 ml-1" />
                      مشتري
                    </Badge>
                  )}
                </div>
              </div>
              {company.description && (
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">{company.description}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Main Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-600" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoItem
                  icon={<Hash className="h-4 w-4" />}
                  label="المعرف"
                  value={company.id.toString()}
                />
                {company.commercial_register && (
                  <InfoItem
                    icon={<FileText className="h-4 w-4" />}
                    label="رقم السجل التجاري"
                    value={company.commercial_register}
                  />
                )}
                {company.company_type && (
                  <InfoItem
                    icon={<Building2 className="h-4 w-4" />}
                    label="نوع الشركة"
                    value={company.company_type}
                  />
                )}
                {company.founded_year && (
                  <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="سنة التأسيس"
                    value={company.founded_year.toString()}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-amber-600" />
                معلومات الاتصال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.email && (
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="البريد الإلكتروني"
                    value={company.email}
                    isLink
                    href={`mailto:${company.email}`}
                  />
                )}
                {company.phone && (
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="الهاتف"
                    value={company.phone}
                    isLink
                    href={`tel:${company.phone}`}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-amber-600" />
                الموقع الجغرافي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.regionName && (
                  <InfoItem
                    icon={<Globe className="h-4 w-4" />}
                    label="الدولة / المنطقة"
                    value={
                      <div className="flex items-center gap-2">
                        {company.region?.picture && (
                          <img
                            src={company.region.picture}
                            alt={company.regionName}
                            className="h-5 w-5 rounded"
                          />
                        )}
                        <span>{company.regionName}</span>
                        {company.region?.code && (
                          <Badge variant="outline" className="text-xs">
                            {company.region.code}
                          </Badge>
                        )}
                      </div>
                    }
                  />
                )}
                {company.stateName && (
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="الولاية / المحافظة"
                    value={company.stateName}
                  />
                )}
                {company.cityName && (
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="المدينة"
                    value={company.cityName}
                  />
                )}
                {(company.location || company.address || company.headquarters) && (
                  <InfoItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="العنوان"
                    value={company.location || company.address || company.headquarters}
                    className="sm:col-span-2"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Owner Information */}
          {company.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-amber-600" />
                  معلومات المالك
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {company.owner.picture ? (
                      <AvatarImage src={company.owner.picture} alt={company.owner.name} />
                    ) : null}
                    <AvatarFallback>{company.owner.name?.charAt(0) || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{company.owner.name || "غير متوفر"}</p>
                    {company.owner.email && (
                      <p className="text-xs text-gray-500 truncate">{company.owner.email}</p>
                    )}
                  </div>
                </div>
                <Separator />
                {company.owner.phone && (
                  <InfoItem
                    icon={<Phone className="h-4 w-4" />}
                    label="الهاتف"
                    value={company.owner.phone}
                    isLink
                    href={`tel:${company.owner.phone}`}
                    size="sm"
                  />
                )}
                {company.owner.email && (
                  <InfoItem
                    icon={<Mail className="h-4 w-4" />}
                    label="البريد الإلكتروني"
                    value={company.owner.email}
                    isLink
                    href={`mailto:${company.owner.email}`}
                    size="sm"
                  />
                )}
                {company.owner.shares && (
                  <InfoItem
                    icon={<Hash className="h-4 w-4" />}
                    label="الأسهم"
                    value={`${company.owner.shares}%`}
                    size="sm"
                  />
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
              {company.created_at && (
                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="تاريخ الإنشاء"
                  value={formatDate(company.created_at)}
                  size="sm"
                />
              )}
              {company.updated_at && (
                <InfoItem
                  icon={<Clock className="h-4 w-4" />}
                  label="آخر تحديث"
                  value={formatDate(company.updated_at)}
                  size="sm"
                />
              )}
              {company.verified_at && (
                <InfoItem
                  icon={<CheckCircle2 className="h-4 w-4" />}
                  label="تاريخ التوثيق"
                  value={formatDate(company.verified_at)}
                  size="sm"
                />
              )}
            </CardContent>
          </Card>

          {/* Additional Info */}
          {(company.platforms || company.is_supplier || company.is_buyer) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5 text-amber-600" />
                  معلومات إضافية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">مورد</span>
                  <Badge variant={company.is_supplier ? "default" : "secondary"}>
                    {company.is_supplier ? "نعم" : "لا"}
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">مشتري</span>
                  <Badge variant={company.is_buyer ? "default" : "secondary"}>
                    {company.is_buyer ? "نعم" : "لا"}
                  </Badge>
                </div>
                {company.platforms && (
                  <>
                    <Separator />
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">المنصات</span>
                      <p className="text-sm">{company.platforms}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
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
  isLink = false,
  href,
  size = "default",
  className = "",
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode | string
  isLink?: boolean
  href?: string
  size?: "sm" | "default"
  className?: string
}) {
  const content = (
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

  if (isLink && href) {
    return (
      <a href={href} className="block hover:bg-gray-50 p-2 -m-2 rounded transition-colors">
        {content}
      </a>
    )
  }

  return content
}


