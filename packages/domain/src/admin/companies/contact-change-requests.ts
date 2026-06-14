import type {
  CompanyContactChangeField,
  CompanyContactChangeStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

export type CompanyContactChangeRequestResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      code: string
      message: string
    }

export type CreateCompanyContactChangeRequestInput = {
  companyId: string
  requestedByUserId: string
  field: CompanyContactChangeField
  requestedValue: string
}

export type CreateCompanyContactChangeRequestData = {
  companyContactChangeRequestId: string
  status: CompanyContactChangeStatus
}

export type ReviewCompanyContactChangeRequestInput = {
  companyContactChangeRequestId: string
  adminUserId: string
  adminNotes?: string | null
}

export type ReviewCompanyContactChangeRequestData = {
  companyContactChangeRequestId: string
  status: CompanyContactChangeStatus
}

export type AdminCompanyContactChangeRequestReviewItem = {
  id: string
  field: CompanyContactChangeField
  currentValue: string | null
  requestedValue: string
  status: CompanyContactChangeStatus
  adminNotes: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
  company: {
    id: string
    phone: string
  }
  requestedByUser: {
    id: string
    email: string
    name: string | null
  }
  reviewedByAdminUser: {
    id: string
    email: string
    name: string | null
  } | null
}

const allowedFields: CompanyContactChangeField[] = [
  "PHONE",
]

function normalizeText(value: string | null | undefined) {
  const normalized = value?.trim() ?? ""

  return normalized.length > 0 ? normalized : null
}

function normalizeRequestedValue(
  value: string,
): CompanyContactChangeRequestResult<{ requestedValue: string }> {
  const normalizedValue = normalizeText(value)

  if (!normalizedValue) {
    return {
      ok: false,
      code: "invalid_requested_value",
      message: "Inserisci un valore valido.",
    }
  }

  if (normalizedValue.length < 5 || normalizedValue.length > 40) {
    return {
      ok: false,
      code: "invalid_phone",
      message: "Inserisci un telefono aziendale valido.",
    }
  }

  return {
    ok: true,
    data: {
      requestedValue: normalizedValue,
    },
  }
}

export async function createCompanyContactChangeRequest({
  companyId,
  requestedByUserId,
  field,
  requestedValue,
}: CreateCompanyContactChangeRequestInput): Promise<
  CompanyContactChangeRequestResult<CreateCompanyContactChangeRequestData>
> {
  const normalizedCompanyId = normalizeText(companyId)
  const normalizedRequestedByUserId = normalizeText(requestedByUserId)

  if (!normalizedCompanyId) {
    return {
      ok: false,
      code: "invalid_company_id",
      message: "Impresa non valida.",
    }
  }

  if (!normalizedRequestedByUserId) {
    return {
      ok: false,
      code: "invalid_requested_by_user_id",
      message: "Utente richiedente non valido.",
    }
  }

  if (!allowedFields.includes(field)) {
    return {
      ok: false,
      code: "invalid_field",
      message: "Campo non modificabile.",
    }
  }

  const requestedValueResult =
    normalizeRequestedValue(requestedValue)

  if (!requestedValueResult.ok) {
    return requestedValueResult
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Company"
      WHERE "id" = ${normalizedCompanyId}
      FOR UPDATE
    `

    const membership = await tx.companyMembership.findFirst({
      where: {
        companyId: normalizedCompanyId,
        userId: normalizedRequestedByUserId,
      },
      select: {
        id: true,
      },
    })

    if (!membership) {
      return {
        ok: false,
        code: "company_membership_not_found",
        message: "Non puoi richiedere modifiche per questa impresa.",
      }
    }

    const company = await tx.company.findUnique({
      where: {
        id: normalizedCompanyId,
      },
      select: {
        id: true,
        phone: true,
      },
    })

    if (!company) {
      return {
        ok: false,
        code: "company_not_found",
        message: "Impresa non trovata.",
      }
    }

    const currentValue =
      company.phone

    if (
      normalizeText(currentValue) ===
      requestedValueResult.data.requestedValue
    ) {
      return {
        ok: false,
        code: "requested_value_unchanged",
        message: "Il valore richiesto è già impostato.",
      }
    }

    const existingPendingRequest =
      await tx.companyContactChangeRequest.findFirst({
        where: {
          companyId: normalizedCompanyId,
          field,
          status: "PENDING_REVIEW",
        },
        select: {
          id: true,
        },
      })

    if (existingPendingRequest) {
      return {
        ok: false,
        code: "company_contact_change_request_already_pending",
        message:
          "Esiste già una richiesta in revisione per questo dato di contatto.",
      }
    }

    const changeRequest =
      await tx.companyContactChangeRequest.create({
        data: {
          companyId: normalizedCompanyId,
          requestedByUserId: normalizedRequestedByUserId,
          field,
          currentValue,
          requestedValue: requestedValueResult.data.requestedValue,
          status: "PENDING_REVIEW",
        },
        select: {
          id: true,
          status: true,
        },
      })

    return {
      ok: true,
      data: {
        companyContactChangeRequestId: changeRequest.id,
        status: changeRequest.status,
      },
    }
  })
}

export async function listCompanyContactChangeRequestsForAdminReview(): Promise<
  AdminCompanyContactChangeRequestReviewItem[]
> {
  return prisma.companyContactChangeRequest.findMany({
    where: {
      status: "PENDING_REVIEW",
    },
    orderBy: [
      {
        createdAt: "asc",
      },
    ],
    select: {
      id: true,
      field: true,
      currentValue: true,
      requestedValue: true,
      status: true,
      adminNotes: true,
      reviewedAt: true,
      createdAt: true,
      updatedAt: true,
      company: {
        select: {
          id: true,
          phone: true,
        },
      },
      requestedByUser: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      reviewedByAdminUser: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  })
}

export async function approveCompanyContactChangeRequest({
  companyContactChangeRequestId,
  adminUserId,
  adminNotes,
}: ReviewCompanyContactChangeRequestInput): Promise<
  CompanyContactChangeRequestResult<ReviewCompanyContactChangeRequestData>
> {
  const normalizedRequestId = normalizeText(companyContactChangeRequestId)
  const normalizedAdminUserId = normalizeText(adminUserId)
  const normalizedAdminNotes = adminNotes ? normalizeText(adminNotes) : null

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "invalid_company_contact_change_request_id",
      message: "Richiesta non valida.",
    }
  }

  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message: "Admin non valido.",
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "CompanyContactChangeRequest"
      WHERE "id" = ${normalizedRequestId}
      FOR UPDATE
    `

    const changeRequest =
      await tx.companyContactChangeRequest.findUnique({
        where: {
          id: normalizedRequestId,
        },
        select: {
          id: true,
          companyId: true,
          field: true,
          requestedValue: true,
          status: true,
        },
      })

    if (!changeRequest) {
      return {
        ok: false,
        code: "company_contact_change_request_not_found",
        message: "Richiesta non trovata.",
      }
    }

    if (changeRequest.status !== "PENDING_REVIEW") {
      return {
        ok: false,
        code: "company_contact_change_request_not_pending",
        message: "Questa pratica non è più in revisione.",
      }
    }

    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "Company"
      WHERE "id" = ${changeRequest.companyId}
      FOR UPDATE
    `

    if (changeRequest.field !== "PHONE") {
      return {
        ok: false,
        code: "invalid_field",
        message: "Campo non modificabile.",
      }
    }

    await tx.company.update({
      where: {
        id: changeRequest.companyId,
      },
      data: {
        phone: changeRequest.requestedValue,
      },
    })

    await tx.companyContactChangeRequest.update({
      where: {
        id: changeRequest.id,
      },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedByAdminUserId: normalizedAdminUserId,
        adminNotes: normalizedAdminNotes,
      },
    })

    return {
      ok: true,
      data: {
        companyContactChangeRequestId: changeRequest.id,
        status: "APPROVED",
      },
    }
  })
}

export async function rejectCompanyContactChangeRequest({
  companyContactChangeRequestId,
  adminUserId,
  adminNotes,
}: ReviewCompanyContactChangeRequestInput): Promise<
  CompanyContactChangeRequestResult<ReviewCompanyContactChangeRequestData>
> {
  const normalizedRequestId = normalizeText(companyContactChangeRequestId)
  const normalizedAdminUserId = normalizeText(adminUserId)
  const normalizedAdminNotes = normalizeText(adminNotes)

  if (!normalizedRequestId) {
    return {
      ok: false,
      code: "invalid_company_contact_change_request_id",
      message: "Richiesta non valida.",
    }
  }

  if (!normalizedAdminUserId) {
    return {
      ok: false,
      code: "invalid_admin_user_id",
      message: "Admin non valido.",
    }
  }

  if (!normalizedAdminNotes || normalizedAdminNotes.length < 3) {
    return {
      ok: false,
      code: "invalid_admin_notes",
      message: "Inserisci una nota admin di almeno 3 caratteri.",
    }
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "CompanyContactChangeRequest"
      WHERE "id" = ${normalizedRequestId}
      FOR UPDATE
    `

    const changeRequest =
      await tx.companyContactChangeRequest.findUnique({
        where: {
          id: normalizedRequestId,
        },
        select: {
          id: true,
          status: true,
        },
      })

    if (!changeRequest) {
      return {
        ok: false,
        code: "company_contact_change_request_not_found",
        message: "Richiesta non trovata.",
      }
    }

    if (changeRequest.status !== "PENDING_REVIEW") {
      return {
        ok: false,
        code: "company_contact_change_request_not_pending",
        message: "Questa pratica non è più in revisione.",
      }
    }

    await tx.companyContactChangeRequest.update({
      where: {
        id: changeRequest.id,
      },
      data: {
        status: "REJECTED",
        reviewedAt: new Date(),
        reviewedByAdminUserId: normalizedAdminUserId,
        adminNotes: normalizedAdminNotes,
      },
    })

    return {
      ok: true,
      data: {
        companyContactChangeRequestId: changeRequest.id,
        status: "REJECTED",
      },
    }
  })
}
