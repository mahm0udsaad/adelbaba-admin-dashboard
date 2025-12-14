import { notFound } from "next/navigation"
import { Suspense } from "react"
import { RoleEditPage } from "@/components/dashboard/role-edit-page"
import { Loader2 } from "lucide-react"
import { getRole } from "@/lib/server-actions"

type ParamsInput = { id: string }

interface EditRolePageProps {
  params: ParamsInput | Promise<ParamsInput>
}

export const dynamic = "force-dynamic"

export default async function EditRoleRoute({ params }: EditRolePageProps) {
  const resolvedParams = await params
  const roleId = resolvedParams?.id ?? ""

  if (!roleId) {
    notFound()
  }

  const roleIdNum = parseInt(roleId, 10)
  if (isNaN(roleIdNum)) {
    notFound()
  }

  let rolePayload: any = null
  try {
    rolePayload = await getRole(roleIdNum)
  } catch {
    // Ignore - will be handled by component
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          <span className="mr-2 rtl:ml-2 text-amber-800">جاري التحميل...</span>
        </div>
      }
    >
      <RoleEditPage roleId={roleIdNum} initialRole={rolePayload} />
    </Suspense>
  )
}

