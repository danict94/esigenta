import type {
  ReactNode,
} from "react"
import {
  revalidatePath,
} from "next/cache"

import {
  approveCompanyContactChangeRequest,
  listCompanyContactChangeRequestsForAdminReview,
  rejectCompanyContactChangeRequest,
} from "@fixpro/db"

import {
  Badge,
  Button,
  Card,
  PageShell,
  Textarea,
} from "@fixpro/ui"

import {
  requireAdmin,
} from "../../../../auth/server"

export const dynamic = "force-dynamic"

const pagePath =
  "/imprese/modifiche-contatto"

async function approveContactChangeRequestAction(
  formData: FormData,
) {
  "use server"

  const admin =
    await requireAdmin()

  const result =
    await approveCompanyContactChangeRequest({
      companyContactChangeRequestId:
        String(
          formData.get(
            "companyContactChangeRequestId",
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

  revalidatePath(pagePath)
}

async function rejectContactChangeRequestAction(
  formData: FormData,
) {
  "use server"

  const admin =
    await requireAdmin()

  const result =
    await rejectCompanyContactChangeRequest({
      companyContactChangeRequestId:
        String(
          formData.get(
            "companyContactChangeRequestId",
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

  revalidatePath(pagePath)
}

const fieldLabels: Record<string, string> = {
  PHONE: "Telefono aziendale",
  PUBLIC_CONTACT_EMAIL: "Email pubblica aziendale",
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

function formatValue(value: string | null) {
  return value && value.trim().length > 0
    ? value
    : "Non impostato"
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
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm leading-6 text-text-primary">
        {value}
      </dd>
    </div>
  )
}

export default async function AdminCompanyContactChangeRequestsPage() {
  await requireAdmin()

  const changeRequests =
    await listCompanyContactChangeRequestsForAdminReview()

  return (
    <PageShell size="lg">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-text-muted">
          Imprese
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          Modifiche contatto
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Approva o rifiuta le richieste di modifica dei dati di
          contatto aziendali. L'email login dell'utente non viene
          modificata da questo flusso.
        </p>
      </div>

      <section className="mt-8">
        {changeRequests.length === 0 ? (
          <Card className="p-8">
            <p className="text-lg font-semibold text-text-primary">
              Nessuna modifica contatto in revisione
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Quando arriva una richiesta di modifica per telefono o email pubblica aziendale, la pratica viene mostrata qui.
            </p>
          </Card>
        ) : (
          <ul className="grid gap-5">
            {changeRequests.map((changeRequest) => (
              <li key={changeRequest.id}>
                <Card className="p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={getStatusBadgeVariant(
                            changeRequest.status,
                          )}
                        >
                          {statusLabels[changeRequest.status] ??
                            changeRequest.status}
                        </Badge>

                        <p className="text-sm font-semibold text-text-primary">
                          {fieldLabels[changeRequest.field] ??
                            changeRequest.field}
                        </p>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-text-muted">
                        Richiesta creata il{" "}
                        {formatDate(changeRequest.createdAt)}
                      </p>
                    </div>

                    {changeRequest.status ===
                    "PENDING_REVIEW" ? (
                      <form className="grid w-full gap-3 lg:w-80">
                        <input
                          type="hidden"
                          name="companyContactChangeRequestId"
                          value={changeRequest.id}
                        />

                        <label className="grid gap-1">
                          <span className="text-xs font-medium text-text-secondary">
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
                              approveContactChangeRequestAction
                            }
                          >
                            Approva modifica
                          </Button>
                          <Button
                            type="submit"
                            variant="secondary"
                            formAction={
                              rejectContactChangeRequestAction
                            }
                          >
                            Rifiuta modifica
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="w-full rounded-md border border-border-primary bg-surface-secondary p-4 lg:w-80">
                        <p className="text-sm font-semibold text-text-primary">
                          Revisione completata
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-muted">
                          {formatDate(
                            changeRequest.reviewedAt,
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  <dl className="mt-6 grid gap-4 border-t border-border-primary pt-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field
                      label="Valore attuale"
                      value={formatValue(
                        changeRequest.currentValue,
                      )}
                    />
                    <Field
                      label="Valore richiesto"
                      value={formatValue(
                        changeRequest.requestedValue,
                      )}
                    />
                    <Field
                      label="Impresa"
                      value={changeRequest.company.id}
                    />
                    <Field
                      label="Telefono attuale"
                      value={formatValue(
                        changeRequest.company.phone,
                      )}
                    />
                    <Field
                      label="Email pubblica attuale"
                      value={formatValue(
                        changeRequest.company
                          .publicContactEmail,
                      )}
                    />
                    <Field
                      label="Richiedente"
                      value={
                        changeRequest.requestedByUser.name ??
                        changeRequest.requestedByUser.email
                      }
                    />
                    <Field
                      label="Email login richiedente"
                      value={changeRequest.requestedByUser.email}
                    />
                    <Field
                      label="Aggiornata il"
                      value={formatDate(changeRequest.updatedAt)}
                    />
                    <Field
                      label="Note admin"
                      value={formatValue(
                        changeRequest.adminNotes,
                      )}
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
