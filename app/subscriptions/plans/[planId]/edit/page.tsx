import { notFound } from "next/navigation"
import { PlanEditPage } from "@/components/dashboard/plan-edit-page"
import { getPlan } from "@/lib/server-actions"
import { normalizePlanDetail } from "@/lib/plans"

type ParamsInput = { planId: string }

interface EditPlanPageProps {
  params: ParamsInput | Promise<ParamsInput>
}

export default async function EditPlanRoute({ params }: EditPlanPageProps) {
  const resolvedParams = await params
  const planId = resolvedParams?.planId ?? ""

  if (!planId) {
    notFound()
  }

  let planPayload: any = null
  try {
    planPayload = await getPlan(planId)
  } catch {
    // Ignore - handled below
  }

  const normalizedPlan = planPayload ? normalizePlanDetail(planPayload) : null

  return <PlanEditPage planId={planId} initialPlan={normalizedPlan} />
}
