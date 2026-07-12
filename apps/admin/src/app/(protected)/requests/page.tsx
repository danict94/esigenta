import Link from "next/link";

import {
  getAdminRequestStatusCounts,
  listAdminRequests,
  listUnverifiedRequests,
  normalizeAdminRequestStatusFilter,
  type AdminRequestListItem,
  type AdminRequestStatusFilter,
} from "@esigenta/domain";
import {
  Badge,
  Button,
  Card,
  Input,
  PageShell,
  buttonClassName,
  cn,
} from "@esigenta/ui";

import { AdminStatusPill } from "../../../components/admin-status-pill";

export const dynamic = "force-dynamic";

type RequestsPageProps = {
  searchParams?: Promise<{
    status?: string | string[];
    q?: string | string[];
  }>;
};

function readSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatInterventionLabel(slug?: string | null) {
  if (!slug) {
    return "Intervento non disponibile";
  }

  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFreshness(date: Date) {
  const now = Date.now();
  const createdAt = date.getTime();
  const diffMs = Math.max(0, now - createdAt);

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 30) {
    return "Nuova";
  }

  if (hours < 24) {
    return "Oggi";
  }

  if (days === 1) {
    return "Ieri";
  }

  if (days < 7) {
    return `${days} giorni fa`;
  }

  return formatDate(date);
}

function RequestCard({ request }: { request: AdminRequestListItem }) {
  const badge = request.adminBadge;

  return (
    <Card className="p-5 transition-colors hover:border-eg-cotto">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <AdminStatusPill color={badge.color} label={badge.label} />

            {badge.secondaryBadges.map((secondaryBadge) => (
              <AdminStatusPill
                key={secondaryBadge.label}
                color={secondaryBadge.color}
                label={secondaryBadge.label}
              />
            ))}

            <span className="text-xs font-medium uppercase tracking-wide text-eg-ardesia">
              {formatFreshness(request.createdAt)}
            </span>
          </div>

          <h2 className="mt-4 text-xl font-semibold tracking-tight text-eg-terra">
            {formatInterventionLabel(request.interventionSlug)}
          </h2>

          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-eg-ardesia">
            {request.requestCode ?? "Codice non disponibile"}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-eg-ardesia">
            <span>
              <span className="text-eg-ardesia">Città:</span>{" "}
              {request.city ?? "-"}
            </span>

            <span>
              <span className="text-eg-ardesia">Cliente:</span>{" "}
              {request.customerName ?? "-"}
            </span>

            <span>
              <span className="text-eg-ardesia">Email:</span>{" "}
              {request.customerEmail ?? "-"}
            </span>

            <span>
              <span className="text-eg-ardesia">Creata:</span>{" "}
              {formatDate(request.createdAt)}
            </span>
          </div>

          <p className="mt-4 text-sm leading-6 text-eg-ardesia">
            Controlla contenuto, località e qualità del contatto per gestire
            questa opportunità nel marketplace.
          </p>
        </div>

        <div className="flex shrink-0 md:justify-end">
          {/* D-020: edit (commercial settings), archive and soft-delete
              actions live on the request detail page, consistent with the
              existing review/edit actions already there. */}
          <Link
            href={`/requests/${request.id}`}
            className={buttonClassName()}
          >
            Apri richiesta
          </Link>
        </div>
      </div>
    </Card>
  );
}

function RequestListSection({
  title,
  description,
  countLabel,
  countVariant,
  requests,
}: {
  title: string;
  description: string;
  countLabel: string;
  countVariant: "warning" | "neutral";
  requests: AdminRequestListItem[];
}) {
  return (
    <section className="mt-8">
      <div className="border border-eg-hairline bg-eg-calce-2 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-eg-terra">{title}</p>
            <p className="mt-1 text-sm text-eg-ardesia">{description}</p>
          </div>

          <Badge variant={countVariant}>{countLabel}</Badge>
        </div>
      </div>

      <ul className="mt-6 grid gap-4">
        {requests.map((request) => (
          <li key={request.id}>
            <RequestCard request={request} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RequestStatusTabs({
  activeStatus,
  counts,
}: {
  activeStatus: AdminRequestStatusFilter;
  counts: Awaited<ReturnType<typeof getAdminRequestStatusCounts>>;
}) {
  const tabs = [
    { label: "Tutte", href: "/requests", count: counts.all, status: "ALL" },
    {
      label: "Non verificate",
      href: "/requests?status=PENDING_VERIFICATION",
      count: counts.pendingVerification,
      status: "PENDING_VERIFICATION",
    },
    {
      label: "Da approvare",
      href: "/requests?status=PENDING_REVIEW",
      count: counts.pendingReview,
      status: "PENDING_REVIEW",
    },
    {
      label: "Approvate",
      href: "/requests?status=APPROVED",
      count: counts.approved,
      status: "APPROVED",
    },
    {
      label: "Pubblicate",
      href: "/requests?status=PUBLISHED",
      count: counts.published,
      status: "PUBLISHED",
    },
    {
      label: "Rifiutate",
      href: "/requests?status=REJECTED",
      count: counts.rejected,
      status: "REJECTED",
    },
    {
      label: "Chiuse",
      href: "/requests?status=CLOSED",
      count: counts.closed,
      status: "CLOSED",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const isActive = activeStatus === tab.status;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-eg-cotto bg-eg-cotto text-eg-calce"
                : "border-eg-hairline bg-eg-calce text-eg-ardesia hover:text-eg-terra",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "text-xs",
                isActive ? "text-eg-calce" : "text-eg-ardesia",
              )}
            >
              {tab.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function RequestSearchForm({
  activeStatus,
  query,
}: {
  activeStatus: AdminRequestStatusFilter;
  query: string;
}) {
  return (
    <form className="flex gap-2">
      {activeStatus !== "ALL" ? (
        <input type="hidden" name="status" value={activeStatus} />
      ) : null}
      <Input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Cerca per codice, cliente, email o intervento…"
        className="max-w-sm"
      />
      <Button type="submit" variant="ghost">
        Cerca
      </Button>
    </form>
  );
}

export default async function RequestsModerationPage({
  searchParams,
}: RequestsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeStatus = normalizeAdminRequestStatusFilter(
    readSearchParam(resolvedSearchParams.status),
  );
  const query = readSearchParam(resolvedSearchParams.q) ?? "";

  const [requests, counts, unverifiedRequests] = await Promise.all([
    listAdminRequests({ status: activeStatus, search: query }),
    getAdminRequestStatusCounts(),
    listUnverifiedRequests(),
  ]);

  // Only when viewing "Tutte" do we split PENDING_REVIEW to the top — a
  // single-status tab already shows one homogeneous group, splitting it
  // again would be redundant.
  const showsSplitSections = activeStatus === "ALL";
  const pendingReviewRequests = showsSplitSections
    ? requests.filter((request) => request.status === "PENDING_REVIEW")
    : [];
  const otherRequests = showsSplitSections
    ? requests.filter((request) => request.status !== "PENDING_REVIEW")
    : requests;

  return (
    <PageShell size="lg">
      <header className="border-b border-eg-hairline pb-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-eg-ardesia">
              Control room
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-eg-terra">
              Richieste
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-eg-ardesia">
              Gestisci le richieste ricevute e controlla lo stato editoriale
              nel marketplace.
            </p>
          </div>

          <Link
            href="/"
            className="text-sm font-medium text-eg-ardesia transition-colors hover:text-eg-terra"
          >
            Torna alla home
          </Link>
        </div>
      </header>

      <section className="mt-6">
        <RequestStatusTabs activeStatus={activeStatus} counts={counts} />
      </section>

      <section className="mt-4">
        <RequestSearchForm activeStatus={activeStatus} query={query} />
      </section>

      {unverifiedRequests.length > 0 ? (
        <Link href="/requests/non-verificate" className="mt-8 block">
          <Card className="border-2 border-eg-cotto bg-eg-calce-2 p-5 transition-colors hover:border-eg-cotto">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-eg-terra">
                  Richieste in attesa di verifica email
                </p>
                <p className="mt-1 text-sm text-eg-ardesia">
                  Non sono nella coda di revisione e non possono entrare nel
                  marketplace finché il cliente non conferma l&apos;email (o
                  un admin la verifica manualmente). Usa questa pagina per le
                  azioni di recupero (reinvio email, verifica manuale).
                </p>
              </div>

              <Badge variant="danger">
                {unverifiedRequests.length} da recuperare
              </Badge>
            </div>
          </Card>
        </Link>
      ) : null}

      {requests.length === 0 ? (
        <section className="mt-8">
          <Card className="p-8">
            <div className="max-w-xl">
              <p className="text-lg font-semibold text-eg-terra">
                Nessuna richiesta
              </p>
              <p className="mt-2 text-sm leading-6 text-eg-ardesia">
                Non ci sono richieste da mostrare in questo momento.
              </p>
            </div>
          </Card>
        </section>
      ) : showsSplitSections ? (
        <>
          {pendingReviewRequests.length > 0 ? (
            <RequestListSection
              title="Da approvare"
              description="Richieste in coda di revisione, in attesa della tua approvazione."
              countLabel={`${pendingReviewRequests.length} da approvare`}
              countVariant="warning"
              requests={pendingReviewRequests}
            />
          ) : null}

          {otherRequests.length > 0 ? (
            <RequestListSection
              title="Altre richieste"
              description="Non verificate, approvate, pubblicate, rifiutate o chiuse."
              countLabel={`${otherRequests.length} richieste`}
              countVariant="neutral"
              requests={otherRequests}
            />
          ) : null}
        </>
      ) : (
        <section className="mt-8">
          <ul className="grid gap-4">
            {requests.map((request) => (
              <li key={request.id}>
                <RequestCard request={request} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
