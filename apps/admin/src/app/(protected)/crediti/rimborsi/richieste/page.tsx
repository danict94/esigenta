import type {
  ReactNode,
} from "react"
import {
  revalidatePath,
} from "next/cache"

import {
  approveCreditRefundRequest,
  listCreditRefundRequestsForAdminReview,
  rejectCreditRefundRequest,
} from "@esigenta/billing"

import {
  Badge,
  Button,
  Card,
  PageShell,
  Textarea,
} from "@esigenta/ui"

import {
  requireAdmin,
} from "../../../../../auth/server"

export const dynamic = "force-dynamic"

async function approveRefundRequestAction(
  formData: FormData,
) {
  "use server"

  const admin =
    await requireAdmin()

  const result =
    await approveCreditRefundRequest({
      creditRefundRequestId:
        String(
          formData.get(
            "creditRefundRequestId",
          ) ?? "",
        ),
      adminUserId:
        admin.userId,
      adminNotes:
        String(
          formData.get("adminNotes") ?? "",
        ),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath(
    "/crediti/rimborsi/richieste",
  )
}

async function rejectRefundRequestAction(
  formData: FormData,
) {
  "use server"

  const admin =
    await requireAdmin()

  const result =
    await rejectCreditRefundRequest({
      creditRefundRequestId:
        String(
          formData.get(
            "creditRefundRequestId",
          ) ?? "",
        ),
      adminUserId:
        admin.userId,
      adminNotes:
        String(
          formData.get("adminNotes") ?? "",
        ),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath(
    "/crediti/rimborsi/richieste",
  )
}

const reasonLabels: Record<string, string> = {
  CUSTOMER_NOT_RESPONDING: "Cliente non risponde",
  INVALID_CONTACTS: "Contatti errati o non funzionanti",
  REQUEST_ALREADY_RESOLVED: "Richiesta gi\u00e0 risolta",
  INVALID_OR_SPAM_REQUEST: "Richiesta non valida, spam o falsa",
  DUPLICATE_REQUEST: "Richiesta duplicata",
  OTHER: "Altro motivo da valutare",
}

const statusLabels: Record<string, string> = {
  PENDING_REVIEW: "In revisione",
  APPROVED: "Approvata",
  REJECTED: "Rifiutata",
  CANCELLED: "Annullata",
}

function getStatusBadgeVariant(status: string) {
  if (status === "APPROVED") {
    return "success" as const
  }

  if (status === "REJECTED") {
    return "danger" as const
  }

  return "warning" as const
}

function formatDate(date: Date | null) {
  if (!date) {
    return "-"
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "-"
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function Field({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-eg-ardesia">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-eg-terra">
        {value}
      </dd>
    </div>
  )
}

export default async function AdminCreditRefundRequestsPage() {
  await requireAdmin()

  const refundRequests =
    await listCreditRefundRequestsForAdminReview()

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <header className="border-b border-eg-hairline pb-7">
        <p className="text-sm font-medium text-eg-ardesia">
          Crediti
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-terra">
          Richieste rimborso crediti
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-eg-ardesia">
          Pratiche aperte dalle imprese dopo lo sblocco di una richiesta.
          Approva per ricaricare i crediti tramite ledger, oppure rifiuta
          salvando una nota di revisione.
        </p>
      </header>

      <section className="mt-8">
        {refundRequests.length === 0 ? (
          <Card className="p-8">
            <p className="text-lg font-semibold text-eg-terra">
              Nessuna richiesta rimborso
            </p>
            <p className="mt-2 text-sm leading-6 text-eg-ardesia">
              Quando un'impresa richieder\u00e0 una revisione, la pratica
              comparir\u00e0 qui.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-5">
            {refundRequests.map((refundRequest) => (
              <li key={refundRequest.id}>
                <Card className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={getStatusBadgeVariant(
                            refundRequest.status,
                          )}
                        >
                          {statusLabels[refundRequest.status] ??
                            refundRequest.status}
                        </Badge>

                        <span className="text-xs font-medium uppercase tracking-wide text-eg-ardesia">
                          {reasonLabels[refundRequest.reason] ??
                            refundRequest.reason}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-eg-terra">
                        {refundRequest.company.name}
                      </h2>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-eg-ardesia">
                        {refundRequest.description}
                      </p>
                    </div>

                    {refundRequest.status ===
                    "PENDING_REVIEW" ? (
                      <form className="grid w-full gap-3 lg:w-80">
                        <input
                          type="hidden"
                          name="creditRefundRequestId"
                          value={refundRequest.id}
                        />

                        <label className="grid gap-2">
                          <span className="text-sm font-medium text-eg-terra">
                            Note admin
                          </span>
                          <Textarea
                            name="adminNotes"
                            rows={4}
                            placeholder="Sintesi della verifica e decisione."
                          />
                        </label>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="submit"
                            formAction={
                              approveRefundRequestAction
                            }
                          >
                            Approva rimborso
                          </Button>
                          <Button
                            type="submit"
                            variant="secondary"
                            formAction={
                              rejectRefundRequestAction
                            }
                          >
                            Rifiuta rimborso
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="w-full rounded-md border border-eg-hairline bg-eg-calce-2 p-4 lg:w-80">
                        <p className="text-sm font-semibold text-eg-terra">
                          Revisione completata
                        </p>
                        <p className="mt-1 text-xs leading-5 text-eg-ardesia">
                          {formatDate(
                            refundRequest.reviewedAt,
                          )}
                        </p>
                        {refundRequest.reviewedByAdminUser ? (
                          <p className="mt-1 text-xs leading-5 text-eg-ardesia">
                            Admin:{" "}
                            {refundRequest.reviewedByAdminUser.name ??
                              refundRequest.reviewedByAdminUser.email}
                          </p>
                        ) : null}
                        {refundRequest.adminNotes ? (
                          <p className="mt-3 text-sm leading-6 text-eg-ardesia">
                            {refundRequest.adminNotes}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <dl className="mt-6 grid gap-5 border-t border-eg-hairline pt-5 md:grid-cols-2 xl:grid-cols-4">
                    <Field
                      label="Richieste rimborso 30 giorni"
                      value={
                        refundRequest.companyRefundRequestsLast30Days
                      }
                    />
                    <Field
                      label="Approvate 30 giorni"
                      value={
                        refundRequest.companyApprovedRefundRequestsLast30Days
                      }
                    />
                    <Field
                      label="Rifiutate 30 giorni"
                      value={
                        refundRequest.companyRejectedRefundRequestsLast30Days
                      }
                    />
                    <Field
                      label="Costo crediti"
                      value={refundRequest.requestUnlock.creditCost}
                    />
                    <Field
                      label="Request"
                      value={
                        refundRequest.request.requestCode ??
                        refundRequest.request.id
                      }
                    />
                    <Field
                      label="Citt\u00e0"
                      value={refundRequest.request.city ?? "-"}
                    />
                    <Field
                      label="Intervento"
                      value={formatInterventionLabel(
                        refundRequest.request.interventionSlug,
                      )}
                    />
                    <Field
                      label="Status richiesta"
                      value={refundRequest.request.status}
                    />
                    <Field
                      label="Contatto tentato"
                      value={
                        refundRequest.companyContactAttempted
                          ? "S\u00ec"
                          : "No"
                      }
                    />
                    <Field
                      label="Ultimo tentativo"
                      value={formatDate(
                        refundRequest.lastContactAttemptAt,
                      )}
                    />
                    <Field
                      label="Data unlock"
                      value={formatDate(
                        refundRequest.requestUnlock.createdAt,
                      )}
                    />
                    <Field
                      label="Data richiesta rimborso"
                      value={formatDate(refundRequest.createdAt)}
                    />
                    <Field
                      label="Cliente"
                      value={refundRequest.request.customerName ?? "-"}
                    />
                    <Field
                      label="Email cliente"
                      value={refundRequest.request.customerEmail ?? "-"}
                    />
                    <Field
                      label="Telefono cliente"
                      value={refundRequest.request.customerPhone ?? "-"}
                    />
                    <Field
                      label="ID pratica"
                      value={refundRequest.id}
                    />
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageShell>
  )
}

