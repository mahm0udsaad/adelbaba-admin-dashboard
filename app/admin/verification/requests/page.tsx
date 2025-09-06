import { listVerificationRequests, type Paginated, type SupplierRequest, type RequestStatus } from "@/lib/server-actions"
import { Card } from "@/components/ui/card"
import RequestsTable from "./requests-table"
import RequestsPagination from "./pagination"
import { updateRequestAction, quickUpdateAction } from "./actions"
import FiltersBar from "./requests-filters"
import { Suspense } from "react"

interface SearchParams {
  status?: RequestStatus | "all"
  company_id?: string
  verified_by?: string
  per_page?: string
  page?: string
}

export default async function VerificationRequestsPage({ searchParams }: { searchParams: SearchParams }) {
  const perPage = Number(searchParams.per_page ?? "20")
  const page = Number(searchParams.page ?? "1")
  const status = (searchParams.status && searchParams.status !== "all" ? searchParams.status : undefined) as RequestStatus | undefined
  const params = { status, company_id: searchParams.company_id, verified_by: searchParams.verified_by, per_page: perPage, page }
  const data = await listVerificationRequests(params)
  
  return (
    <div className="space-y-4">
      <FiltersBar initialParams={searchParams} />
      <Card className="p-0 overflow-hidden">
        <Suspense fallback={<div className="p-6">جارٍ التحميل...</div>}>
          <RequestsTable payload={data} params={params} quickAction={quickUpdateAction} updateAction={updateRequestAction} />
        </Suspense>
      </Card>
      <RequestsPagination current={data.meta?.current_page ?? 1} last={data.meta?.last_page} />
    </div>
  )
}


