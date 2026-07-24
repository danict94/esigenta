"use client";

import { useState } from "react";

import { Checkbox, Input, Select, Textarea } from "@esigenta/ui";

import { PendingSubmitButton } from "./request-pending-controls";

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
    label: "Richiesta già risolta",
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

export function RequestRefundDisclosure({
  requestId,
  requestUnlockId,
  refundRequestAction,
}: {
  requestId: string;
  requestUnlockId?: string | null;
  refundRequestAction: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="mt-4 border-t border-eg-border pt-4">
        <p className="text-xs leading-5 text-eg-text-muted">
          Il contatto non risponde o è sbagliato?
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 text-xs font-semibold text-eg-brand-strong transition-colors hover:text-eg-brand"
        >
          Segnala un problema
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-eg-border pt-4">
      <form action={refundRequestAction} className="grid gap-5">
        <input type="hidden" name="requestId" value={requestId} />
        <input
          type="hidden"
          name="requestUnlockId"
          value={requestUnlockId ?? ""}
        />

        <div>
          <h3 className="text-sm font-semibold text-eg-ink">
            Segnala un problema con il contatto
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-eg-text-muted">
            Esigenta verifica ogni segnalazione. Se il contatto risulta
            inutilizzabile, puoi richiedere il rimborso dei crediti secondo le
            condizioni previste.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-eg-text-muted">
            Motivo
          </span>
          <Select name="reason" required>
            {refundReasonOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-eg-text-muted">
            Cosa è successo
          </span>
          <Textarea
            name="description"
            required
            minLength={20}
            rows={3}
            placeholder="Spiega cosa hai verificato e perché chiedi la revisione."
          />
        </label>

        <div className="grid gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-eg-text-muted">
            Tentativo di contatto
          </span>

          <label className="flex items-start gap-3 text-sm leading-6 text-eg-text-muted">
            <Checkbox name="companyContactAttempted" className="mt-0.5" />
            <span>Ho provato a contattare il cliente</span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs text-eg-text-muted">
              Data ultimo tentativo
            </span>
            <Input type="date" name="lastContactAttemptAt" />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <PendingSubmitButton
            type="submit"
            variant="ghost"
            pendingChildren="Invio in corso..."
          >
            Invia segnalazione
          </PendingSubmitButton>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-eg-text-muted transition-colors hover:text-eg-ink"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
