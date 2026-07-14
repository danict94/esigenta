"use server"

import {
  authorizeCompanyDocumentUpload,
  finalizeCompanyDocumentUpload,
  type AuthorizeCompanyDocumentUploadErrorCode,
  type FinalizeCompanyDocumentUploadErrorCode,
} from "@esigenta/domain"

import { revalidatePath } from "next/cache"

import { requireCompanyActor } from "../../../../auth/server"

// Called imperatively from a client component (file upload is a multi-step
// flow: authorize -> direct PUT to R2 -> finalize), so unlike the
// form-action pattern in profile-actions.ts these never redirect on auth
// failure — they return a clean result the client can render inline.

export type AuthorizeCompanyDocumentUploadActionInput = {
  documentType: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export type AuthorizeCompanyDocumentUploadActionResult =
  | { ok: true; objectKey: string; uploadUrl: string }
  | { ok: false; code: AuthorizeCompanyDocumentUploadErrorCode | "unauthorized" }

export async function authorizeCompanyDocumentUploadAction(
  input: AuthorizeCompanyDocumentUploadActionInput,
): Promise<AuthorizeCompanyDocumentUploadActionResult> {
  let actor
  try {
    actor = await requireCompanyActor()
  } catch {
    return { ok: false, code: "unauthorized" }
  }

  return authorizeCompanyDocumentUpload(actor, input)
}

export type FinalizeCompanyDocumentUploadActionInput = {
  documentType: string
  objectKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export type FinalizeCompanyDocumentUploadActionResult =
  | { ok: true }
  | { ok: false; code: FinalizeCompanyDocumentUploadErrorCode | "unauthorized" }

export async function finalizeCompanyDocumentUploadAction(
  input: FinalizeCompanyDocumentUploadActionInput,
): Promise<FinalizeCompanyDocumentUploadActionResult> {
  let actor
  try {
    actor = await requireCompanyActor()
  } catch {
    return { ok: false, code: "unauthorized" }
  }

  const result = await finalizeCompanyDocumentUpload(actor, input)

  if (result.ok) {
    revalidatePath("/area-impresa/profilo")
  }

  return result
}
