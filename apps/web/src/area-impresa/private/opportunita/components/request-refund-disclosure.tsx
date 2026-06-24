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
      <div className="mt-4 border-t border-cantiere-hairline pt-4">
        <p className="text-xs leading-5 text-cantiere-ink-secondary">
          Il contatto non risponde o è sbagliato?
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-1 text-xs font-semibold text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
        >
          Segnala un problema
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-cantiere-hairline pt-4">
      <form action={refundRequestAction} className="grid gap-5">
        <input type="hidden" name="requestId" value={requestId} />
        <input
          type="hidden"
          name="requestUnlockId"
          value={requestUnlockId ?? ""}
        />

        <div>
          <h3 className="text-sm font-semibold text-cantiere-ink">
            Segnala un problema con il contatto
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-cantiere-ink-secondary">
            Esigenta verifica ogni segnalazione. Se il contatto risulta
            inutilizzabile, puoi richiedere il rimborso dei crediti secondo le
            condizioni previste.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-cantiere-ink-secondary">
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
          <span className="text-xs font-semibold uppercase tracking-wide text-cantiere-ink-secondary">
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
          <span className="text-xs font-semibold uppercase tracking-wide text-cantiere-ink-secondary">
            Tentativo di contatto
          </span>

          <label className="flex items-start gap-3 text-sm leading-6 text-cantiere-ink-secondary">
            <Checkbox name="companyContactAttempted" className="mt-0.5" />
            <span>Ho provato a contattare il cliente</span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-xs text-cantiere-ink-secondary">
              Data ultimo tentativo
            </span>
            <Input type="date" name="lastContactAttemptAt" />
          </label>
        </div>

        <div className="flex items-center gap-4">
          <PendingSubmitButton
            type="submit"
            variant="secondary"
            pendingChildren="Invio in corso..."
          >
            Invia segnalazione
          </PendingSubmitButton>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm font-medium text-cantiere-ink-secondary transition-colors hover:text-cantiere-ink"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
