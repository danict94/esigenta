import type { CompanyActor } from "@esigenta/auth"
import { prisma } from "@esigenta/database"
import { deleteR2Object, getR2ObjectMetadata } from "@esigenta/uploads/r2"

import { COMPANY_DOCUMENT_REQUIREMENTS } from "./company-document-requirements"

export type FinalizeCompanyDocumentUploadErrorCode =
  | "invalid_document_type"
  | "invalid_mime_type"
  | "invalid_file_size"
  | "invalid_object_key"
  | "object_not_found"

export type FinalizeCompanyDocumentUploadInput = {
  documentType: string
  objectKey: string
  fileName: string
  mimeType: string
  sizeBytes: number
}

export type FinalizeCompanyDocumentUploadResult =
  | { ok: true }
  | { ok: false; code: FinalizeCompanyDocumentUploadErrorCode }

/**
 * Step 2 of the presigned upload flow, called after the client PUTs the
 * file directly to R2. Re-validates everything server-side (never trusts
 * the client's earlier authorize-time inputs), confirms the object key
 * belongs to this company via prefix check, and confirms the object
 * actually exists in R2 via HeadObject before writing any DB row — this is
 * what stops one company from finalizing another company's objectKey, and
 * what stops a client from claiming an upload that never happened.
 */
export async function finalizeCompanyDocumentUpload(
  actor: CompanyActor,
  input: FinalizeCompanyDocumentUploadInput,
): Promise<FinalizeCompanyDocumentUploadResult> {
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

  const expectedPrefix = `company-documents/${actor.company.id}/${requirement.type}/`
  if (!input.objectKey.startsWith(expectedPrefix)) {
    return { ok: false, code: "invalid_object_key" }
  }

  const metadata = await getR2ObjectMetadata(input.objectKey)
  if (!metadata) {
    return { ok: false, code: "object_not_found" }
  }

  const existing = await prisma.companyDocument.findUnique({
    where: {
      companyId_documentType: {
        companyId: actor.company.id,
        documentType: requirement.type,
      },
    },
    select: { objectKey: true },
  })

  await prisma.companyDocument.upsert({
    where: {
      companyId_documentType: {
        companyId: actor.company.id,
        documentType: requirement.type,
      },
    },
    create: {
      companyId: actor.company.id,
      documentType: requirement.type,
      status: "PENDING_REVIEW",
      objectKey: input.objectKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      uploadedByUserId: actor.user.id,
      uploadedAt: new Date(),
    },
    update: {
      status: "PENDING_REVIEW",
      objectKey: input.objectKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      uploadedByUserId: actor.user.id,
      uploadedAt: new Date(),
      reviewedAt: null,
      reviewedByAdminUserId: null,
      rejectionReason: null,
    },
  })

  // Only delete the old object once the DB already points at the new one —
  // if delete fails (network blip, permissions), the company must not be
  // blocked: log and move on, an orphan file is an acceptable MVP cost.
  const oldObjectKey = existing?.objectKey
  if (oldObjectKey && oldObjectKey !== input.objectKey) {
    try {
      await deleteR2Object(oldObjectKey)
    } catch (error) {
      console.error("company_document_old_object_delete_failed", {
        companyId: actor.company.id,
        documentType: requirement.type,
        error,
      })
    }
  }

  return { ok: true }
}
