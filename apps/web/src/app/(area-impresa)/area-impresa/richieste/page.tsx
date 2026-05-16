import Link from "next/link";

import { PageShell } from "@fixpro/ui";

import { listAvailableRequestsForCompany } from "@fixpro/db";

import { requireDefaultCompanyMembership } from "../../../../auth/server";

import { RequestListCard } from "../_components/request-list-card";

export const dynamic = "force-dynamic";

function formatFreshness(date: Date) {
  const now = Date.now();
  const diffMs = Math.max(0, now - date.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (hours < 1) {
    return "Ora";
  }

  if (hours < 24) {
    return `${hours} h fa`;
  }

  if (days === 1) {
    return "1 gg fa";
  }

  if (days < 30) {
    return `${days} gg fa`;
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date);
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Richiesta";
  }

  return slug.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStructuredData(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function getDescription(structuredData: Record<string, unknown> | null) {
  if (!structuredData) {
    return null;
  }

  if (typeof structuredData.description === "string") {
    return structuredData.description;
  }

  if (typeof structuredData.message === "string") {
    return structuredData.message;
  }

  if (typeof structuredData.details === "string") {
    return structuredData.details;
  }

  return null;
}

function getSurfaceArea(structuredData: Record<string, unknown> | null) {
  if (!structuredData) {
    return null;
  }

  const value = structuredData.surfaceArea ?? structuredData["surface-area"];

  return typeof value === "string" || typeof value === "number" ? value : null;
}

function extractProvinceFromAddress(address?: string | null) {
  if (!address) {
    return null;
  }

  const match = address.toUpperCase().match(/\b([A-Z]{2})\b\s*$/);

  return match?.[1] ?? null;
}

function formatLocationLabel({
  city,
  postalCode,
  address,
}: {
  city?: string | null;
  postalCode?: string | null;
  address?: string | null;
}) {
  const province = extractProvinceFromAddress(address);
  const cityWithProvince = [city, province].filter(Boolean).join(" ");

  if (cityWithProvince && postalCode) {
    return `${cityWithProvince} - ${postalCode}`;
  }

  return cityWithProvince || postalCode || "Località non specificata";
}

function getMatchLabel(matchLevel: "selected_service" | "category") {
  return matchLevel === "selected_service"
    ? "Molto compatibile"
    : "Nella tua categoria";
}

export default async function RichiestePage() {
  const membership = await requireDefaultCompanyMembership();

  const result = await listAvailableRequestsForCompany({
    companyId: membership.companyId,
  });

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <section className="space-y-7">
          <div className="flex flex-col gap-5">
            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 text-lg font-semibold text-text-primary"
            >
              Nel tuo raggio operativo
              <span className="text-text-secondary" aria-hidden="true">
                ⌄
              </span>
            </button>

            <div className="relative">
              <span
                className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-brand-primary"
                aria-hidden="true"
              >
                ⌕
              </span>

              <input
                type="search"
                placeholder="Cerca per parola chiave, posizione, materiale..."
                className="h-14 w-full rounded-md border border-border-secondary bg-surface-primary pl-14 pr-5 text-base text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-border-secondary bg-surface-primary px-5 text-base font-medium text-text-primary transition-colors hover:bg-surface-secondary"
              >
                Servizi
                <span className="text-text-secondary" aria-hidden="true">
                  ⌄
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">
                Dashboard impresa
              </p>

              <h1 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
                Nuove richieste disponibili
              </h1>

              <p className="mt-1 text-sm text-text-secondary">
                {result.ok ? result.requests.length : 0} richieste
              </p>
            </div>

            <button
              type="button"
              className="inline-flex h-11 items-center gap-3 rounded-full border border-border-secondary bg-surface-primary px-5 text-base font-medium text-text-primary transition-colors hover:bg-surface-secondary"
            >
              <span aria-hidden="true">↕</span>
              Ordina per
              <span className="text-text-secondary" aria-hidden="true">
                ⌄
              </span>
            </button>
          </div>

          {!result.ok ? (
            <div className="rounded-md border border-border-primary bg-surface-primary p-8">
              <p className="text-base font-semibold text-text-primary">
                {result.code === "missing_category"
                  ? "Categoria impresa non configurata"
                  : "Sede operativa incompleta"}
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
                {result.message}
              </p>

              <Link
                href={
                  result.code === "missing_category"
                    ? "/area-impresa/configura-servizi"
                    : "/area-impresa/richieste"
                }
                className="mt-5 inline-flex text-sm font-medium text-brand-primary"
              >
                {result.code === "missing_category"
                  ? "Vai alla configurazione servizi"
                  : "Torna alla dashboard"}
              </Link>
            </div>
          ) : (
            <>
              {!result.hasSelectedServices ? (
                <div className="rounded-md border border-border-primary bg-surface-secondary p-5">
                  <p className="text-sm font-semibold text-text-primary">
                    Seleziona i servizi che offri per vedere prima le richieste
                    più adatte.
                  </p>

                  <Link
                    href="/area-impresa/configura-servizi"
                    className="mt-3 inline-flex text-sm font-medium text-brand-primary"
                  >
                    Configura servizi
                  </Link>
                </div>
              ) : null}

              {result.requests.length === 0 ? (
            <div className="rounded-md border border-border-primary bg-surface-primary p-8">
              <p className="text-sm text-text-secondary">
                Nessuna richiesta disponibile al momento.
              </p>
            </div>
              ) : (
            <div className="space-y-4">
              {result.requests.map((request) => {
                const structuredData = getStructuredData(
                  request.structuredData,
                );
                const description = getDescription(structuredData);
                const surfaceArea = getSurfaceArea(structuredData);

                return (
                  <RequestListCard
                    key={request.id}
                    id={request.id}
                    intervention={formatInterventionLabel(
                      request.interventionSlug,
                    )}
                    location={formatLocationLabel({
                      city: request.city,
                      postalCode: request.postalCode,
                      address: request.address,
                    })}
                    createdAt={formatFreshness(request.createdAt)}
                    matchLabel={getMatchLabel(request.matchLevel)}
                    description={description}
                    surfaceArea={surfaceArea}
                    creditCost={request.creditCost}
                    maxUnlocks={request.maxUnlocks}
                    unlockCount={request.unlockCount}
                  />
                );
              })}
            </div>
              )}
            </>
          )}
        </section>
      </div>
    </PageShell>
  );
}
