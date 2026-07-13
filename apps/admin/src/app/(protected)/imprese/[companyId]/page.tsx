import type { ReactNode } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  revalidatePath,
} from "next/cache"

import {
  approveCompanyForMarketplace,
  blockCompanyForMarketplace,
  companyProfileCompletenessFieldLabels,
  getAdminCompanyDetail,
  suspendCompanyForMarketplace,
  type AdminCompanyDetail,
} from "@esigenta/domain"

import {
  Badge,
  Button,
  Card,
  PageShell,
  Textarea,
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

export default async function CompanyDetailPage({
  params,
}: CompanyDetailPageProps) {
  await requireAdmin()

  const { companyId } = await params
  const company = await getAdminCompanyDetail(companyId)

  if (!company) {
    notFound()
  }

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
          <p className="text-sm leading-6 text-eg-ardesia">
            Il flusso documentale è in preparazione. In questa area saranno
            disponibili caricamento e verifica dei documenti tramite storage
            privato, senza esporre funzionalità non ancora operative.
          </p>
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
