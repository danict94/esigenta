import type { ReactNode } from "react";

import { Card, cn } from "@fixpro/ui";

import {
  formatCreditCost,
  formatUnlockAvailability,
  getRequestCommercialState,
} from "./request-commercial-display";

export type RequestFormDetail = {
  label: string;
  value: string;
};

export type RequestDetailCardProps = {
  requestCode?: string | null;
  title: string;

  city?: string | null;
  province?: string | null;
  postalCode?: string | null;

  createdAt: string;

  description?: string | null;
  formDetails: RequestFormDetail[];

  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;

  creditCost: number | null;
  maxUnlocks: number | null;
  unlockCount: number;
};

const maskChar = "\u2022";

function maskName(value?: string | null) {
  if (!value) {
    return "Disponibile dopo lo sblocco";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0)}${maskChar.repeat(6)}`)
    .join(" ");
}

function maskEmail(value?: string | null) {
  if (!value || !value.includes("@")) {
    return `${maskChar.repeat(6)}@${maskChar.repeat(6)}`;
  }

  const [name, domain] = value.split("@");

  return `${name.charAt(0)}${maskChar.repeat(6)}@${domain}`;
}

function maskPhone(value?: string | null) {
  const digits = value?.replace(/\D/g, "") ?? "";
  const suffix = digits.slice(-2);

  return `${maskChar.repeat(3)} ${maskChar.repeat(3)} ${maskChar.repeat(2)}${
    suffix || maskChar.repeat(2)
  }`;
}

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

function LockedContactRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 py-1.5">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="truncate text-right text-sm font-medium text-text-primary">
        {value}
      </dd>
    </div>
  );
}

function formatMaxUnlocks(value: number | null) {
  return value === null ? "Non impostato" : `${value} imprese`;
}

function getUnlockStatusLabel({
  isCommerciallyConfigured,
  isSoldOut,
}: {
  isCommerciallyConfigured: boolean;
  isSoldOut: boolean;
}) {
  if (!isCommerciallyConfigured) {
    return "Non ancora acquistabile";
  }

  if (isSoldOut) {
    return "Posti terminati";
  }

  return "Disponibile per lo sblocco";
}

function getUnlockStatusMessage({
  isCommerciallyConfigured,
  isSoldOut,
}: {
  isCommerciallyConfigured: boolean;
  isSoldOut: boolean;
}) {
  if (!isCommerciallyConfigured) {
    return "Questa richiesta non è ancora pronta per lo sblocco.";
  }

  if (isSoldOut) {
    return "Il limite di imprese per questa richiesta è stato raggiunto.";
  }

  return "La richiesta è configurata, ma lo sblocco operativo non è ancora attivo.";
}

export function RequestDetailCard({
  requestCode,
  title,
  city,
  province,
  postalCode,
  createdAt,
  description,
  formDetails,
  customerName,
  customerEmail,
  customerPhone,
  creditCost,
  maxUnlocks,
  unlockCount,
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

          <div className="mt-4 inline-flex rounded-full border border-border-primary bg-surface-secondary px-3 py-1 text-xs font-medium text-text-primary">
            {getUnlockStatusLabel(commercialState)}
          </div>

          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {getUnlockStatusMessage(commercialState)}
          </p>

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
              Contatto cliente
            </h2>

            <dl className="mt-4">
              <LockedContactRow label="Nome" value={maskName(customerName)} />
              <LockedContactRow label="Email" value={maskEmail(customerEmail)} />
              <LockedContactRow label="Telefono" value={maskPhone(customerPhone)} />
            </dl>
          </div>

          <button
            type="button"
            disabled
            className={cn(
              "mt-6 inline-flex h-11 w-full cursor-not-allowed items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-5 text-sm font-medium text-brand-on-primary opacity-70",
            )}
          >
            Sblocco non ancora attivo
          </button>

          <p className="mt-3 text-xs leading-5 text-text-muted">
            Sistema crediti in preparazione.
          </p>
        </Card>
      </aside>
    </div>
  );
}
