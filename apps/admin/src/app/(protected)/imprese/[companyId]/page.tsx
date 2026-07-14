import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  revalidatePath,
} from "next/cache"

import {
  approveCompanyDocument,
  approveCompanyForMarketplace,
  blockCompanyForMarketplace,
  companyProfileCompletenessFieldLabels,
  getAdminCompanyDetail,
  getAdminCompanyDocuments,
  rejectCompanyDocument,
  suspendCompanyForMarketplace,
  type AdminCompanyDetail,
  type AdminCompanyDocumentItem,
  type AdminCompanyDocumentStatus,
} from "@esigenta/domain"

import {
  Badge,
  Button,
  Card,
  PageShell,
  Textarea,
  buttonClassName,
} from "@esigenta/ui"

import {
  requireAdmin,
} from "../../../../auth/server"

import {
  AdminStatusPill,
} from "../../../../components/admin-status-pill"

export const dynamic = "force-dynamic"

type CompanyDetailPageProps = {
  params: Promise<{
    companyId: string
  }>
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

function formatFileSize(sizeBytes: number | null) {
  if (sizeBytes === null) {
    return "-"
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

function documentStatusLabel(status: AdminCompanyDocumentStatus) {
  if (status === "MISSING") return "Mancante"
  if (status === "PENDING_REVIEW") return "In verifica"
  if (status === "APPROVED") return "Approvato"
  return "Da correggere"
}

function documentStatusColor(status: AdminCompanyDocumentStatus) {
  if (status === "APPROVED") return "green" as const
  if (status === "PENDING_REVIEW") return "yellow" as const
  if (status === "REJECTED") return "red" as const
  return "gray" as const
}

function getStatusEventDate(
  company: AdminCompanyDetail,
) {
  if (company.status === "APPROVED") {
    return company.approvedAt
  }

  if (company.status === "SUSPENDED") {
    return company.suspendedAt
  }

  if (company.status === "BLOCKED") {
    return company.blockedAt
  }

  return null
}

async function approveCompanyAction(
  formData: FormData,
) {
  "use server"

  const admin = await requireAdmin()
  const companyId = String(formData.get("companyId") ?? "")

  const result =
    await approveCompanyForMarketplace({
      companyId,
      adminUserId: admin.userId,
      reason: String(formData.get("reason") ?? ""),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath(`/imprese/${companyId}`)
  revalidatePath("/imprese")
}

async function suspendCompanyAction(
  formData: FormData,
) {
  "use server"

  const admin = await requireAdmin()
  const companyId = String(formData.get("companyId") ?? "")

  const result =
    await suspendCompanyForMarketplace({
      companyId,
      adminUserId: admin.userId,
      reason: String(formData.get("reason") ?? ""),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath(`/imprese/${companyId}`)
  revalidatePath("/imprese")
}

async function blockCompanyAction(
  formData: FormData,
) {
  "use server"

  const admin = await requireAdmin()
  const companyId = String(formData.get("companyId") ?? "")

  const result =
    await blockCompanyForMarketplace({
      companyId,
      adminUserId: admin.userId,
      reason: String(formData.get("reason") ?? ""),
    })

  if (!result.ok) {
    throw new Error(result.message)
  }

  revalidatePath(`/imprese/${companyId}`)
  revalidatePath("/imprese")
}

async function approveCompanyDocumentAction(
  formData: FormData,
) {
  "use server"

  const admin = await requireAdmin()
  const companyId = String(formData.get("companyId") ?? "")
  const documentId = String(formData.get("documentId") ?? "")

  const result = await approveCompanyDocument(documentId, admin.userId)

  if (!result.ok) {
    throw new Error(result.code)
  }

  revalidatePath(`/imprese/${companyId}`)
  revalidatePath("/imprese")
}

async function rejectCompanyDocumentAction(
  formData: FormData,
) {
  "use server"

  const admin = await requireAdmin()
  const companyId = String(formData.get("companyId") ?? "")
  const documentId = String(formData.get("documentId") ?? "")
  const reason = String(formData.get("reason") ?? "")

  const result = await rejectCompanyDocument(documentId, admin.userId, reason)

  if (!result.ok) {
    throw new Error(result.code)
  }

  revalidatePath(`/imprese/${companyId}`)
  revalidatePath("/imprese")
}

type CompanyAction = {
  label: string
  action: typeof approveCompanyAction
  variant?: "primary" | "ghost"
}

function getCompanyActions(
  status: AdminCompanyDetail["status"],
): CompanyAction[] {
  if (status === "PENDING_REVIEW") {
    return [
      { label: "Approva", action: approveCompanyAction },
      { label: "Blocca", action: blockCompanyAction, variant: "ghost" },
    ]
  }

  if (status === "APPROVED") {
    return [
      { label: "Sospendi", action: suspendCompanyAction, variant: "ghost" },
      { label: "Blocca", action: blockCompanyAction, variant: "ghost" },
    ]
  }

  if (status === "SUSPENDED") {
    return [
      { label: "Approva", action: approveCompanyAction },
      { label: "Blocca", action: blockCompanyAction, variant: "ghost" },
    ]
  }

  if (status === "BLOCKED") {
    return [{ label: "Approva", action: approveCompanyAction }]
  }

  return []
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold tracking-tight text-eg-terra">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </Card>
  )
}

function Field({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="grid gap-1 border-b border-eg-hairline py-3 last:border-b-0 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-6">
      <dt className="text-sm font-medium text-eg-ardesia">{label}</dt>
      <dd className="text-sm text-eg-terra">{value}</dd>
    </div>
  )
}

function DocumentRow({
  document,
  companyId,
}: {
  document: AdminCompanyDocumentItem
  companyId: string
}) {
  return (
    <li className="border-b border-eg-hairline pb-5 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-eg-terra">{document.label}</p>
          <p className="mt-1 text-xs text-eg-ardesia">
            {document.requiredByDefault ? "Obbligatorio" : "Consigliato"}
          </p>
        </div>
        <AdminStatusPill
          color={documentStatusColor(document.status)}
          label={documentStatusLabel(document.status)}
        />
      </div>

      {document.status === "MISSING" || !document.id ? (
        <p className="mt-3 text-sm text-eg-ardesia">Non caricato.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          <p className="text-sm text-eg-terra">
            {document.fileName} · {formatFileSize(document.sizeBytes)}
          </p>
          <p className="text-xs text-eg-ardesia">
            Caricato il {formatDate(document.uploadedAt)}
            {document.uploadedByUser
              ? ` da ${document.uploadedByUser.name ?? document.uploadedByUser.email}`
              : ""}
          </p>

          {document.status === "REJECTED" && document.rejectionReason ? (
            <p className="text-xs text-eg-cotto-dark">
              Motivo: {document.rejectionReason}
            </p>
          ) : null}

          {document.status === "APPROVED" && document.reviewedByAdminUser ? (
            <p className="text-xs text-eg-ardesia">
              Approvato il {formatDate(document.reviewedAt)} da{" "}
              {document.reviewedByAdminUser.name ?? document.reviewedByAdminUser.email}
            </p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a
              href={`/api/company-documents/${document.id}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-eg-cotto"
            >
              Apri documento
            </a>

            {document.status === "PENDING_REVIEW" ? (
              <>
                <form>
                  <input type="hidden" name="documentId" value={document.id} />
                  <input type="hidden" name="companyId" value={companyId} />
                  <Button
                    type="submit"
                    formAction={approveCompanyDocumentAction}
                    size="sm"
                  >
                    Approva
                  </Button>
                </form>

                <details className="group">
                  <summary
                    className={buttonClassName({
                      variant: "ghost",
                      size: "sm",
                      className: "cursor-pointer list-none",
                    })}
                  >
                    Rifiuta
                  </summary>
                  <form className="mt-3 grid gap-2">
                    <input type="hidden" name="documentId" value={document.id} />
                    <input type="hidden" name="companyId" value={companyId} />
                    <Textarea
                      name="reason"
                      rows={2}
                      required
                      placeholder="Motivo del rifiuto"
                      className="text-xs"
                    />
                    <Button
                      type="submit"
                      formAction={rejectCompanyDocumentAction}
                      variant="ghost"
                      size="sm"
                    >
                      Conferma rifiuto
                    </Button>
                  </form>
                </details>
              </>
            ) : null}
          </div>
        </div>
      )}
    </li>
  )
}

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  await requireAdmin()

  const { companyId } = await params
  const company = await getAdminCompanyDetail(companyId)

  if (!company) {
    notFound()
  }

  const documents = await getAdminCompanyDocuments(companyId)

  const actions = getCompanyActions(company.status)
  const eventDate = getStatusEventDate(company)
  const statusColor =
    company.status === "PENDING_REVIEW"
      ? "yellow"
      : company.status === "APPROVED"
        ? "blue"
        : company.adminBadge.color

  return (
    <PageShell size="lg" className="py-8 md:py-10">
      <Link
        href="/imprese"
        className="text-sm font-medium text-eg-ardesia transition-colors hover:text-eg-terra"
      >
        ← Imprese
      </Link>

      <header className="mt-4 border-b border-eg-hairline pb-7">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-eg-terra">
            {company.name}
          </h1>
          <AdminStatusPill
            color={statusColor}
            label={company.adminBadge.label}
          />
        </div>
      </header>

      <div className="mt-8 grid gap-6">
        <SectionCard title="Identità azienda">
          <dl>
            <Field label="Nome legale" value={company.name} />
            <Field label="Nome pubblico" value={company.publicName ?? "-"} />
            <Field label="Partita IVA" value={company.vatNumber} />
            <Field label="Email account aziendale" value={company.email ?? "—"} />
            <Field label="Telefono" value={company.phone} />
            <Field label="Sito web" value={company.website ?? "-"} />
            <Field label="Registrata il" value={formatDate(company.createdAt)} />
          </dl>
        </SectionCard>

        <SectionCard title="Stato e moderazione">
          <dl>
            <Field
              label="Stato attuale"
              value={
                <AdminStatusPill
                  color={statusColor}
                  label={company.adminBadge.label}
                />
              }
            />
            <Field label="Ultima transizione" value={formatDate(eventDate)} />
            <Field
              label="Modificato da"
              value={
                company.statusChangedByAdmin
                  ? (company.statusChangedByAdmin.name ??
                      company.statusChangedByAdmin.email)
                  : "-"
              }
            />
            <Field label="Motivo" value={company.statusChangeReason ?? "-"} />
          </dl>

          {actions.length > 0 ? (
            <form className="mt-6 grid gap-3 border-t border-eg-hairline pt-6">
              <input type="hidden" name="companyId" value={company.id} />
              <Textarea
                name="reason"
                rows={2}
                placeholder="Motivo (obbligatorio per sospendi/blocca, facoltativo per approva)"
              />
              <div className="flex flex-wrap gap-2">
                {actions.map((item) => (
                  <Button
                    key={item.label}
                    type="submit"
                    formAction={item.action}
                    variant={item.variant ?? "primary"}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </form>
          ) : null}
        </SectionCard>

        <SectionCard title="Profilo operativo">
          <dl>
            <Field label="Sede/città" value={company.city ?? "-"} />
            <Field label="Raggio operativo" value={`${company.operatingRadiusKm} km`} />
            <Field
              label="Categorie"
              value={
                company.categories.length > 0
                  ? company.categories.map((c) => c.name).join(", ")
                  : "-"
              }
            />
            <Field
              label="Interventi"
              value={
                company.interventions.length > 0
                  ? company.interventions.map((i) => i.name).join(", ")
                  : "-"
              }
            />
            <Field
              label="Profilo"
              value={
                <AdminStatusPill
                  color={company.profileCompleteness.isComplete ? "green" : "orange"}
                  label={company.profileCompleteness.isComplete ? "Completa" : "Incompleta"}
                />
              }
            />
            {!company.profileCompleteness.isComplete ? (
              <Field
                label="Campi mancanti"
                value={company.profileCompleteness.missing
                  .map((field) => companyProfileCompletenessFieldLabels[field])
                  .join(", ")}
              />
            ) : null}
          </dl>
        </SectionCard>

        <SectionCard title="Documenti impresa">
          <ul className="grid gap-5">
            {documents.map((document) => (
              <DocumentRow
                key={document.type}
                document={document}
                companyId={company.id}
              />
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Attività marketplace">
          <dl>
            <Field
              label="Saldo crediti"
              value={
                company.creditBalance !== null
                  ? `${company.creditBalance} crediti`
                  : "—"
              }
            />
            <Field label="Richieste sbloccate" value={String(company.unlockCount)} />
            <Field label="Richieste salvate" value={String(company.savedRequestCount)} />
          </dl>
        </SectionCard>
      </div>
    </PageShell>
  )
}
