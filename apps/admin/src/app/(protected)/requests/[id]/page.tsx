import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";

import {
  archiveRequest,
  getRequestById,
  listAttachedRequestPhotos,
  resendRequestVerificationEmail,
  restoreRequest,
  RequestPublishingRequirementsError,
  reviewRequest,
  softDeleteRequest,
  unarchiveRequest,
  updateRequestCommercialSettings,
  verifyRequestManually,
} from "@esigenta/domain";
import {
  createRequestPhotoDisplayItems,
} from "@esigenta/uploads/server";
import {
  Badge,
  Button,
  Card,
  Input,
  PageShell,
  Textarea,
} from "@esigenta/ui";

import { requireAdmin } from "../../../../auth/server";
import {
  processRequestEmailDeliveriesForRequest,
} from "../../../../lib/notifications/process-request-email-deliveries";

export const dynamic = "force-dynamic";

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

type JsonRecord = Record<string, unknown>;

type DisplayCategory = {
  slug: string;
  name: string;
  description: string | null;
  sector: {
    slug: string;
    name: string;
  };
};

const answerLabels: Record<string, string> = {
  location: "Luogo",
  property: "Immobile",
  photos: "Foto",
  timing: "Tempistiche",
  budget: "Budget",
  "surface-area": "Superficie",
  rooms: "Stanze",
  contact: "Contatto",
};

const valueLabels: Record<string, string> = {
  as_soon_as_possible: "Il prima possibile",
  within_30_days: "Entro 30 giorni",
  flexible: "Sono flessibile",
  evaluating: "Sto valutando",
  appartamento: "Appartamento",
  villa: "Villa",
  ufficio: "Ufficio",
  negozio: "Negozio",
  condominio: "Condominio",
  garage: "Garage",
  magazzino: "Magazzino",
  altro: "Altro",
};

const duplicatedAnswerKeys = new Set([
  "location",
  "contact",
  "photos",
]);

const descriptionKeys = new Set([
  "description",
  "descrizione",
  "details",
  "detail",
  "message",
  "note",
  "notes",
  "problem",
  "problemDescription",
  "requestDescription",
  "customerDescription",
  "additionalInfo",
  "additional_info",
]);

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Richiesta da revisionare";
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusBadgeVariant(status: string) {
  if (status === "APPROVED" || status === "PUBLISHED") {
    return "success";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  if (status === "PENDING_REVIEW") {
    return "warning";
  }

  if (status === "PENDING_VERIFICATION") {
    return "danger";
  }

  return "neutral";
}

function getStatusLabel(status: string) {
  if (status === "APPROVED") {
    return "Approvata";
  }

  if (status === "PUBLISHED") {
    return "Pubblicata";
  }

  if (status === "REJECTED") {
    return "Rifiutata";
  }

  if (status === "PENDING_REVIEW") {
    return "In revisione";
  }

  if (status === "CLOSED") {
    return "Chiusa";
  }

  if (status === "PENDING_VERIFICATION") {
    return "Email non verificata";
  }

  return status;
}

function isPositiveInteger(value: number | null) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1
  );
}

function parseOptionalInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed ? Number(trimmed) : null;
}

function formatCreditCost(value: number | null) {
  return value === null ? "Non impostato" : `${value} crediti`;
}

function formatMaxUnlocks(value: number | null) {
  return value === null ? "Non impostato" : `${value} imprese`;
}

function formatKey(key: string) {
  return key
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2");
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined) {
    return "-";
  }

  if (typeof value === "string") {
    return valueLabels[value] ?? value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return "-";
}

function renderStructuredValue(value: unknown): ReactNode {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "-";
    }

    if (value.every(isRecord)) {
      const names = value
        .map((item) => (typeof item.name === "string" ? item.name : undefined))
        .filter(Boolean);

      return names.length > 0
        ? `${value.length} file: ${names.join(", ")}`
        : `${value.length} elementi`;
    }

    return value.map(formatPrimitive).join(", ");
  }

  if (isRecord(value)) {
    const entries = Object.entries(value).filter(
      ([, entryValue]) =>
        entryValue !== undefined && entryValue !== null && entryValue !== "",
    );

    if (entries.length === 0) {
      return "-";
    }

    return (
      <dl className="grid gap-2">
        {entries.map(([key, entryValue]) => (
          <div key={key} className="grid gap-1 sm:grid-cols-[10rem_1fr]">
            <dt className="text-cantiere-ink-secondary">{formatKey(key)}</dt>
            <dd className="text-cantiere-ink">
              {renderStructuredValue(entryValue)}
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return formatPrimitive(value);
}

function getRawAnswers(structuredData: unknown) {
  if (!isRecord(structuredData)) {
    return {};
  }

  const draft = structuredData.draft;

  if (!isRecord(draft)) {
    return {};
  }

  const rawAnswers = draft.rawAnswers;

  if (!isRecord(rawAnswers)) {
    return {};
  }

  return rawAnswers;
}

function findDescription(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (trimmed.length >= 20) {
      return trimmed;
    }

    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDescription(item);

      if (found) {
        return found;
      }
    }

    return null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const [key, entryValue] of Object.entries(value)) {
    if (
      descriptionKeys.has(key) &&
      typeof entryValue === "string" &&
      entryValue.trim().length > 0
    ) {
      return entryValue.trim();
    }
  }

  for (const entryValue of Object.values(value)) {
    const found = findDescription(entryValue);

    if (found) {
      return found;
    }
  }

  return null;
}

function uniqueCategories(categories: DisplayCategory[]) {
  const seen = new Set<string>();

  return categories.filter((category) => {
    if (seen.has(category.slug)) {
      return false;
    }

    seen.add(category.slug);
    return true;
  });
}

async function reviewRequestAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const requestId = String(formData.get("requestId") ?? "");
  const status = String(formData.get("status") ?? "");
  const moderationNotes = String(formData.get("moderationNotes") ?? "").trim();

  if (
    !requestId ||
    (
      status !== "APPROVED" &&
      status !== "PUBLISHED" &&
      status !== "REJECTED"
    )
  ) {
    throw new Error("Invalid moderation action.");
  }

  let reviewResult: Awaited<ReturnType<typeof reviewRequest>>;

  try {
    reviewResult = await reviewRequest({
      requestId,
      status,
      moderationNotes:
        moderationNotes || null,
    });
  } catch (error) {
    if (error instanceof RequestPublishingRequirementsError) {
      throw new Error(error.message);
    }

    throw error;
  }

  if (reviewResult.status === "PUBLISHED") {
    await processRequestEmailDeliveriesForRequest(
      requestId,
    );
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}

async function updateCommercialSettingsAction(formData: FormData) {
  "use server";

  await requireAdmin();

  const requestId = String(formData.get("requestId") ?? "");

  const result = await updateRequestCommercialSettings({
    requestId,
    creditCost: parseOptionalInteger(formData.get("creditCost")),
    maxUnlocks: parseOptionalInteger(formData.get("maxUnlocks")),
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}

async function archiveRequestAction(formData: FormData) {
  "use server";

  const admin = await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const result = await archiveRequest({
    requestId,
    adminUserId: admin.userId,
    reason: reason || null,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}

async function unarchiveRequestAction(formData: FormData) {
  "use server";

  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");

  const result = await unarchiveRequest({ requestId });

  if (!result.ok) {
    throw new Error(result.message);
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}

async function softDeleteRequestAction(formData: FormData) {
  "use server";

  const admin = await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const result = await softDeleteRequest({
    requestId,
    adminUserId: admin.userId,
    reason: reason || null,
  });

  if (!result.ok) {
    throw new Error(result.message);
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}

async function restoreRequestAction(formData: FormData) {
  "use server";

  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");

  const result = await restoreRequest({ requestId });

  if (!result.ok) {
    throw new Error(result.message);
  }

  revalidatePath("/requests");
  revalidatePath(`/requests/${requestId}`);
}

async function resendVerificationEmailAction(formData: FormData) {
  "use server";

  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");

  await resendRequestVerificationEmail({ requestId });

  revalidatePath("/requests/non-verificate");
  revalidatePath(`/requests/${requestId}`);
}

async function verifyRequestManuallyAction(formData: FormData) {
  "use server";

  await requireAdmin();
  const requestId = String(formData.get("requestId") ?? "");

  // Only advances PENDING_VERIFICATION -> PENDING_REVIEW (the same
  // transition the customer's own email link performs). Publishing and the
  // resulting dispatch/notification emails remain reviewRequestAction's
  // job, unchanged below.
  await verifyRequestManually({ requestId });

  revalidatePath("/requests");
  revalidatePath("/requests/non-verificate");
  revalidatePath(`/requests/${requestId}`);
}

function DetailSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="mb-5 border-b border-cantiere-hairline pb-5">
        <p className="text-sm font-medium text-cantiere-ink-secondary">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-cantiere-ink">
          {title}
        </h2>
      </div>

      {children}
    </Card>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
        {label}
      </dt>
      <dd className="mt-2 text-sm leading-6 text-cantiere-ink">{children}</dd>
    </div>
  );
}

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  const photos = await createRequestPhotoDisplayItems(
    await listAttachedRequestPhotos(request.id),
  );

  const publicRequestCode =
    request.requestCode ?? "In preparazione";

  const rawAnswers = getRawAnswers(request.structuredData);
  const answerEntries = Object.entries(rawAnswers).filter(
    ([key]) => !duplicatedAnswerKeys.has(key),
  );

  const interventionName =
    request.intervention?.name ??
    formatInterventionLabel(request.interventionSlug);

  const interventionDescription =
    request.intervention?.description ?? null;

  const customerDescription =
    findDescription(request.structuredData);

  const primaryServices = request.intervention?.services ?? [];

  const categories = uniqueCategories(
    primaryServices.flatMap((service) => service.categories),
  );
  const hasRequiredPublishingSettings =
    isPositiveInteger(request.creditCost) &&
    isPositiveInteger(request.maxUnlocks);

  return (
    <PageShell size="lg">
      <header className="border-b border-cantiere-hairline pb-7">
        <Link
          href="/requests"
          className="text-sm font-medium text-cantiere-ink-secondary transition-colors hover:text-cantiere-ink"
        >
          ← Coda richieste
        </Link>

        <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-cantiere-ink-secondary">
              Dossier richiesta
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cantiere-ink">
              {interventionName}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cantiere-ink-secondary">
              <span>
                <span className="text-cantiere-ink-secondary">Luogo:</span>{" "}
                {[request.city, request.postalCode].filter(Boolean).join(" ") ||
                  "-"}
              </span>

              <span>
                <span className="text-cantiere-ink-secondary">Cliente:</span>{" "}
                {request.customerName ?? "-"}
              </span>

              <span>
                <span className="text-cantiere-ink-secondary">Creata:</span>{" "}
                {formatDate(request.createdAt)}
              </span>
            </div>

            <div className="mt-4 grid gap-1">
              <p className="text-sm font-medium text-cantiere-ink">
                <span className="text-cantiere-ink-secondary">Codice richiesta:</span>{" "}
                {publicRequestCode}
              </p>

              <p className="text-xs text-cantiere-ink-secondary">
                ID tecnico: {request.id}
              </p>
            </div>
          </div>

          <Badge variant={getStatusBadgeVariant(request.status)}>
            {getStatusLabel(request.status)}
          </Badge>
        </div>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <main className="grid gap-6">
          <DetailSection
            eyebrow="Sintesi"
            title="Informazioni principali"
          >
            <dl className="grid gap-6">
              <FieldBlock label="Intervento">
                <div className="space-y-2">
                  <p className="text-base font-semibold text-cantiere-ink">
                    {interventionName}
                  </p>

                  {interventionDescription ? (
                    <p className="text-sm leading-6 text-cantiere-ink-secondary">
                      {interventionDescription}
                    </p>
                  ) : null}
                </div>
              </FieldBlock>

              <FieldBlock label="Categoria professionale">
                {categories.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span
                        key={category.slug}
                        className="border border-cantiere-hairline bg-cantiere-linen px-3 py-2 text-sm font-medium text-cantiere-ink"
                      >
                        {category.name}
                        <span className="ml-2 text-cantiere-ink-secondary">
                          · {category.sector.name}
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-cantiere-ink-secondary">
                    Categoria non derivabile dai dati disponibili.
                  </span>
                )}
              </FieldBlock>

              <FieldBlock label="Descrizione cliente">
                {customerDescription ? (
                  <p className="whitespace-pre-line text-base leading-7 text-cantiere-ink">
                    {customerDescription}
                  </p>
                ) : (
                  <p className="text-sm leading-6 text-cantiere-ink-secondary">
                    Nessuna descrizione libera trovata nei dati salvati dal
                    funnel.
                  </p>
                )}
              </FieldBlock>
            </dl>
          </DetailSection>

          <DetailSection eyebrow="Localizzazione" title="Luogo richiesta">
            <dl className="grid gap-5 md:grid-cols-2">
              <FieldBlock label="Città">
                {request.city ?? "-"}
              </FieldBlock>

              <FieldBlock label="CAP">
                {request.postalCode ?? "-"}
              </FieldBlock>

              <FieldBlock label="Indirizzo">
                {request.address ?? "-"}
              </FieldBlock>

              <FieldBlock label="Coordinate">
                {request.latitude !== null && request.longitude !== null
                  ? `${request.latitude}, ${request.longitude}`
                  : "-"}
              </FieldBlock>
            </dl>
          </DetailSection>

          <DetailSection eyebrow="Cliente" title="Dati contatto">
            <dl className="grid gap-5 md:grid-cols-3">
              <FieldBlock label="Nome e cognome">
                {request.customerName ?? "-"}
              </FieldBlock>

              <FieldBlock label="Email">
                {request.customerEmail ?? "-"}
              </FieldBlock>

              <FieldBlock label="Telefono">
                {request.customerPhone ?? "-"}
              </FieldBlock>
            </dl>
          </DetailSection>

          {photos.length > 0 ? (
            <DetailSection eyebrow="Allegati" title="Foto allegate dal cliente">
              <div className="grid gap-4 sm:grid-cols-2">
                {photos.map((photo) => (
                  <figure
                    key={photo.src}
                    className="overflow-hidden border border-cantiere-hairline bg-cantiere-paper"
                  >
                    <div className="relative aspect-video bg-cantiere-linen">
                      <Image
                        src={photo.src}
                        alt={photo.fileName}
                        fill
                        unoptimized
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>

                    <figcaption className="truncate px-3 py-2 text-xs text-cantiere-ink-secondary">
                      {photo.fileName}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </DetailSection>
          ) : null}

          <DetailSection eyebrow="Matching" title="Servizi rilevanti">
            {primaryServices.length > 0 ? (
              <div className="grid gap-3">
                {primaryServices.map((service) => (
                  <div
                    key={service.slug}
                    className="border border-cantiere-hairline bg-cantiere-paper p-4"
                  >
                    <p className="text-sm font-semibold text-cantiere-ink">
                      {service.name}
                    </p>

                    {service.description ? (
                      <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                        {service.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-6 text-cantiere-ink-secondary">
                Nessun servizio rilevante associato alla richiesta.
              </p>
            )}
          </DetailSection>

          <DetailSection eyebrow="Audit funnel" title="Dati aggiuntivi">
            {answerEntries.length === 0 ? (
              <p className="text-sm leading-6 text-cantiere-ink-secondary">
                Nessun dato aggiuntivo da mostrare oltre a luogo e contatto.
              </p>
            ) : (
              <dl className="grid gap-4">
                {answerEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="border border-cantiere-hairline bg-cantiere-paper p-4"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                      {answerLabels[key] ?? formatKey(key)}
                    </dt>
                    <dd className="mt-3 text-sm leading-6 text-cantiere-ink">
                      {renderStructuredValue(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </DetailSection>
        </main>

        <aside className="grid gap-6 lg:sticky lg:top-6">
          <Card className="p-5">
            <div>
              <p className="text-sm font-medium text-cantiere-ink-secondary">
                Crediti
              </p>

              <h2 className="mt-1 text-xl font-semibold text-cantiere-ink">
                Impostazioni commerciali
              </h2>
            </div>

            <dl className="mt-5 grid gap-3">
              <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                  Costo attuale
                </dt>
                <dd className="mt-2 text-sm font-semibold text-cantiere-ink">
                  {formatCreditCost(request.creditCost)}
                </dd>
              </div>

              <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                  Limite sblocchi
                </dt>
                <dd className="mt-2 text-sm font-semibold text-cantiere-ink">
                  {formatMaxUnlocks(request.maxUnlocks)}
                </dd>
              </div>

              <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                  Sblocchi attuali
                </dt>
                <dd className="mt-2 text-sm font-semibold text-cantiere-ink">
                  {request.unlockCount}
                </dd>
              </div>
            </dl>

            <form
              action={updateCommercialSettingsAction}
              className="mt-5 grid gap-4 border-t border-cantiere-hairline pt-5"
            >
              <input type="hidden" name="requestId" value={request.id} />

              <label className="grid gap-2">
                <span className="text-sm font-medium text-cantiere-ink">
                  Costo in crediti
                </span>
                <Input
                  name="creditCost"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={request.creditCost ?? ""}
                  placeholder="Non impostato"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-cantiere-ink">
                  Limite massimo imprese
                </span>
                <Input
                  name="maxUnlocks"
                  type="number"
                  min={1}
                  step={1}
                  defaultValue={request.maxUnlocks ?? ""}
                  placeholder="Non impostato"
                />
              </label>

              <Button type="submit" variant="secondary">
                Salva impostazioni commerciali
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <div>
              <p className="text-sm font-medium text-cantiere-ink-secondary">
                Decisione editoriale
              </p>

              <h2 className="mt-1 text-xl font-semibold text-cantiere-ink">
                Revisione marketplace
              </h2>

              <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                Approva solo richieste chiare, localizzabili e utili per le
                imprese.
              </p>
            </div>

            <div className="mt-5 border border-cantiere-hairline bg-cantiere-linen p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-cantiere-ink-secondary">
                Stato attuale
              </p>

              <div className="mt-3">
                <Badge variant={getStatusBadgeVariant(request.status)}>
                  {getStatusLabel(request.status)}
                </Badge>
              </div>
            </div>

            {request.status === "PENDING_VERIFICATION" ? (
              <div className="mt-5 space-y-4">
                <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                  <p className="text-sm font-medium text-cantiere-ink">
                    Email cliente non verificata
                  </p>
                  <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                    Il cliente non ha ancora confermato la richiesta tramite
                    il link inviato per email. Finché resta in questo stato
                    non entra nella coda di revisione e non può essere
                    pubblicata. Invia di nuovo l&apos;email oppure verifica
                    manualmente se hai già confermato il contatto con il
                    cliente (es. telefono).
                  </p>
                </div>

                <form action={resendVerificationEmailAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" variant="secondary">
                    Invia di nuovo l&apos;email di verifica
                  </Button>
                </form>

                <form
                  action={verifyRequestManuallyAction}
                  className="border-t border-cantiere-hairline pt-4"
                >
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit">
                    Verifica manualmente e invia in revisione
                  </Button>
                </form>
              </div>
            ) : request.status === "PENDING_REVIEW" ? (
              <div className="mt-5 space-y-4">
                {!hasRequiredPublishingSettings ? (
                  <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                    <p className="text-sm font-medium text-cantiere-ink">
                      Configurazione commerciale incompleta
                    </p>
                    <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                      Prima di pubblicare la richiesta devi impostare costo
                      crediti e limite imprese.
                    </p>
                  </div>
                ) : null}

                <form action={reviewRequestAction} className="space-y-3">
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="status" value="PUBLISHED" />

                  <div className="space-y-2">
                    <label
                      htmlFor="approve-moderation-notes"
                      className="text-sm font-medium text-cantiere-ink"
                    >
                      Nota moderazione
                    </label>

                    <Textarea
                      id="approve-moderation-notes"
                      name="moderationNotes"
                      rows={3}
                      placeholder="Nota interna opzionale per la revisione."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!hasRequiredPublishingSettings}
                  >
                    Approva pubblicazione
                  </Button>
                </form>

                <form action={reviewRequestAction} className="space-y-3 border-t border-cantiere-hairline pt-4">
                  <input type="hidden" name="requestId" value={request.id} />
                  <input type="hidden" name="status" value="REJECTED" />

                  <div className="space-y-2">
                    <label
                      htmlFor="reject-moderation-notes"
                      className="text-sm font-medium text-cantiere-ink"
                    >
                      Motivo rifiuto
                    </label>

                    <Textarea
                      id="reject-moderation-notes"
                      name="moderationNotes"
                      rows={3}
                      placeholder="Motivo interno o nota editoriale."
                    />
                  </div>

                  <Button type="submit" variant="secondary">
                    Rifiuta richiesta
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-5 border border-cantiere-hairline bg-cantiere-paper p-4">
                <p className="text-sm font-medium text-cantiere-ink">
                  Revisione chiusa
                </p>
                <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                  Questa richiesta ha già ricevuto una decisione editoriale.
                </p>
              </div>
            )}

            <div className="mt-6 border-t border-cantiere-hairline pt-5">
              <p className="text-sm font-semibold text-cantiere-ink">
                Checklist qualità
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-cantiere-ink-secondary">
                <li>• Intervento comprensibile</li>
                <li>• Descrizione utile o dati funnel sufficienti</li>
                <li>• Luogo coerente</li>
                <li>• Cliente contattabile</li>
                <li>• Nessun contenuto spam</li>
              </ul>
            </div>
          </Card>

          <Card className="p-5">
            <div>
              <p className="text-sm font-medium text-cantiere-ink-secondary">
                Gestione richiesta
              </p>

              <h2 className="mt-1 text-xl font-semibold text-cantiere-ink">
                Archiviazione e rimozione
              </h2>

              <p className="mt-2 text-sm leading-6 text-cantiere-ink-secondary">
                Non eliminano mai dati o storico: nascondono solo la
                richiesta dalle liste operative e dal marketplace.
              </p>
            </div>

            {request.deletedAt ? (
              <div className="mt-5 space-y-4">
                <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                  <p className="text-sm font-medium text-cantiere-ink">
                    Richiesta eliminata (soft-delete)
                  </p>
                  <p className="mt-2 text-xs leading-5 text-cantiere-ink-secondary">
                    {formatDate(request.deletedAt)}
                    {request.deletedByAdminUser
                      ? ` · ${request.deletedByAdminUser.name ?? request.deletedByAdminUser.email}`
                      : null}
                  </p>
                  {request.deleteReason ? (
                    <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                      {request.deleteReason}
                    </p>
                  ) : null}
                </div>

                <form action={restoreRequestAction}>
                  <input type="hidden" name="requestId" value={request.id} />
                  <Button type="submit" variant="secondary">
                    Ripristina richiesta
                  </Button>
                </form>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {request.archivedAt ? (
                  <div className="space-y-3">
                    <div className="border border-cantiere-hairline bg-cantiere-linen p-4">
                      <p className="text-sm font-medium text-cantiere-ink">
                        Richiesta archiviata
                      </p>
                      <p className="mt-2 text-xs leading-5 text-cantiere-ink-secondary">
                        {formatDate(request.archivedAt)}
                        {request.archivedByAdminUser
                          ? ` · ${request.archivedByAdminUser.name ?? request.archivedByAdminUser.email}`
                          : null}
                      </p>
                      {request.archiveReason ? (
                        <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                          {request.archiveReason}
                        </p>
                      ) : null}
                    </div>

                    <form action={unarchiveRequestAction}>
                      <input type="hidden" name="requestId" value={request.id} />
                      <Button type="submit" variant="secondary">
                        Ripristina da archivio
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form action={archiveRequestAction} className="space-y-3">
                    <input type="hidden" name="requestId" value={request.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-cantiere-ink">
                        Motivo archiviazione (opzionale)
                      </span>
                      <Textarea
                        name="reason"
                        rows={2}
                        placeholder="Nota interna opzionale."
                      />
                    </label>

                    <Button type="submit" variant="secondary">
                      Archivia richiesta
                    </Button>
                  </form>
                )}

                <form
                  action={softDeleteRequestAction}
                  className="space-y-3 border-t border-cantiere-hairline pt-5"
                >
                  <input type="hidden" name="requestId" value={request.id} />

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-cantiere-ink">
                      Motivo eliminazione (opzionale)
                    </span>
                    <Textarea
                      name="reason"
                      rows={2}
                      placeholder="Nota interna opzionale."
                    />
                  </label>

                  <Button type="submit" variant="secondary">
                    Elimina richiesta (soft-delete)
                  </Button>
                </form>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}
