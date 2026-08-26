"use client";

/**
 * Esigenta — FASE 9J: modal "prima di andare, ci aiuti a migliorare?"
 *
 * Puramente presentazionale: non sa nulla di funnelSessionId/tracking —
 * riceve l'elenco di motivi già risolto (vedi
 * resolve-exit-feedback-reason-options.ts) e tre callback (request-stepper.tsx
 * decide cosa fare in ciascun caso). Nessun campo di testo libero (per
 * "other" — vedi request-stepper.tsx/il report FASE 9J: per ora other è
 * solo un reasonCode, senza testo associato).
 *
 * UX: leggero (nessuna libreria esterna, stesso pattern del pannello
 * cookie-consent.tsx già esistente), mobile-first (bottom sheet sotto
 * ~768px, centrato sopra), non colpevolizzante (nessuna copy che
 * scoraggia l'uscita, "Esci senza rispondere" sempre visibile e con lo
 * stesso peso visivo delle altre opzioni), chiudibile in tre modi
 * equivalenti (X, click sul backdrop, Esc) che restano TUTTI "resta nel
 * funnel" — solo onSelectReason/onSkip escono davvero (vedi
 * request-stepper.tsx).
 */

import { useEffect, useRef } from "react";

import type { FunnelExitFeedbackReasonOption } from "./resolve-exit-feedback-reason-options";

type FunnelExitFeedbackModalProps = {
  open: boolean;
  reasonOptions: FunnelExitFeedbackReasonOption[];
  onSelectReason: (reasonCode: FunnelExitFeedbackReasonOption["reasonCode"]) => void;
  onSkip: () => void;
  onDismiss: () => void;
};

const TITLE_ID = "funnel-exit-feedback-title";

export function FunnelExitFeedbackModal({
  open,
  reasonOptions,
  onSelectReason,
  onSkip,
  onDismiss,
}: FunnelExitFeedbackModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    // Focus sul pannello all'apertura — stesso pattern già usato altrove
    // in questo funnel (vedi request-step-ui.tsx, successHeadingRef/errorRef).
    panelRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onDismiss();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onDismiss]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-end bg-eg-ink/70 p-3 md:place-items-center md:p-6"
      onClick={onDismiss}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={TITLE_ID}
        className="eg-panel w-full max-w-md p-5 focus:outline-none"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <p id={TITLE_ID} className="eg-h2 text-lg leading-7">
            Prima di andare, ci aiuti a migliorare?
          </p>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Chiudi"
            className="eg-button-ghost -mr-2 -mt-2 flex h-9 w-9 shrink-0 items-center justify-center px-0 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <p className="eg-body-muted mt-2 text-sm">
          Cosa ti ha fatto interrompere la richiesta?
        </p>

        <div className="mt-4 grid gap-2">
          {reasonOptions.map((option) => (
            <button
              key={option.reasonCode}
              type="button"
              onClick={() => {
                onSelectReason(option.reasonCode);
              }}
              className="eg-button-ghost min-h-11 justify-start px-4 text-left text-sm font-medium"
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="eg-form-help mt-4 w-full text-center underline"
        >
          Esci senza rispondere
        </button>
      </div>
    </div>
  );
}
