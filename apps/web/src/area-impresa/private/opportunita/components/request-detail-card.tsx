import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Button,
  Card,
} from "@esigenta/ui";

import {
  formatCreditCost,
  formatUnlockAvailability,
  getRequestCommercialState,
} from "./request-commercial-display";
import {
  PendingSubmitButton,
} from "./request-pending-controls";
import {
  RequestRefundDisclosure,
} from "./request-refund-disclosure";

export type RequestFormDetail = {
  label: string;
  value: string;
};

type CustomerContactDetail = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type RefundRequestDetail = {
  id: string;
  status: string;
  createdAt: string;
};

export type RequestUnlockError = "insufficient_credits";

export type RequestDetailCardProps = {
  unlockError?: RequestUnlockError | null;
  requestCode?: string | null;
  title: string;

  city?: string | null;
  province?: string | null;
  postalCode?: string | null;

  createdAt: string;

  description?: string | null;
  formDetails: RequestFormDetail[];
  photos: Array<{
    src: string;
    fileName: string;
  }>;

  customerContact?: CustomerContactDetail | null;

  requestId: string;
  isSaved: boolean;
  savedAction: (formData: FormData) => Promise<void>;
  creditCost: number | null;
  creditBalance: number;
  maxUnlocks: number | null;
  unlockCount: number;
  hasUnlocked: boolean;
  requestUnlockId?: string | null;
  unlockedAt?: string | null;
  unlockAction: (formData: FormData) => Promise<void>;
  contactCustomerAction?: (formData: FormData) => Promise<void>;
  refundRequestAction: (formData: FormData) => Promise<void>;
  requestUnlockRefundedAt?: string | null;
  requestUnlockRefundTransactionId?: string | null;
  refundRequest?: RefundRequestDetail | null;
};

function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cantiere-linen text-cantiere-ink-secondary"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function ClockIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    </Icon>
  );
}

function CalendarIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1Z" />
      </svg>
    </Icon>
  );
}

function HomeIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11 12 4l8 7" />
        <path d="M6 10v10h12V10" />
        <path d="M10 20v-5h4v5" />
      </svg>
    </Icon>
  );
}

function RulerIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 16 16 4l4 4L8 20l-4-4Z" />
        <path d="M13 7l2 2" />
        <path d="M10 10l2 2" />
        <path d="M7 13l2 2" />
      </svg>
    </Icon>
  );
}

function EuroIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 6.5A6 6 0 1 0 17 17.5" />
        <path d="M6 10h8" />
        <path d="M6 14h7" />
      </svg>
    </Icon>
  );
}

function MapPinIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
    </Icon>
  );
}

function DocumentIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 4h6l4 4v12H6V4h2Z" />
        <path d="M14 4v5h4" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </svg>
    </Icon>
  );
}

function UsersIcon() {
  return (
    <Icon>
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <circle cx="12" cy="9" r="3" />
        <path d="M20 18c0-1.8-1.2-3.2-2.8-3.7" />
        <path d="M16.5 6.5a2.5 2.5 0 0 1 0 5" />
        <path d="M4 18c0-1.8 1.2-3.2 2.8-3.7" />
        <path d="M7.5 6.5a2.5 2.5 0 0 0 0 5" />
      </svg>
    </Icon>
  );
}

function getDetailIcon(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("tempistiche") || normalized.includes("urgenza")) {
    return <ClockIcon />;
  }

  if (normalized.includes("data")) {
    return <CalendarIcon />;
  }

  if (
    normalized.includes("immobile") ||
    normalized.includes("stanze") ||
    normalized.includes("stanza")
  ) {
    return <HomeIcon />;
  }

  if (
    normalized.includes("superficie") ||
    normalized.includes("mq") ||
    normalized.includes("metri")
  ) {
    return <RulerIcon />;
  }

  if (normalized.includes("budget") || normalized.includes("costo")) {
    return <EuroIcon />;
  }

  if (
    normalized.includes("dove") ||
    normalized.includes("luogo") ||
    normalized.includes("indirizzo") ||
    normalized.includes("cap")
  ) {
    return <MapPinIcon />;
  }

  return <DocumentIcon />;
}

function formatDetailValue(label: string, value?: string | number | null) {
  const rawValue = value === null || value === undefined ? "" : String(value);
  const trimmed = rawValue.trim();

  if (!trimmed) {
    return "Non specificato";
  }

  if (
    label.toLowerCase().includes("superficie") &&
    /^\d+([,.]\d+)?$/.test(trimmed)
  ) {
    return `${trimmed} mq`;
  }

  return trimmed;
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="grid gap-2 py-2.5 sm:grid-cols-[13rem_minmax(0,1fr)] sm:gap-8">
      <dt className="flex items-center gap-3 text-sm leading-6 text-cantiere-ink-secondary">
        {icon ?? getDetailIcon(label)}
        <span>{label}</span>
      </dt>

      <dd className="text-sm font-medium leading-6 text-cantiere-ink">
        {formatDetailValue(label, value)}
      </dd>
    </div>
  );
}

function formatContactValue(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed || "Non disponibile";
}

function formatMaxUnlocks(value: number | null) {
  return value === null ? "Non impostato" : `${value} imprese`;
}

function SealIcon({ filled }: { filled: boolean }) {
  return (
    <span
      className={
        filled
          ? "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cantiere-accent text-cantiere-paper"
          : "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cantiere-hairline text-cantiere-ink-secondary"
      }
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {filled ? (
          <path d="m7 12.5 3 3 7-7" />
        ) : (
          <circle cx="12" cy="12" r="7" />
        )}
      </svg>
    </span>
  );
}

function AvailabilityDot({ tone }: { tone: "ok" | "low" | "off" }) {
  return (
    <span
      className={
        tone === "ok"
          ? "h-1.5 w-1.5 rounded-full bg-cantiere-accent"
          : tone === "low"
            ? "h-1.5 w-1.5 rounded-full bg-cantiere-ink"
            : "h-1.5 w-1.5 rounded-full bg-cantiere-ink-secondary"
      }
      aria-hidden="true"
    />
  );
}

function ContactLine({
  icon,
  href,
  value,
}: {
  icon: ReactNode;
  href?: string;
  value: string;
}) {
  const content = (
    <span className="flex items-center gap-3 text-sm font-medium text-cantiere-ink">
      {icon}
      <span className="truncate">{value}</span>
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block py-1.5 transition-colors hover:text-cantiere-accent"
      >
        {content}
      </Link>
    );
  }

  return <div className="py-1.5">{content}</div>;
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-cantiere-ink-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 5 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0 text-cantiere-ink-secondary"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6h16v12H4Z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

function StatusRow({
  label,
  detail,
  href,
}: {
  label: string;
  detail?: string;
  href?: string;
}) {
  return (
    <div className="flex items-baseline gap-2 py-1 text-sm">
      <span
        className="h-1.5 w-1.5 shrink-0 translate-y-[2px] rounded-full bg-cantiere-accent"
        aria-hidden="true"
      />
      <span>
        <span className="font-medium text-cantiere-ink">{label}</span>
        {detail ? (
          href ? (
            <>
              {" "}
              \u00b7{" "}
              <Link
                href={href}
                className="text-cantiere-accent hover:text-cantiere-accent-hover"
                prefetch={false}
              >
                {detail}
              </Link>
            </>
          ) : (
            <span className="text-cantiere-ink-secondary"> \u00b7 {detail}</span>
          )
        ) : null}
      </span>
    </div>
  );
}

function getRefundRequestStatusRow(refundRequest: RefundRequestDetail) {
  if (refundRequest.status === "PENDING_REVIEW") {
    return {
      label: "In revisione",
      detail: `Segnalazione inviata il ${refundRequest.createdAt}`,
    };
  }

  if (refundRequest.status === "APPROVED") {
    return {
      label: "Approvata",
      detail: "Rimborso in elaborazione",
    };
  }

  if (refundRequest.status === "REJECTED") {
    return {
      label: "Non approvata",
      detail: "Contatta assistenza",
      href: "/area-impresa/assistenza",
    };
  }

  if (refundRequest.status === "CANCELLED") {
    return {
      label: "Segnalazione annullata",
    };
  }

  return {
    label: "Segnalazione inviata",
    detail: refundRequest.createdAt,
  };
}

function getUnlockStatusMessage({
  hasUnlocked,
  isCommerciallyConfigured,
  isSoldOut,
}: {
  hasUnlocked: boolean;
  isCommerciallyConfigured: boolean;
  isSoldOut: boolean;
}) {
  if (hasUnlocked) {
    return "Hai sbloccato questa richiesta. I contatti cliente sono ora disponibili.";
  }

  if (!isCommerciallyConfigured) {
    return "Questa richiesta non è ancora pronta per lo sblocco.";
  }

  if (isSoldOut) {
    return "Il limite di imprese per questa richiesta è stato raggiunto.";
  }

  return "Usa i crediti del tuo saldo per sbloccare questa richiesta.";
}

export function RequestDetailCard({
  unlockError,
  requestCode,
  title,
  city,
  province,
  postalCode,
  createdAt,
  description,
  formDetails,
  photos,
  customerContact,
  requestId,
  isSaved,
  savedAction,
  creditCost,
  creditBalance,
  maxUnlocks,
  unlockCount,
  hasUnlocked,
  requestUnlockId,
  unlockedAt,
  unlockAction,
  contactCustomerAction,
  refundRequestAction,
  requestUnlockRefundedAt,
  requestUnlockRefundTransactionId,
  refundRequest,
}: RequestDetailCardProps) {
  const hasDetails = formDetails.length > 0;
  const commercialState = getRequestCommercialState({
    creditCost,
    maxUnlocks,
    unlockCount,
  });
  const cityWithProvince = [city, province]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
  const whereValue =
    cityWithProvince && postalCode
      ? `${cityWithProvince} - ${postalCode}`
      : cityWithProvince || postalCode || "Non specificato";
  const hasSufficientCredits =
    creditCost === null ? true : creditBalance >= creditCost;
  const balanceAfterUnlock =
    creditCost === null ? null : Math.max(creditBalance - creditCost, 0);
  const creditDeficit =
    creditCost === null ? 0 : Math.max(creditCost - creditBalance, 0);
  const canUnlock =
    commercialState.isCommerciallyConfigured &&
    !commercialState.isSoldOut &&
    !hasUnlocked &&
    hasSufficientCredits;
  const hasRefundedUnlock =
    Boolean(requestUnlockRefundedAt || requestUnlockRefundTransactionId);
  const canRequestRefund =
    hasUnlocked &&
    Boolean(requestUnlockId) &&
    !hasRefundedUnlock &&
    !refundRequest;
  const showInsufficientCreditsRecovery =
    !hasUnlocked &&
    commercialState.isCommerciallyConfigured &&
    !commercialState.isSoldOut &&
    (unlockError === "insufficient_credits" || !hasSufficientCredits);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <main className="min-w-0">
        <section>
          <div className="flex gap-4">
            <span className="mt-2 h-20 w-1 shrink-0 rounded-full bg-cantiere-accent" />

            <div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-cantiere-ink md:text-4xl">
                {title}
              </h1>

              <p className="mt-3 text-sm text-cantiere-ink-secondary">
                Pubblicata il {createdAt}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-cantiere-ink">
            {"Attivit\u00e0 su questa richiesta"}
          </h2>

          <div className="mt-3 flex items-center gap-3">
            <UsersIcon />
            <p className="text-sm font-semibold text-cantiere-ink">
              {unlockCount}
              {maxUnlocks === null ? "" : `/${maxUnlocks}`} professionisti interessati
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-cantiere-ink">
            Descrizione
          </h2>

          {description ? (
            <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-cantiere-ink">
              {description}
            </p>
          ) : (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-cantiere-ink-secondary">
              Il cliente non ha aggiunto una descrizione libera. I dettagli del
              form sono disponibili qui sotto.
            </p>
          )}
        </section>

        {photos.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-cantiere-ink">
              Foto allegate
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {photos.map((photo) => (
                <figure
                  key={photo.src}
                  className="overflow-hidden rounded-md border border-cantiere-hairline bg-cantiere-paper"
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
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-cantiere-ink">
            Dettagli richiesta
          </h2>

          <dl className="mt-4 max-w-4xl">
            {hasDetails ? (
              formDetails.map((detail) => (
                <DetailRow
                  key={`${detail.label}-${detail.value}`}
                  label={detail.label}
                  value={detail.value}
                />
              ))
            ) : (
              <DetailRow
                label="Dettagli aggiuntivi"
                value="Nessun dettaglio aggiuntivo disponibile."
                icon={<DocumentIcon />}
              />
            )}

            <DetailRow label="Dove" value={whereValue} icon={<MapPinIcon />} />
            <DetailRow
              label="Codice richiesta"
              value={requestCode ?? "In preparazione"}
              icon={<DocumentIcon />}
            />
          </dl>
        </section>
      </main>

      <aside className="lg:sticky lg:top-24 lg:pb-0 pb-20">
        <Card className="p-6">
          {hasUnlocked ? (
            <>
              <div className="flex items-center gap-3">
                <SealIcon filled />
                <div>
                  <p className="text-sm font-semibold text-cantiere-ink">
                    Contatto sbloccato
                  </p>
                  {unlockedAt ? (
                    <p className="text-xs text-cantiere-ink-secondary">
                      Sbloccato il {unlockedAt}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-5 rounded-[6px] border border-cantiere-hairline bg-cantiere-linen p-4">
                <p className="text-base font-semibold leading-6 text-cantiere-ink">
                  {formatContactValue(customerContact?.name)}
                </p>

                <div className="mt-2 divide-y divide-cantiere-hairline">
                  <ContactLine
                    icon={<PhoneGlyph />}
                    value={formatContactValue(customerContact?.phone)}
                    href={
                      customerContact?.phone
                        ? `tel:${customerContact.phone}`
                        : undefined
                    }
                  />
                  <ContactLine
                    icon={<MailGlyph />}
                    value={formatContactValue(customerContact?.email)}
                    href={
                      customerContact?.email
                        ? `mailto:${customerContact.email}`
                        : undefined
                    }
                  />
                </div>
              </div>

              {contactCustomerAction && !hasRefundedUnlock ? (
                <form action={contactCustomerAction} className="mt-5">
                  <input type="hidden" name="requestId" value={requestId} />
                  <PendingSubmitButton
                    type="submit"
                    className="w-full"
                    pendingChildren="Apertura contatto..."
                  >
                    Contatta cliente
                  </PendingSubmitButton>
                </form>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <SealIcon filled={false} />
                <div>
                  <p className="text-sm font-semibold text-cantiere-ink">
                    Sblocco richiesta
                  </p>
                  <p className="text-xs text-cantiere-ink-secondary">
                    {getUnlockStatusMessage({
                      ...commercialState,
                      hasUnlocked,
                    })}
                  </p>
                </div>
              </div>

              {commercialState.isCommerciallyConfigured ? (
                <div className="mt-5 rounded-[6px] border border-cantiere-hairline bg-cantiere-linen p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-cantiere-ink-secondary">
                      Costo sblocco
                    </span>
                    <span className="text-lg font-semibold text-cantiere-ink">
                      {formatCreditCost(creditCost)}
                    </span>
                  </div>

                  <div
                    className="my-3 border-t border-dashed border-cantiere-hairline"
                    aria-hidden="true"
                  />

                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-cantiere-ink-secondary">
                      {creditBalance} crediti
                    </span>
                    <span className="text-cantiere-ink-secondary" aria-hidden="true">
                      &rarr;
                    </span>
                    <span className="font-semibold text-cantiere-ink">
                      {hasSufficientCredits && balanceAfterUnlock !== null
                        ? `${balanceAfterUnlock} crediti`
                        : `manca ${creditDeficit}`}
                    </span>
                  </div>

                  {showInsufficientCreditsRecovery ? (
                    <>
                      <p className="mt-3 text-sm leading-6 text-cantiere-ink-secondary">
                        Ti mancano {creditDeficit} crediti per sbloccare
                        questa richiesta.
                      </p>
                      <Link
                        href="/area-impresa/crediti"
                        className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[6px] border border-cantiere-accent bg-cantiere-accent px-4 text-sm font-medium text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
                        prefetch={false}
                      >
                        Acquista crediti
                      </Link>
                    </>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-4 flex items-center gap-2 text-sm">
                <AvailabilityDot
                  tone={
                    commercialState.isSoldOut
                      ? "off"
                      : !commercialState.isCommerciallyConfigured
                        ? "low"
                        : "ok"
                  }
                />
                <span className="text-cantiere-ink-secondary">
                  {commercialState.isSoldOut
                    ? "Posti terminati"
                    : `${formatUnlockAvailability(commercialState.availableUnlockSlots)} su ${formatMaxUnlocks(maxUnlocks)}`}
                </span>
              </div>

              <div className="mt-5 hidden sm:block">
                {canUnlock ? (
                  <form action={unlockAction}>
                    <input type="hidden" name="requestId" value={requestId} />
                    <PendingSubmitButton
                      type="submit"
                      className="w-full"
                      pendingChildren="Sblocco in corso..."
                    >
                      Sblocca richiesta
                    </PendingSubmitButton>
                  </form>
                ) : (
                  <Button type="button" disabled className="w-full">
                    {commercialState.isSoldOut
                      ? "Posti terminati"
                      : !hasSufficientCredits
                        ? "Crediti insufficienti"
                        : "Sblocco non disponibile"}
                  </Button>
                )}
              </div>

              <p className="mt-3 text-xs leading-5 text-cantiere-ink-secondary">
                Il costo si applica solo se confermi lo sblocco. Email e
                telefono restano protetti finché non lo fai.
              </p>
            </>
          )}

          {hasUnlocked ? (
            <>
              {hasRefundedUnlock ? (
                <div className="mt-5 border-t border-cantiere-hairline pt-4">
                  <StatusRow
                    label="Crediti rimborsati"
                    detail={
                      creditCost !== null
                        ? `+${creditCost} crediti`
                        : requestUnlockRefundedAt ?? undefined
                    }
                  />
                </div>
              ) : refundRequest ? (
                <div className="mt-5 border-t border-cantiere-hairline pt-4">
                  <StatusRow {...getRefundRequestStatusRow(refundRequest)} />
                </div>
              ) : canRequestRefund ? (
                <RequestRefundDisclosure
                  requestId={requestId}
                  requestUnlockId={requestUnlockId}
                  refundRequestAction={refundRequestAction}
                />
              ) : null}

              <form action={savedAction} className="mt-6 border-t border-cantiere-hairline pt-4">
                <PendingSubmitButton
                  type="submit"
                  name="requestId"
                  value={requestId}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  pendingChildren="Aggiornamento..."
                >
                  {isSaved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
                </PendingSubmitButton>
              </form>
            </>
          ) : (
            <form action={savedAction} className="mt-5 border-t border-cantiere-hairline pt-4">
              <PendingSubmitButton
                type="submit"
                name="requestId"
                value={requestId}
                variant="secondary"
                className="w-full"
                pendingChildren="Aggiornamento..."
              >
                {isSaved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
              </PendingSubmitButton>
            </form>
          )}
        </Card>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-cantiere-hairline bg-cantiere-paper p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        {hasUnlocked ? (
          contactCustomerAction && !hasRefundedUnlock ? (
            <form action={contactCustomerAction}>
              <input type="hidden" name="requestId" value={requestId} />
              <PendingSubmitButton
                type="submit"
                className="w-full"
                pendingChildren="Apertura contatto..."
              >
                Contatta cliente
              </PendingSubmitButton>
            </form>
          ) : null
        ) : canUnlock ? (
          <form action={unlockAction}>
            <input type="hidden" name="requestId" value={requestId} />
            <PendingSubmitButton
              type="submit"
              className="w-full"
              pendingChildren="Sblocco in corso..."
            >
              {`Sblocca · ${formatCreditCost(creditCost)}`}
            </PendingSubmitButton>
          </form>
        ) : showInsufficientCreditsRecovery ? (
          <Link
            href="/area-impresa/crediti"
            className="flex h-10 w-full items-center justify-center rounded-[6px] border border-cantiere-accent bg-cantiere-accent px-4 text-sm font-medium text-cantiere-paper transition-colors hover:border-cantiere-accent-hover hover:bg-cantiere-accent-hover"
            prefetch={false}
          >
            Acquista crediti
          </Link>
        ) : (
          <Button type="button" disabled className="w-full">
            {commercialState.isSoldOut
              ? "Posti terminati"
              : "Sblocco non disponibile"}
          </Button>
        )}
      </div>
    </div>
  );
}
