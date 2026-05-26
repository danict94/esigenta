"use client";

import { useState } from "react";

import type {
  RequestDraft,
  RuntimeAnswers,
  RuntimeCapabilityId,
  RuntimeFunnelPayload,
} from "@fixpro/db";

import {
  countCompleteRuntimeAnswers,
  isRuntimeCapabilityAnswerComplete,
} from "@fixpro/db/funnel-normalization";

import { FunnelUI } from "./funnel-ui";

type JsonRequestDraft = Omit<RequestDraft, "createdAt"> & {
  createdAt: string;
};

export type JsonRuntimeFunnelPayload = Omit<
  RuntimeFunnelPayload,
  "requestDraft"
> & {
  requestDraft: JsonRequestDraft;
};

type RuntimeFunnelProps = {
  payload: JsonRuntimeFunnelPayload;
  onReset: () => void;
};

type CreatedRequestPayload = {
  requestId: string;
  status: "PENDING_VERIFICATION";
  verificationEmailSent: boolean;
  verificationEmailProvider: "resend" | "console";
};

type SubmittedRequestPayload = {
  requestDraft: JsonRequestDraft;
  request: CreatedRequestPayload;
};

type RequestApiErrorPayload = {
  error?: string;
  code?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function readRequestApiError(value: unknown): RequestApiErrorPayload {
  if (!isRecord(value)) {
    return {};
  }

  return {
    error: typeof value.error === "string" ? value.error : undefined,
    code: typeof value.code === "string" ? value.code : undefined,
  };
}

function getRequestSubmitErrorMessage({
  code,
  status,
}: {
  code?: string;
  status: number;
}) {
  switch (code) {
    case "invalid_customer_email":
      return "Inserisci una email valida per confermare la richiesta.";

    case "invalid_customer_name":
      return "Inserisci nome e cognome per continuare.";

    case "invalid_customer_phone":
      return "Inserisci un numero di telefono valido.";

    case "invalid_request_location":
      return "Seleziona un indirizzo dai suggerimenti per continuare.";

    case "missing_intervention_slug":
    case "missing_intervention":
    case "intervention_not_found":
      return "Non abbiamo trovato l'intervento selezionato. Riprova dalla ricerca.";

    case "missing_required_services":
    case "invalid_required_services":
      return "Non siamo riusciti a collegare i servizi necessari. Riprova tra poco.";

    case "invalid_json_payload":
      return "La richiesta non e stata preparata correttamente. Riprova.";

    case "invalid_request_photos":
      return "Non siamo riusciti a verificare le foto caricate. Rimuovile o riprova il caricamento.";

    case "request_creation_failed":
      return "Non siamo riusciti a creare la richiesta. Riprova tra poco.";

    default:
      return status >= 500
        ? "Non siamo riusciti a creare la richiesta. Riprova tra poco."
        : "Controlla i dati inseriti e riprova.";
  }
}

export function RuntimeFunnel({
  payload,
  onReset,
}: RuntimeFunnelProps) {
  const [answers, setAnswers] = useState<RuntimeAnswers>({});
  const [customerDescription, setCustomerDescription] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] =
    useState<SubmittedRequestPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);

  const capabilities = payload.orderedCapabilities;
  const currentCapability = capabilities[stepIndex];
  const totalSteps = capabilities.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const filledAnswers = countCompleteRuntimeAnswers(answers);

  function updateAnswer(capabilityId: RuntimeCapabilityId, value: unknown) {
    setAnswers((current) => ({
      ...current,
      [capabilityId]: value,
    }));
    setError(null);
  }

  function goBack() {
    if (isPhotoUploading) {
      setError("Attendi il completamento del caricamento delle foto.");
      return;
    }

    if (stepIndex === 0) {
      onReset();
      return;
    }

    setStepIndex((current) => current - 1);
  }

  function editSubmittedRequest() {
    setSubmittedRequest(null);
    setStepIndex(0);
  }

  async function submitDraft() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interventionSlug: payload.selectedIntervention.slug,
          query: payload.originalQuery,
          answers,
          customerDescription,
        }),
      });

      const responseBody = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const apiError = readRequestApiError(responseBody);

        console.warn("[runtime-funnel] Request submit failed", {
          status: response.status,
          code: apiError.code,
          error: apiError.error,
        });

        setError(
          getRequestSubmitErrorMessage({
            code: apiError.code,
            status: response.status,
          }),
        );

        return;
      }

      if (!isRecord(responseBody)) {
        throw new Error("Invalid request response");
      }

      setSubmittedRequest(responseBody as SubmittedRequestPayload);
    } catch (error) {
      console.warn("[runtime-funnel] Request submit crashed", {
        error: error instanceof Error ? error.message : String(error),
      });

      setError("Non siamo riusciti a contattare il server. Riprova tra poco.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function goNext() {
    if (!currentCapability) {
      return;
    }

    const currentValue = answers[currentCapability.id];

    if (
      currentCapability.type === "photo_upload" &&
      isPhotoUploading
    ) {
      setError("Attendi il completamento del caricamento delle foto.");
      return;
    }

    if (
      !currentCapability.optional &&
      !isRuntimeCapabilityAnswerComplete(currentCapability, currentValue)
    ) {
      setError(
        currentCapability.type === "location"
          ? "Seleziona un indirizzo dai suggerimenti per continuare."
          : currentCapability.type === "contact"
            ? "Inserisci nome, cognome, telefono ed email per continuare."
            : "Completa questo passaggio per continuare.",
      );

      return;
    }

    if (isLastStep) {
      await submitDraft();
      return;
    }

    setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
  }

  if (!currentCapability) {
    return null;
  }

  return (
    <FunnelUI
      selectedInterventionName={payload.selectedIntervention.name}
      currentCapability={currentCapability}
      currentValue={answers[currentCapability.id]}
      customerDescription={customerDescription}
      error={error}
      filledAnswers={filledAnswers}
      isLastStep={isLastStep}
      isPhotoUploading={isPhotoUploading}
      isSubmitting={isSubmitting}
      stepIndex={stepIndex}
      submittedRequest={submittedRequest}
      totalSteps={totalSteps}
      onBack={goBack}
      onCapabilityChange={(value) => {
        updateAnswer(currentCapability.id, value);
      }}
      onCustomerDescriptionChange={setCustomerDescription}
      onPhotoUploadingChange={setIsPhotoUploading}
      onEditSubmittedRequest={editSubmittedRequest}
      onNext={() => {
        void goNext();
      }}
      onReset={onReset}
    />
  );
}
