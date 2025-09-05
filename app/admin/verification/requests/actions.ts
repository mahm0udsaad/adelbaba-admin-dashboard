"use server"

import { revalidatePath } from "next/cache"
import { updateVerificationRequest, type SupplierRequest } from "@/lib/server-actions"

export type UpdateState = { ok?: boolean; error?: string; data?: SupplierRequest }

export async function updateRequestAction(prev: UpdateState, formData: FormData): Promise<UpdateState> {
  try {
    const id = Number(formData.get("id"))
    const status = String(formData.get("status")) as any
    const reason = (formData.get("reason") as string) || undefined

    if (["rejected", "needs_more_info"].includes(status) && !String(reason || "").trim()) {
      return { error: "السبب مطلوب" }
    }

    const data = await updateVerificationRequest(id, { status, ...(reason ? { reason } : {}) })
    revalidatePath("/admin/verification/requests")
    return { ok: true, data }
  } catch (e: any) {
    return { error: e.message || "حدث خطأ" }
  }
}

export async function quickUpdateAction(prev: any, formData: FormData) {
  const id = Number(formData.get("id"))
  const status = String(formData.get("status")) as any
  const reason = (formData.get("reason") as string) || undefined
  const data = await updateVerificationRequest(id, { status, ...(reason ? { reason } : {}) })
  revalidatePath("/admin/verification/requests")
  return { ok: true, data }
}


