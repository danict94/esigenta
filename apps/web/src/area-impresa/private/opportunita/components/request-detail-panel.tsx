import type { ButtonHTMLAttributes, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@esigenta/ui";

import type {
  RefundRequestDetail,
  RequestFormDetail,
  RequestUnlockError,
} from "./request-detail-card";
import {
  getRequestCommercialState,
} from "./request-commercial-display";
import { formatCreditCost } from "./request-commercial-format";
import { PendingSubmitButton } from "./request-pending-controls";
import { RequestRefundDisclosure } from "./request-refund-disclosure";

type CustomerContactDetail = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type RequestDetailPanelProps = {
  unlockError?: RequestUnlockError | null;
  requestCode?: string | null;
  title: string;
  intervention?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  createdAt: string;
  description?: string | null;
  formDetails: RequestFormDetail[];
  photos: Array<{ src: string; fileName: string }>;
  customerContact?: CustomerContactDetail | null;
  requestId: string;
  isSaved?: boolean;
  savedAction?: (formData: FormData) => Promise<void>;
  creditCost: number | null;
  creditBalance: number;
  maxUnlocks: number | null;
  unlockCount: number;
  hasUnlocked: boolean;
  requestUnlockId?: string | null;
  unlockedAt?: string | null;
  unlockAction?: (formData: FormData) => Promise<void>;
  contactCustomerAction?: (formData: FormData) => Promise<void>;
  refundRequestAction?: (formData: FormData) => Promise<void>;
  requestUnlockRefundedAt?: string | null;
  requestUnlockRefundTransactionId?: string | null;
  refundRequest?: RefundRequestDetail | null;
  fullDetailHref?: string;
  /**
   * Set for companies without full marketplace access (e.g. profile still
   * under review): replaces the unlock/contact card with this notice instead
   * of a real (always-failing) unlock form. Layout/components stay identical
   * — only this content and the available actions differ.
   */
  restrictedNotice?: string;
};

const MAX_PANEL_PHOTOS = 3;

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-eg-hairline bg-eg-calce px-[9px] py-1 font-(family-name:--eg-font-ui) text-[11px] leading-none text-eg-ardesia">
      {children}
    </span>
  );
}

function ActionButton({
  children,
  tone = "default",
  ...props
}: {
  children: ReactNode
  tone?: "default" | "refund"
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        "flex-1 rounded-[2px] border px-3 py-3 text-center font-(family-name:--eg-font-ui) text-[11px] tracking-[0.02em] transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        tone === "refund"
          ? "border-eg-cotto/40 bg-eg-calce text-eg-cotto-dark hover:bg-eg-cotto-tint"
          : "border-eg-hairline bg-eg-calce text-eg-terra hover:border-eg-terra",
      )}
    >
      {children}
    </button>
  );
}

function formatContactValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || "Non disponibile";
}

function getRefundRequestStatusLabel(refundRequest: RefundRequestDetail) {
  if (refundRequest.status === "PENDING_REVIEW") return "Segnalazione in revisione";
  if (refundRequest.status === "APPROVED") return "Rimborso approvato";
  if (refundRequest.status === "REJECTED") return "Segnalazione non approvata";
  if (refundRequest.status === "CANCELLED") return "Segnalazione annullata";
  return "Segnalazione inviata";
}

export function RequestDetailPanel({
  unlockError,
  requestCode,
  title,
  intervention,
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
  fullDetailHref,
  restrictedNotice,
}: RequestDetailPanelProps) {
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
  const creditDeficit =
    creditCost === null ? 0 : Math.max(creditCost - creditBalance, 0);
  const canUnlock =
    commercialState.isCommerciallyConfigured &&
    !commercialState.isSoldOut &&
    !hasUnlocked &&
    hasSufficientCredits;
  const hasRefundedUnlock = Boolean(
    requestUnlockRefundedAt || requestUnlockRefundTransactionId,
  );
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
  const visiblePhotos = photos.slice(0, MAX_PANEL_PHOTOS);
  const remainingPhotoCount = photos.length - visiblePhotos.length;

  return (
    <div className="px-8 pb-24 pt-[26px] min-[900px]:pb-[30px]">
      <p className="font-(family-name:--eg-font-ui) text-[11px] uppercase tracking-[0.08em] text-eg-cotto-dark">
        {requestCode ? `Richiesta ${requestCode}` : "Richiesta"} &middot; {createdAt}
      </p>

      <h2 className="mb-[18px] mt-[10px] text-[24px] font-semibold leading-tight tracking-[-0.01em] text-eg-terra">
        {title}
      </h2>

      <div className="mb-6 flex flex-wrap items-center gap-[7px]">
        {intervention ? <Chip>{intervention}</Chip> : null}
        <Chip>{whereValue}</Chip>

        {fullDetailHref ? (
          <a
            href={fullDetailHref}
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-eg-cotto transition-colors hover:text-eg-cotto-dark"
          >
            Apri dettaglio completo &rarr;
          </a>
        ) : null}
      </div>

      {photos.length > 0 ? (
        <div className="mb-6 grid grid-cols-3 gap-2">
          {visiblePhotos.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-square overflow-hidden rounded-md border border-eg-hairline bg-eg-calce-2"
            >
              <Image
                src={photo.src}
                alt={photo.fileName}
                fill
                unoptimized
                loading="lazy"
                sizes="150px"
                className="object-cover"
              />
            </div>
          ))}

          {remainingPhotoCount > 0 && fullDetailHref ? (
            <Link
              href={fullDetailHref}
              prefetch={false}
              className="flex aspect-square items-center justify-center rounded-md border border-eg-hairline bg-eg-calce-2 text-xs font-medium text-eg-terra transition-colors hover:border-eg-cotto"
            >
              +{remainingPhotoCount} foto
            </Link>
          ) : null}
        </div>
      ) : null}

      <p className="mb-6 border-b border-eg-hairline pb-6 text-[14.5px] leading-[1.65] text-eg-terra">
        {description ? (
          <span className="whitespace-pre-line">{description}</span>
        ) : (
          <span className="text-eg-ardesia">
            Il cliente non ha aggiunto una descrizione libera.
          </span>
        )}
      </p>

      {formDetails.length > 0 ? (
        <div className="mb-[26px] grid grid-cols-2 gap-4">
          {formDetails.slice(0, 6).map((detail) => (
            <div key={`${detail.label}-${detail.value}`}>
              <p className="mb-[5px] font-(family-name:--eg-font-ui) text-[10px] uppercase tracking-[0.06em] text-eg-ardesia-2">
                {detail.label}
              </p>
              <p className="text-[15px] font-medium text-eg-terra">
                {detail.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mb-5 overflow-hidden rounded-[4px] border border-eg-hairline">
        {hasUnlocked ? (
          <div className="px-6 py-[22px]">
            <p className="text-sm font-semibold text-eg-terra">
              Contatto sbloccato
            </p>
            {unlockedAt ? (
              <p className="text-xs text-eg-ardesia">Sbloccato il {unlockedAt}</p>
            ) : null}

            <div className="mt-3 divide-y divide-eg-hairline">
              <div className="flex items-center gap-3 py-[11px]">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eg-calce-2"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-eg-terra">
                    {formatContactValue(customerContact?.name)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 py-[11px]">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eg-calce-2"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium text-eg-terra">
                    {formatContactValue(customerContact?.phone)}
                  </p>
                  <p className="eg-field-caption text-[11px]">telefono</p>
                </div>
                {customerContact?.phone ? (
                  <a
                    href={`tel:${customerContact.phone}`}
                    className="ml-auto shrink-0 rounded-full border border-eg-hairline px-3 py-[7px] font-(family-name:--eg-font-ui) text-[11px] text-eg-cotto-dark transition-colors hover:border-eg-cotto"
                  >
                    CHIAMA &rarr;
                  </a>
                ) : null}
              </div>

              {customerContact?.email ? (
                <div className="flex items-center gap-3 py-[11px]">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-eg-calce-2"
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <a
                      href={`mailto:${customerContact.email}`}
                      className="block truncate text-[15px] font-medium text-eg-terra hover:text-eg-cotto"
                    >
                      {customerContact.email}
                    </a>
                    <p className="eg-field-caption text-[11px]">email</p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-[10px]">
              {contactCustomerAction && !hasRefundedUnlock ? (
                <form action={contactCustomerAction} className="flex flex-1">
                  <input type="hidden" name="requestId" value={requestId} />
                  <ActionButton type="submit">Contatta cliente</ActionButton>
                </form>
              ) : null}

              {savedAction ? (
                <form action={savedAction} className="flex flex-1">
                  <input type="hidden" name="requestId" value={requestId} />
                  <ActionButton type="submit">
                    {isSaved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
                  </ActionButton>
                </form>
              ) : null}
            </div>

            {hasRefundedUnlock ? (
              <p className="mt-3 text-xs text-eg-ardesia">
                Crediti rimborsati{creditCost !== null ? ` (+${creditCost})` : ""}.
              </p>
            ) : refundRequest ? (
              <p className="mt-3 text-xs text-eg-ardesia">
                {getRefundRequestStatusLabel(refundRequest)}
              </p>
            ) : canRequestRefund && refundRequestAction ? (
              <RequestRefundDisclosure
                requestId={requestId}
                requestUnlockId={requestUnlockId}
                refundRequestAction={refundRequestAction}
              />
            ) : null}
          </div>
        ) : restrictedNotice ? (
          <div className="bg-eg-calce-2 px-6 py-6 text-center">
            <p className="text-[18px] font-semibold text-eg-terra">
              Sblocco richiesta
            </p>
            <p className="mt-1 text-[12.5px] leading-6 text-eg-ardesia">
              {restrictedNotice}
            </p>
          </div>
        ) : (
          <>
            <div className="bg-eg-calce-2 px-6 py-6 text-center">
              <p className="text-[18px] font-semibold text-eg-terra">
                Sblocco richiesta
              </p>
              <p className="mt-1 text-[12.5px] text-eg-ardesia">
                {commercialState.isCommerciallyConfigured
                  ? "Sblocca per vedere nome completo, telefono ed email."
                  : "Questa richiesta non è ancora pronta per lo sblocco."}
              </p>
            </div>

            <div className="px-6 py-[22px]">
              {showInsufficientCreditsRecovery ? (
                <>
                  <p className="mb-3 text-xs leading-5 text-eg-ardesia">
                    Ti mancano {creditDeficit} crediti per sbloccare questa
                    richiesta.
                  </p>
                  <Link
                    href="/area-impresa/crediti"
                    className="inline-flex h-11 w-full items-center justify-center rounded-[2px] border border-eg-terra bg-eg-terra px-4 font-(family-name:--eg-font-ui) text-xs uppercase tracking-[0.06em] text-eg-calce transition-colors hover:border-eg-cotto-dark hover:bg-eg-cotto-dark"
                    prefetch={false}
                  >
                    Acquista crediti
                  </Link>
                </>
              ) : commercialState.isCommerciallyConfigured && unlockAction ? (
                <form action={unlockAction}>
                  <input type="hidden" name="requestId" value={requestId} />
                  <PendingSubmitButton
                    type="submit"
                    className="w-full justify-between"
                    disabled={!canUnlock}
                    pendingChildren="Sblocco in corso..."
                  >
                    <span>Sblocca contatto</span>
                    <span className="rounded-full bg-eg-calce-translucent px-2 py-0.5 text-[11px] normal-case tracking-normal">
                      {commercialState.isSoldOut
                        ? "posti terminati"
                        : `−${formatCreditCost(creditCost)}`}
                    </span>
                  </PendingSubmitButton>
                </form>
              ) : null}

              {savedAction ? (
                <form action={savedAction} className="mt-3">
                  <ActionButton
                    type="submit"
                    name="requestId"
                    value={requestId}
                  >
                    {isSaved ? "Rimuovi dai preferiti" : "Salva nei preferiti"}
                  </ActionButton>
                </form>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
