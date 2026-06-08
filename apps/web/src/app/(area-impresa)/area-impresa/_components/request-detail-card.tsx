import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Select,
  Textarea,
} from "@esigenta/ui";

import {
  formatCreditCost,
  formatUnlockAvailability,
  getRequestCommercialState,
} from "./request-commercial-display";
import {
  PendingSubmitButton,
} from "./request-pending-controls";

export type RequestFormDetail = {
  label: string;
  value: string;
};

export type CustomerContactDetail = {
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
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-secondary text-text-muted ring-1 ring-border-primary"
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
      <dt className="flex items-center gap-3 text-sm leading-6 text-text-muted">
        {icon ?? getDetailIcon(label)}
        <span>{label}</span>
      </dt>

      <dd className="text-sm font-medium leading-6 text-text-primary">
        {formatDetailValue(label, value)}
      </dd>
    </div>
  );
}

function formatContactValue(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed || "Non disponibile";
}

function ContactRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-1.5">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="truncate text-right text-sm font-medium text-text-primary">
        {formatContactValue(value)}
      </dd>
    </div>
  );
}

function formatMaxUnlocks(value: number | null) {
  return value === null ? "Non impostato" : `${value} imprese`;
}

const refundReasonOptions = [
  {
    value: "CUSTOMER_NOT_RESPONDING",
    label: "Cliente non risponde",
  },
  {
    value: "INVALID_CONTACTS",
    label: "Contatti errati o non funzionanti",
  },
  {
    value: "REQUEST_ALREADY_RESOLVED",
    label: "Richiesta gi\u00e0 risolta",
  },
  {
    value: "INVALID_OR_SPAM_REQUEST",
    label: "Richiesta non valida, spam o falsa",
  },
  {
    value: "DUPLICATE_REQUEST",
    label: "Richiesta duplicata",
  },
  {
    value: "OTHER",
    label: "Altro motivo da valutare",
  },
] as const;

function getUnlockStatusLabel({
  hasUnlocked,
  isCommerciallyConfigured,
  isSoldOut,
}: {
  hasUnlocked: boolean;
  isCommerciallyConfigured: boolean;
  isSoldOut: boolean;
}) {
  if (hasUnlocked) {
    return "Richiesta sbloccata";
  }

  if (!isCommerciallyConfigured) {
    return "Non ancora acquistabile";
  }

  if (isSoldOut) {
    return "Posti terminati";
  }

  return "Disponibile per lo sblocco";
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
  const canUnlock =
    commercialState.isCommerciallyConfigured &&
    !commercialState.isSoldOut &&
    !hasUnlocked;
  const hasRefundedUnlock =
    Boolean(requestUnlockRefundedAt || requestUnlockRefundTransactionId);
  const canRequestRefund =
    hasUnlocked &&
    Boolean(requestUnlockId) &&
    !hasRefundedUnlock &&
    !refundRequest;
  const showInsufficientCreditsRecovery =
    unlockError === "insufficient_credits" && !hasUnlocked;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <main className="min-w-0">
        <section>
          <div className="flex gap-4">
            <span className="mt-2 h-20 w-1 shrink-0 rounded-full bg-brand-primary" />

            <div>
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
                {title}
              </h1>

              <p className="mt-3 text-sm text-text-secondary">
                Pubblicata il {createdAt}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            {"Attivit\u00e0 su questa richiesta"}
          </h2>

          <div className="mt-3 flex items-center gap-3">
            <UsersIcon />
            <p className="text-sm font-semibold text-text-primary">
              {unlockCount}
              {maxUnlocks === null ? "" : `/${maxUnlocks}`} professionisti interessati
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
            Descrizione
          </h2>

          {description ? (
            <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-text-primary">
              {description}
            </p>
          ) : (
            <p className="mt-4 max-w-3xl text-sm leading-6 text-text-secondary">
              Il cliente non ha aggiunto una descrizione libera. I dettagli del
              form sono disponibili qui sotto.
            </p>
          )}
        </section>

        {photos.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-text-primary">
              Foto allegate
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {photos.map((photo) => (
                <figure
                  key={photo.src}
                  className="overflow-hidden rounded-md border border-border-primary bg-surface-primary"
                >
                  <div className="relative aspect-video bg-surface-secondary">
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

                  <figcaption className="truncate px-3 py-2 text-xs text-text-muted">
                    {photo.fileName}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight text-text-primary">
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

      <aside className="lg:sticky lg:top-24">
        <Card className="p-6 shadow-sm">
          <p className="text-sm font-medium text-text-muted">
            Crediti
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text-primary">
            Sblocco richiesta
          </h2>

          <Badge variant="warning" size="sm" className="mt-4">
            {getUnlockStatusLabel({
              ...commercialState,
              hasUnlocked,
            })}
          </Badge>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {getUnlockStatusMessage({
              ...commercialState,
              hasUnlocked,
            })}
          </p>

          {showInsufficientCreditsRecovery ? (
            <div className="mt-5 rounded-md border border-border-primary bg-surface-secondary p-4">
              <p className="text-sm font-semibold text-text-primary">
                Crediti insufficienti per sbloccare questa richiesta.
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Acquista un pacchetto crediti per continuare e contattare il
                cliente.
              </p>
              <Link
                href="/area-impresa/crediti"
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-4 text-sm font-medium text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover"
              >
                Acquista crediti
              </Link>
            </div>
          ) : null}

          <form action={savedAction} className="mt-5">
            <PendingSubmitButton
              type="submit"
              name="requestId"
              value={requestId}
              variant="secondary"
              className="w-full"
              pendingChildren="Aggiornamento..."
            >
              {isSaved
                ? "Rimuovi dai preferiti"
                : "Salva nei preferiti"}
            </PendingSubmitButton>
          </form>

          <dl className="mt-5 grid gap-3 border-t border-border-primary pt-5">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-text-muted">Costo in crediti</dt>
              <dd className="text-sm font-semibold text-text-primary">
                {formatCreditCost(creditCost)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-text-muted">Limite imprese</dt>
              <dd className="text-sm font-semibold text-text-primary">
                {formatMaxUnlocks(maxUnlocks)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-text-muted">Sblocchi attuali</dt>
              <dd className="text-sm font-semibold text-text-primary">
                {unlockCount}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm text-text-muted">Posti disponibili</dt>
              <dd className="text-sm font-semibold text-text-primary">
                {formatUnlockAvailability(commercialState.availableUnlockSlots)}
              </dd>
            </div>
          </dl>

          <div className="mt-8">
            <h2 className="text-sm font-semibold text-text-primary">
              {hasUnlocked ? "Contatti cliente" : "Contatti protetti"}
            </h2>

            {hasUnlocked ? (
              <>
                {unlockedAt ? (
                  <p className="mt-2 text-xs font-medium text-text-muted">
                    Sbloccata il {unlockedAt}
                  </p>
                ) : null}

                <dl className="mt-4">
                  <ContactRow label="Nome" value={customerContact?.name} />
                  <ContactRow label="Email" value={customerContact?.email} />
                  <ContactRow label="Telefono" value={customerContact?.phone} />
                </dl>

                {contactCustomerAction && !hasRefundedUnlock ? (
                  <form action={contactCustomerAction} className="mt-5">
                    <input type="hidden" name="requestId" value={requestId} />
                    <PendingSubmitButton
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      pendingChildren="Apertura contatto..."
                    >
                      Contatta cliente
                    </PendingSubmitButton>
                  </form>
                ) : null}
              </>
            ) : (
              <div className="mt-4 rounded-md border border-border-primary bg-surface-secondary p-4">
                <p className="text-sm leading-6 text-text-secondary">
                  Sblocca la richiesta con i crediti per visualizzare i
                  contatti del cliente.
                </p>
              </div>
            )}
          </div>

          {hasUnlocked ? (
            <div className="mt-6 border-t border-border-primary pt-6">
              {hasRefundedUnlock ? (
                <div className="rounded-md border border-border-primary bg-surface-secondary p-4">
                  <p className="text-sm font-semibold text-text-primary">
                    Crediti rimborsati
                  </p>
                  {requestUnlockRefundedAt ? (
                    <p className="mt-1 text-xs text-text-muted">
                      Rimborso registrato il {requestUnlockRefundedAt}
                    </p>
                  ) : null}
                </div>
              ) : refundRequest ? (
                <div className="rounded-md border border-border-primary bg-surface-secondary p-4">
                  <p className="text-sm font-semibold text-text-primary">
                    Richiesta rimborso in revisione
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Inviata il {refundRequest.createdAt}
                  </p>
                </div>
              ) : canRequestRefund ? (
                <form action={refundRequestAction} className="grid gap-4">
                  <input type="hidden" name="requestId" value={requestId} />
                  <input
                    type="hidden"
                    name="requestUnlockId"
                    value={requestUnlockId ?? ""}
                  />

                  <div>
                    <h2 className="text-sm font-semibold text-text-primary">
                      Richiedi rimborso
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-text-muted">
                      La richiesta sar\u00e0 verificata dal team Esigenta. Il
                      rimborso non \u00e8 automatico.
                    </p>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      Motivo
                    </span>
                    <Select
                      name="reason"
                      required
                    >
                      {refundReasonOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <p className="text-xs leading-5 text-text-muted">
                    Puoi richiedere il rimborso se hai provato a contattare il
                    cliente e non hai ricevuto risposta.
                  </p>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      Descrizione
                    </span>
                    <Textarea
                      name="description"
                      required
                      minLength={20}
                      rows={4}
                      placeholder="Spiega cosa hai verificato e perché chiedi la revisione."
                    />
                  </label>

                  <label className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
                    <Checkbox
                      name="companyContactAttempted"
                      className="mt-1"
                    />
                    <span>
                      Confermo di aver provato a contattare il cliente
                    </span>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-text-primary">
                      Ultimo tentativo contatto
                    </span>
                    <Input
                      type="date"
                      name="lastContactAttemptAt"
                    />
                  </label>

                  <PendingSubmitButton
                    type="submit"
                    variant="secondary"
                    pendingChildren="Invio in corso..."
                  >
                    Invia richiesta rimborso
                  </PendingSubmitButton>
                </form>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6">
            <p className="mb-3 text-xs font-medium text-text-muted">
              Costo: {formatCreditCost(creditCost)}
            </p>

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
              <Button
                type="button"
                disabled
                className="w-full"
              >
                {hasUnlocked
                  ? "Richiesta già sbloccata"
                  : commercialState.isSoldOut
                    ? "Posti terminati"
                    : "Sblocco non disponibile"}
              </Button>
            )}
          </div>

          <p className="mt-3 text-xs leading-5 text-text-muted">
            {hasUnlocked
              ? "I dati sono visibili solo per questa impresa dopo lo sblocco."
              : "Email e telefono restano protetti fino allo sblocco."}
          </p>
        </Card>
      </aside>
    </div>
  );
}
