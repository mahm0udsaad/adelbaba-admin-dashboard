import { getCompany } from "@/lib/server-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

function normalizeCompany(input: any) {
  const cityName = input?.city?.name || input?.city_name || input?.city
  const stateName = input?.state?.name || input?.state_name || input?.state
  const regionName = input?.region?.name || input?.region_name || input?.region
  const email =
    input?.contact_email || input?.email || input?.contact?.email || input?.owner?.email || input?.owner_email

  return {
    id: Number(input?.id),
    name: input?.name ?? "",
    description: input?.short_description || input?.description || undefined,
    founded_year: input?.founded_year ? Number(input?.founded_year) : undefined,
    headquarters: input?.headquarters || undefined,
    contact_email: email || undefined,
    region: regionName || undefined,
    state: stateName || undefined,
    city: cityName || undefined,
    address: input?.address || undefined,
    phone: input?.contact_phone || input?.phone || input?.owner?.phone || undefined,
    is_active: Boolean(input?.is_active),
    is_verified: Boolean(input?.is_verified),
    created_at: input?.created_at,
    updated_at: input?.updated_at,
  }
}

export default async function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const raw = await getCompany(params.id)
  const company = normalizeCompany(raw)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>{company.name}</span>
            <div className="flex gap-2">
              <Badge className={company.is_active ? "bg-green-100 text-green-800" : ""} variant="secondary">
                {company.is_active ? "نشطة" : "غير نشطة"}
              </Badge>
              {company.is_verified && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  موثقة
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">الوصف</div>
              <div className="text-sm">{company.description || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">البريد الإلكتروني</div>
              <div className="text-sm">{company.contact_email || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">الهاتف</div>
              <div className="text-sm">{company.phone || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">الموقع</div>
              <div className="text-sm">
                {company.city && company.state ? `${company.city}, ${company.state}` : company.region || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">سنة التأسيس</div>
              <div className="text-sm">{company.founded_year || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">العنوان</div>
              <div className="text-sm">{company.address || company.headquarters || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">أُنشئت في</div>
              <div className="text-sm">{company.created_at || "—"}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">آخر تحديث</div>
              <div className="text-sm">{company.updated_at || "—"}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


