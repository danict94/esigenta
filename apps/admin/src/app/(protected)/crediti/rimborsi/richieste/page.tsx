import type {
  ReactNode,
} from "react"

import {
  listCreditRefundRequestsForAdminReview,
} from "@fixpro/db"

import {
  Badge,
  Button,
  Card,
  PageShell,
} from "@fixpro/ui"

import {
  requireAdmin,
} from "../../../../../auth/server"

export const dynamic = "force-dynamic"

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
      <dt className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">
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
      <header className="border-b border-border-primary pb-7">
        <p className="text-sm font-medium text-text-muted">
          Crediti
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary">
          Richieste rimborso crediti
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
          Pratiche aperte dalle imprese dopo lo sblocco di una richiesta. In
          questo step la pagina \u00e8 solo una coda di review: approvazione e
          rifiuto operativi arriveranno nel prossimo pass.
        </p>
      </header>

      <section className="mt-8">
        {refundRequests.length === 0 ? (
          <Card className="p-8">
            <p className="text-lg font-semibold text-text-primary">
              Nessuna richiesta rimborso
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
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
                        <Badge variant="warning">
                          {statusLabels[refundRequest.status] ??
                            refundRequest.status}
                        </Badge>

                        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
                          {reasonLabels[refundRequest.reason] ??
                            refundRequest.reason}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold tracking-tight text-text-primary">
                        {refundRequest.company.name}
                      </h2>

                      <p className="mt-3 max-w-3xl text-sm leading-6 text-text-secondary">
                        {refundRequest.description}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button type="button" disabled>
                        Approva nel prossimo step
                      </Button>
                      <Button type="button" variant="secondary" disabled>
                        Rifiuta nel prossimo step
                      </Button>
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-5 border-t border-border-primary pt-5 md:grid-cols-2 xl:grid-cols-4">
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
