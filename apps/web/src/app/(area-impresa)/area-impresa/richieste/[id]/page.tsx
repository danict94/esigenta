import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { PageShell } from "@esigenta/ui";

import {
  createCreditRefundRequest,
  createCompanyCustomerConversation,
  getAvailableRequestForCompanyDetail,
  listAttachedRequestPhotos,
  unlockRequestForCompany,
  type CreateCreditRefundRequestInput,
} from "@esigenta/db";

import {
  createRequestPhotoDisplayItems,
} from "@esigenta/uploads/server";

import { requireDefaultCompanyMembership } from "../../../../../auth/server";

import {
  RequestDetailCard,
  type RequestFormDetail,
  type RequestUnlockError,
} from "../../_components/request-detail-card";
import {
  PendingRequestLink,
} from "../../_components/request-pending-controls";
import {
  createPerfTrace,
} from "../../_lib/perf-log";
import { toggleSavedRequestAction } from "../actions";

export const dynamic = "force-dynamic";

type RequestDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    error?: string | string[];
    unlocked?: string | string[];
  }>;
};

type JsonRecord = Record<string, unknown>;

function getSingleSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getUnlockError(value?: string | string[]): RequestUnlockError | null {
  const rawValue = getSingleSearchParam(value);

  return rawValue === "insufficient_credits" ? rawValue : null;
}

function buildRequestDetailHref({
  requestId,
  error,
  unlocked,
}: {
  requestId: string;
  error?: string;
  unlocked?: boolean;
}) {
  const search = new URLSearchParams();

  if (error) {
    search.set("error", error);
  }

  if (unlocked) {
    search.set("unlocked", "1");
  }

  const queryString = search.toString();
  const path = `/area-impresa/richieste/${encodeURIComponent(requestId)}`;

  return queryString ? `${path}?${queryString}` : path;
}

async function unlockRequestAction(formData: FormData) {
  "use server";

  const membership = await requireDefaultCompanyMembership();
  const requestId = String(formData.get("requestId") ?? "").trim();

  const result = await unlockRequestForCompany({
    companyId: membership.companyId,
    requestId,
  });

  if (!result.ok) {
    redirect(
      buildRequestDetailHref({
        requestId,
        error:
          result.code === "insufficient_credits"
            ? "insufficient_credits"
            : result.code,
      }),
    );
  }

  revalidatePath("/area-impresa/richieste");
  revalidatePath(`/area-impresa/richieste/${requestId}`);
  revalidatePath("/area-impresa/contatti");
  redirect(buildRequestDetailHref({ requestId, unlocked: true }));
}

async function contactCustomerAction(formData: FormData) {
  "use server";

  const trace = createPerfTrace({
    scope: "contact-customer-action",
  });
  const requestId = String(formData.get("requestId") ?? "").trim();
  const membership = await trace.measure("membership", () =>
    requireDefaultCompanyMembership(),
  );

  const result = await createCompanyCustomerConversation({
    companyId: membership.companyId,
    userId: membership.userId,
    requestId,
    recordPerf: trace.add,
  });

  if (!result.ok) {
    const redirectHref = trace.measureSync("redirect", () =>
      buildRequestDetailHref({ requestId, error: result.code }),
    );

    trace.finish({
      requestId,
      redirect: redirectHref,
      status: result.code,
    });
    redirect(redirectHref);
  }

  const redirectHref = trace.measureSync(
    "redirect",
    () => `/area-impresa/contatti/${result.conversationId}`,
  );

  trace.finish({
    requestId,
    redirect: redirectHref,
    status: result.created ? "created" : "existing",
  });
  redirect(redirectHref);
}

async function createRefundRequestAction(formData: FormData) {
  "use server";

  const membership = await requireDefaultCompanyMembership();
  const requestId = String(formData.get("requestId") ?? "").trim();
  const requestUnlockId = String(formData.get("requestUnlockId") ?? "").trim();
  const lastContactAttemptValue = String(
    formData.get("lastContactAttemptAt") ?? "",
  ).trim();
  const lastContactAttemptAt = lastContactAttemptValue
    ? new Date(`${lastContactAttemptValue}T00:00:00`)
    : null;

  const result = await createCreditRefundRequest({
    companyId: membership.companyId,
    requestUnlockId,
    reason: String(
      formData.get("reason") ?? "",
    ) as CreateCreditRefundRequestInput["reason"],
    description: String(formData.get("description") ?? ""),
    companyContactAttempted: formData.get("companyContactAttempted") === "on",
    lastContactAttemptAt,
  });

  if (!result.ok) {
    redirect(buildRequestDetailHref({ requestId, error: result.code }));
  }

  revalidatePath(`/area-impresa/richieste/${requestId}`);
}

const italianProvinceCodes = new Set([
  "AG",
  "AL",
  "AN",
  "AO",
  "AP",
  "AQ",
  "AR",
  "AT",
  "AV",
  "BA",
  "BG",
  "BI",
  "BL",
  "BN",
  "BO",
  "BR",
  "BS",
  "BT",
  "BZ",
  "CA",
  "CB",
  "CE",
  "CH",
  "CI",
  "CL",
  "CN",
  "CO",
  "CR",
  "CS",
  "CT",
  "CZ",
  "EN",
  "FC",
  "FE",
  "FG",
  "FI",
  "FM",
  "FR",
  "GE",
  "GO",
  "GR",
  "IM",
  "IS",
  "KR",
  "LC",
  "LE",
  "LI",
  "LO",
  "LT",
  "LU",
  "MB",
  "MC",
  "ME",
  "MI",
  "MN",
  "MO",
  "MS",
  "MT",
  "NA",
  "NO",
  "NU",
  "OG",
  "OR",
  "OT",
  "PA",
  "PC",
  "PD",
  "PE",
  "PG",
  "PI",
  "PN",
  "PO",
  "PR",
  "PT",
  "PU",
  "PV",
  "PZ",
  "RA",
  "RC",
  "RE",
  "RG",
  "RI",
  "RM",
  "RN",
  "RO",
  "SA",
  "SI",
  "SO",
  "SP",
  "SR",
  "SS",
  "SU",
  "SV",
  "TA",
  "TE",
  "TN",
  "TO",
  "TP",
  "TR",
  "TS",
  "TV",
  "UD",
  "VA",
  "VB",
  "VC",
  "VE",
  "VI",
  "VR",
  "VS",
  "VT",
  "VV",
]);

const detailLabels: Record<string, string> = {
  timing: "Tempistiche",
  property: "Immobile",
  propertytype: "Tipo immobile",
  surfacearea: "Superficie",
  rooms: "Stanze",
  budget: "Budget",
  photos: "Foto",
};

const detailSortOrder: Record<string, number> = {
  timing: 10,
  property: 30,
  propertytype: 35,
  surfacearea: 40,
  rooms: 50,
  budget: 60,
  photos: 70,
};

const valueLabels: Record<string, string> = {
  as_soon_as_possible: "Il prima possibile",
  within_30_days: "Entro 30 giorni",
  flexible: "Flessibile",
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

const omittedDetailKeys = new Set([
  "location",
  "contact",
  "description",
  "descrizione",
  "message",
  "notes",
  "details",
  "city",
  "address",
  "postalcode",
  "cap",
  "where",
  "dove",
  "luogo",
  "indirizzo",
  "province",
  "provincecode",
  "provincia",
  "intervention",
  "interventionslug",
  "service",
  "serviceslug",
  "worktype",
  "jobtype",
  "typeofwork",
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
  "customerdescription",
  "requestdescription",
  "problemdescription",
  "additionalinfo",
  "additionalinformation",
]);

const provinceKeys = new Set(["province", "provincecode", "provincia"]);

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeKey(key: string) {
  return key.replace(/[-_\s]/g, "").toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date);
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Richiesta";
  }

  const readable = slug.replace(/[-_]/g, " ").trim().toLowerCase();

  return readable.charAt(0).toUpperCase() + readable.slice(1);
}

function formatKey(key: string) {
  const formatted = key
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return (
      valueLabels[trimmed] ?? valueLabels[trimmed.toLowerCase()] ?? trimmed
    );
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Si" : "No";
  }

  return "";
}

function formatStructuredValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "";
    }

    if (value.every(isRecord)) {
      const names = value
        .map((item) => (typeof item.name === "string" ? item.name : undefined))
        .filter(Boolean);

      return names.length > 0
        ? `${value.length} file: ${names.join(", ")}`
        : `${value.length} elementi`;
    }

    return value.map(formatStructuredValue).filter(Boolean).join(", ");
  }

  if (isRecord(value)) {
    const entries = Object.entries(value)
      .map(([key, entryValue]) => {
        const formatted = formatStructuredValue(entryValue);

        if (!formatted) {
          return null;
        }

        return `${formatKey(key)}: ${formatted}`;
      })
      .filter(Boolean);

    return entries.join("; ");
  }

  return formatPrimitive(value);
}

function getRawAnswers(structuredData: unknown): JsonRecord {
  if (!isRecord(structuredData)) {
    return {};
  }

  if (
    isRecord(structuredData.draft) &&
    isRecord(structuredData.draft.rawAnswers)
  ) {
    return structuredData.draft.rawAnswers;
  }

  if (isRecord(structuredData.rawAnswers)) {
    return structuredData.rawAnswers;
  }

  return structuredData;
}

function getProvinceCode(value: unknown): string | null {
  if (typeof value === "string") {
    const code = value.trim().toUpperCase();

    return /^[A-Z]{2}$/.test(code) && italianProvinceCodes.has(code)
      ? code
      : null;
  }

  if (!isRecord(value)) {
    return null;
  }

  for (const [key, entryValue] of Object.entries(value)) {
    if (["code", "provincecode", "sigla"].includes(normalizeKey(key))) {
      const code = getProvinceCode(entryValue);

      if (code) {
        return code;
      }
    }
  }

  return null;
}

function resolveProvinceFromStructuredData(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = resolveProvinceFromStructuredData(item);

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
    if (provinceKeys.has(normalizeKey(key))) {
      const code = getProvinceCode(entryValue);

      if (code) {
        return code;
      }
    }
  }

  for (const entryValue of Object.values(value)) {
    const found = resolveProvinceFromStructuredData(entryValue);

    if (found) {
      return found;
    }
  }

  return null;
}

function resolveProvinceFromAddress(address?: string | null): string | null {
  if (!address) {
    return null;
  }

  const normalizedAddress = address.replace(/\bitalia\b\.?$/i, "").trim();
  const match = normalizedAddress.match(/\b([A-Za-z]{2})\b\s*[\])}.,;:]*$/);

  return match ? getProvinceCode(match[1]) : null;
}

function resolveProvince({
  address,
  structuredData,
}: {
  address?: string | null;
  structuredData: unknown;
}): string | null {
  return (
    resolveProvinceFromAddress(address) ??
    resolveProvinceFromStructuredData(structuredData)
  );
}

function findDescriptionInValue(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findDescriptionInValue(item);

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
      descriptionKeys.has(normalizeKey(key)) &&
      typeof entryValue === "string"
    ) {
      const trimmed = entryValue.trim();

      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }

  for (const entryValue of Object.values(value)) {
    const found = findDescriptionInValue(entryValue);

    if (found) {
      return found;
    }
  }

  return null;
}

function findDescription(structuredData: unknown): string | null {
  const rawAnswers = getRawAnswers(structuredData);

  return (
    findDescriptionInValue(rawAnswers) ?? findDescriptionInValue(structuredData)
  );
}

function getDetailLabel(key: string) {
  return detailLabels[normalizeKey(key)] ?? formatKey(key);
}

function shouldOmitDetailKey(key: string) {
  return omittedDetailKeys.has(normalizeKey(key));
}

function getDetailSortValue(key: string, index: number) {
  return detailSortOrder[normalizeKey(key)] ?? 1000 + index;
}

function buildFormDetails(structuredData: unknown): RequestFormDetail[] {
  const rawAnswers = getRawAnswers(structuredData);
  const seenLabels = new Set<string>();

  return Object.entries(rawAnswers)
    .map(([key, value], index) => ({ key, value, index }))
    .filter(({ key }) => !shouldOmitDetailKey(key))
    .sort(
      (left, right) =>
        getDetailSortValue(left.key, left.index) -
        getDetailSortValue(right.key, right.index),
    )
    .flatMap(({ key, value }) => {
      const label = getDetailLabel(key);
      const normalizedLabel = label.toLowerCase();
      const formattedValue = formatStructuredValue(value);

      if (!formattedValue || seenLabels.has(normalizedLabel)) {
        return [];
      }

      seenLabels.add(normalizedLabel);

      return [
        {
          label,
          value: formattedValue,
        },
      ];
    });
}

function buildTitle({
  intervention,
  city,
  province,
}: {
  intervention: string;
  city?: string | null;
  province?: string | null;
}) {
  const place = [city, province]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");

  return place ? `${intervention} a ${place}` : intervention;
}

export default async function RequestDetailPage({
  params,
  searchParams,
}: RequestDetailPageProps) {
  const trace = createPerfTrace({
    scope: "request-detail",
  });
  const [{ id }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const membership = await trace.measure("membership", () =>
    requireDefaultCompanyMembership(),
  );

  const visibility = await getAvailableRequestForCompanyDetail({
    companyId: membership.companyId,
    requestId: id,
    recordPerf: trace.add,
  });

  if (!visibility.ok || !visibility.request) {
    trace.finish({
      requestId: id,
      status: "not-found",
    });
    notFound();
  }

  const request = visibility.request;
  const attachedPhotos = await trace.measure("attachments-db", () =>
    listAttachedRequestPhotos(request.id),
  );
  const photos = await trace.measure("uploadthing-sign", () =>
    createRequestPhotoDisplayItems(attachedPhotos),
  );
  const viewModel = trace.measureSync("render-final", () => {
    const unlockError = getUnlockError(resolvedSearchParams.error);
    const hasUnlocked = request.hasUnlocked;
    const requestUnlockRefundState = request.requestUnlockRefund;
    const customerContact = request.customerContact;
    const intervention = formatInterventionLabel(request.interventionSlug);
    const province = resolveProvince({
      address: request.address,
      structuredData: request.structuredData,
    });
    const title = buildTitle({
      intervention,
      city: request.city,
      province,
    });
    const description = findDescription(request.structuredData);
    const formDetails = buildFormDetails(request.structuredData);

    return {
      customerContact,
      description,
      formDetails,
      hasUnlocked,
      province,
      requestUnlockRefundState,
      title,
      unlockError,
    };
  });

  trace.finish({
    requestId: id,
    status: "ok",
  });

  return (
    <PageShell size="xl" className="py-8 md:py-10">
      <div className="mb-6">
        <PendingRequestLink
          href="/area-impresa/richieste"
          pendingChildren="Ritorno alle richieste..."
          className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          &larr; Nuove richieste
        </PendingRequestLink>
      </div>

      <RequestDetailCard
        unlockError={viewModel.unlockError}
        requestCode={request.requestCode}
        title={viewModel.title}
        city={request.city}
        province={viewModel.province}
        postalCode={request.postalCode}
        createdAt={formatDate(request.createdAt)}
        description={viewModel.description}
        formDetails={viewModel.formDetails}
        photos={photos}
        {...(viewModel.hasUnlocked
          ? {
              customerContact: {
                name: viewModel.customerContact?.name ?? null,
                email: viewModel.customerContact?.email ?? null,
                phone: viewModel.customerContact?.phone ?? null,
              },
            }
          : {})}
        requestId={visibility.request.id}
        isSaved={visibility.request.isSaved}
        savedAction={toggleSavedRequestAction}
        creditCost={request.creditCost}
        maxUnlocks={request.maxUnlocks}
        unlockCount={request.unlockCount}
        hasUnlocked={viewModel.hasUnlocked}
        requestUnlockId={visibility.request.requestUnlockId}
        unlockedAt={
          visibility.request.unlockedAt
            ? formatDate(visibility.request.unlockedAt)
            : null
        }
        unlockAction={unlockRequestAction}
        contactCustomerAction={
          viewModel.hasUnlocked ? contactCustomerAction : undefined
        }
        refundRequestAction={createRefundRequestAction}
        requestUnlockRefundedAt={
          viewModel.requestUnlockRefundState?.refundedAt
            ? formatDate(viewModel.requestUnlockRefundState.refundedAt)
            : null
        }
        requestUnlockRefundTransactionId={
          viewModel.requestUnlockRefundState?.refundTransactionId ?? null
        }
        refundRequest={
          viewModel.requestUnlockRefundState?.refundRequest
            ? {
                id: viewModel.requestUnlockRefundState.refundRequest.id,
                status: viewModel.requestUnlockRefundState.refundRequest.status,
                createdAt: formatDate(
                  viewModel.requestUnlockRefundState.refundRequest.createdAt,
                ),
              }
            : null
        }
      />
    </PageShell>
  );
}
