import { randomUUID } from "node:crypto"

import type { CompanyActor } from "@esigenta/auth"
import { createR2SignedUploadUrl } from "@esigenta/uploads/r2"

import { COMPANY_DOCUMENT_REQUIREMENTS } from "./company-document-requirements"

export type AuthorizeCompanyDocumentUploadErrorCode =
  | "invalid_document_type"
  | "invalid_mime_type"
  | "invalid_file_size"
  | "invalid_file_name"

export type AuthorizeCompanyDocumentUploadInput = {
  documentType: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export type AuthorizeCompanyDocumentUploadResult =
  | { ok: true; objectKey: string; uploadUrl: string }
  | { ok: false; code: AuthorizeCompanyDocumentUploadErrorCode }

const UPLOAD_URL_EXPIRES_SECONDS = 5 * 60

/**
 * Strips everything but safe filename characters and caps length — kept
 * only for a readable object key, never trusted for content-type or
 * extension-based decisions (mimeType is validated separately).
 */
function sanitizeFileName(rawName: string): string | null {
  const trimmed = rawName.trim()
  if (!trimmed) return null

  const safe = trimmed
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(-120)

  return safe || null
}

/**
 * Step 1 of the presigned upload flow: validates the declared upload
 * against the static requirements catalog, then generates a server-side
 * objectKey (never trusts a client-provided one) and a short-lived
 * presigned PUT URL. Nothing is written to the database here — the row is
 * only created/updated once finalizeCompanyDocumentUpload confirms the
 * object actually landed in R2.
 */
export async function authorizeCompanyDocumentUpload(
  actor: CompanyActor,
  input: AuthorizeCompanyDocumentUploadInput,
): Promise<AuthorizeCompanyDocumentUploadResult> {
  const requirement = COMPANY_DOCUMENT_REQUIREMENTS.find(
    (item) => item.type === input.documentType,
  )

  if (!requirement) {
    return { ok: false, code: "invalid_document_type" }
  }

  if (!requirement.acceptedMimeTypes.some((mimeType) => mimeType === input.mimeType)) {
    return { ok: false, code: "invalid_mime_type" }
  }

  if (
    !Number.isFinite(input.sizeBytes) ||
    input.sizeBytes <= 0 ||
    input.sizeBytes > requirement.maxSizeBytes
  ) {
    return { ok: false, code: "invalid_file_size" }
  }

  const safeFileName = sanitizeFileName(input.fileName)
  if (!safeFileName) {
    return { ok: false, code: "invalid_file_name" }
  }

  const objectKey = `company-documents/${actor.company.id}/${requirement.type}/${randomUUID()}-${safeFileName}`

  const uploadUrl = await createR2SignedUploadUrl(
    objectKey,
    input.mimeType,
    UPLOAD_URL_EXPIRES_SECONDS,
  )

  return { ok: true, objectKey, uploadUrl }
}
