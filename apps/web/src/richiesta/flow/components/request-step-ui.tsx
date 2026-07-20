"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import type { RuntimeCapability } from "@esigenta/funnel";

import {
  NOTE_STEP_ID,
  readRuntimeContactAnswer,
  updateRuntimeContactAnswerField,
} from "@esigenta/funnel";

import type { RuntimeContactAnswerField } from "@esigenta/funnel";

import type { GeoPlace } from "@esigenta/shared";

import { CityAutocomplete } from "../../../ui/location/city-autocomplete";
import { RequestPhotoUpload } from "./request-photo-upload";

type FunnelSubmittedRequest = {
  requestDraft: unknown;
  request: {
    verificationEmailSent: boolean;
  };
};

type RequestStepUIProps = {
  selectedInterventionName: string;
  currentCapability: RuntimeCapability;
  currentValue: unknown;
  customerDescription: string;
  error: string | null;
  filledAnswers: number;
  isLastStep: boolean;
  isPhotoUploading: boolean;
  isSubmitting: boolean;
  leadQualityHintVisible: boolean;
  stepIndex: number;
  submittedRequest: FunnelSubmittedRequest | null;
  totalSteps: number;
  onAddLeadQualityDetails: () => void;
  onBack: () => void;
  onCapabilityChange: (value: unknown) => void;
  onContinueAfterLeadQualityHint: () => void;
  onCustomerDescriptionChange: (value: string) => void;
  onPhotoUploadingChange: (isUploading: boolean) => void;
  onNext: () => void;
  onReset: () => void;
};

const inputClass =
  "w-full border-0 border-b border-eg-terra bg-transparent px-0 py-3 text-base text-eg-terra outline-none placeholder:text-eg-ardesia-2 focus:border-eg-cotto-dark";

const textareaClass =
  "min-h-36 w-full resize-y border-0 border-b border-eg-terra bg-transparent px-0 py-3 text-base leading-7 text-eg-terra outline-none placeholder:text-eg-ardesia-2 focus:border-eg-cotto-dark";

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function renderCapabilityInput({
  capability,
  value,
  onChange,
  onPhotoUploadingChange,
}: {
  capability: RuntimeCapability;
  value: unknown;
  onChange: (value: unknown) => void;
  onPhotoUploadingChange: (isUploading: boolean) => void;
}) {
  switch (capability.type) {
    case "contact": {
      const contact = readRuntimeContactAnswer(value);

      const fields: Array<{
        id: RuntimeContactAnswerField;
        label: string;
        type: "text" | "tel" | "email";
        placeholder: string;
        autoComplete: string;
      }> = [
        {
          id: "firstName",
          label: "Nome",
          type: "text",
          placeholder: "Nome",
          autoComplete: "given-name",
        },
        {
          id: "lastName",
          label: "Cognome",
          type: "text",
          placeholder: "Cognome",
          autoComplete: "family-name",
        },
        {
          id: "email",
          label: "Email",
          type: "email",
          placeholder: "email@esempio.it",
          autoComplete: "email",
        },
        {
          id: "phone",
          label: "Telefono",
          type: "tel",
          placeholder: "Numero di telefono",
          autoComplete: "tel",
        },
      ];

      return (
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <label key={field.id} className="eg-form-field">
              <span className="eg-form-label">{field.label}</span>

              <input
                type={field.type}
                autoComplete={field.autoComplete}
                value={contact[field.id] ?? ""}
                onChange={(event) => {
                  const nextContact = updateRuntimeContactAnswerField(
                    contact,
                    field.id,
                    event.target.value,
                  );

                  onChange(nextContact);
                }}
                placeholder={field.placeholder}
                className={inputClass}
              />
            </label>
          ))}
        </div>
      );
    }

    case "location":
      return (
        <CityAutocomplete
          value={value as GeoPlace | null}
          onChange={onChange}
        />
      );

    case "single_select":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {capability.options?.map((option) => {
            const selected = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                }}
                className={joinClasses(
                  "flex min-h-12 w-full items-center justify-start border px-4 py-3 text-left text-sm font-medium leading-6 transition-colors",
                  selected
                    ? "border-eg-cotto bg-eg-calce-2 text-eg-terra"
                    : "border-eg-hairline bg-eg-calce text-eg-ardesia hover:border-eg-cotto hover:text-eg-terra",
                )}
              >
                <span className="flex w-full items-center gap-3">
                  <span
                    className={joinClasses(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-eg-cotto bg-eg-cotto"
                        : "border-eg-hairline bg-eg-calce",
                    )}
                    aria-hidden="true"
                  >
                    {selected ? (
                      <span className="h-2 w-2 rounded-full bg-eg-calce" />
                    ) : null}
                  </span>

                  <span>{option.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      );

    case "multi_select": {
      const selectedValues = Array.isArray(value) ? (value as string[]) : [];

      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {capability.options?.map((option) => {
            const selected = selectedValues.includes(option.value);

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const next = selected
                    ? selectedValues.filter((item) => item !== option.value)
                    : [...selectedValues, option.value];

                  onChange(next);
                }}
                className={joinClasses(
                  "flex min-h-12 w-full items-center justify-start border px-4 py-3 text-left text-sm font-medium leading-6 transition-colors",
                  selected
                    ? "border-eg-cotto bg-eg-calce-2 text-eg-terra"
                    : "border-eg-hairline bg-eg-calce text-eg-ardesia hover:border-eg-cotto hover:text-eg-terra",
                )}
              >
                <span className="flex w-full items-center gap-3">
                  <span
                    className={joinClasses(
                      "flex h-5 w-5 shrink-0 items-center justify-center border text-[11px]",
                      selected
                        ? "border-eg-cotto bg-eg-cotto text-eg-calce"
                        : "border-eg-hairline bg-eg-calce text-transparent",
                    )}
                    aria-hidden="true"
                  >
                    {selected ? <span>&#10003;</span> : null}
                  </span>

                  <span>{option.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    case "number":
      return (
        <input
          type="number"
          min="0"
          value={
            typeof value === "number" || typeof value === "string" ? value : ""
          }
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Inserisci una stima"
          className={inputClass}
        />
      );

    case "photo_upload":
      return (
        <RequestPhotoUpload
          value={value}
          onChange={onChange}
          onUploadingChange={onPhotoUploadingChange}
        />
      );

    case "text":
      return (
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Scrivi qui"
          className={inputClass}
        />
      );

    default:
      return (
        <input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Scrivi qui"
          className={inputClass}
        />
      );
  }
}

function hasPhotoAnswer(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

export function RequestStepUI({
  selectedInterventionName,
  currentCapability,
  currentValue,
  customerDescription,
  error,
  filledAnswers,
  isLastStep,
  isPhotoUploading,
  isSubmitting,
  leadQualityHintVisible,
  stepIndex,
  submittedRequest,
  totalSteps,
  onAddLeadQualityDetails,
  onBack,
  onCapabilityChange,
  onContinueAfterLeadQualityHint,
  onCustomerDescriptionChange,
  onPhotoUploadingChange,
  onNext,
  onReset,
}: RequestStepUIProps) {
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (submittedRequest) {
      successHeadingRef.current?.focus();
    }
  }, [submittedRequest]);

  if (submittedRequest) {
    const verificationEmailSent = submittedRequest.request.verificationEmailSent;

    return (
      <div className="eg-panel mt-8 p-6 md:p-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-full bg-eg-calce-2 text-eg-cotto-dark"
              aria-hidden="true"
            >
              &#10003;
            </span>

            <div>
              <p className="eg-eyebrow">Richiesta</p>

              <h2
                ref={successHeadingRef}
                tabIndex={-1}
                className="eg-h2 mt-3 focus:outline-none"
              >
                {verificationEmailSent ? "Controlla la tua email" : "Richiesta salvata"}
              </h2>

              <p className="eg-body-muted mx-auto mt-4 max-w-xl">
                {verificationEmailSent ? (
                  <>
                    La richiesta &egrave; stata salvata. Apri l&apos;email
                    che ti abbiamo inviato e conferma il tuo indirizzo per
                    mandarla in revisione.
                  </>
                ) : (
                  <>
                    La richiesta &egrave; stata salvata. Al momento non siamo
                    riusciti a inviare l&apos;email di conferma. Non inviare
                    di nuovo la richiesta.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <button type="button" className="eg-button-primary" onClick={onReset}>
              Torna alla home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEmptyPhotoStep =
    currentCapability.type === "photo_upload" && !hasPhotoAnswer(currentValue);

  return (
    <div className="mt-8 flex flex-col gap-8">
      <p className="sr-only">
        Passaggio {stepIndex + 1} di {totalSteps}. {filledAnswers} risposte
        raccolte.
      </p>

      <div>
        <div className="w-full border border-eg-hairline bg-eg-calce-2 px-4 py-3 sm:w-fit sm:max-w-full">
          <p className="eg-eyebrow">Intervento selezionato</p>
          <p className="mt-1 break-words text-sm font-medium leading-6 text-eg-terra">
            {selectedInterventionName}
          </p>
        </div>

        <div className="mt-6 h-px w-20 bg-eg-cotto-dark" aria-hidden="true" />

        <div className="mt-6">
          <p className="eg-eyebrow">
            Passaggio {stepIndex + 1} di {totalSteps}
          </p>

          <h2 className="eg-h1 mt-4 max-w-[16ch]">
            {currentCapability.question}
          </h2>

          {currentCapability.description ? (
            <p className="eg-body-muted mt-5 max-w-[46ch] text-[17px] leading-8">
              {currentCapability.description}
            </p>
          ) : null}
        </div>
      </div>

      {currentCapability.id === NOTE_STEP_ID ? (
        <div className="grid gap-4">
          <textarea
            value={customerDescription}
            onChange={(event) => {
              onCustomerDescriptionChange(event.target.value);
            }}
            rows={4}
            placeholder={currentCapability.placeholder ?? "Scrivi qui, se vuoi."}
            className={textareaClass}
          />

          {leadQualityHintVisible ? (
            <div className="eg-panel p-4">
              <p className="eg-body-muted">
                Le richieste con foto o qualche dettaglio ricevono preventivi
                pi&ugrave; precisi.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="eg-button-primary"
                  onClick={onAddLeadQualityDetails}
                >
                  Aggiungi dettagli
                </button>

                <button
                  type="button"
                  className="eg-button-ghost"
                  onClick={onContinueAfterLeadQualityHint}
                >
                  Continua comunque
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        renderCapabilityInput({
          capability: currentCapability,
          value: currentValue,
          onChange: onCapabilityChange,
          onPhotoUploadingChange,
        })
      )}

      {error ? <p className="text-sm text-eg-cotto-dark">{error}</p> : null}

      {isLastStep ? (
        <p className="eg-form-help">
          Inviando la richiesta confermi di aver letto l&apos;
          <Link href="/privacy" className="font-medium text-eg-cotto-dark" prefetch={false}>
            informativa privacy
          </Link>{" "}
          e accetti i{" "}
          <Link href="/termini" className="font-medium text-eg-cotto-dark" prefetch={false}>
            termini del servizio
          </Link>
          .
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isPhotoUploading}
          className="eg-button-ghost min-w-40 disabled:pointer-events-none disabled:opacity-50"
        >
          Indietro
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isSubmitting || isPhotoUploading}
          className="eg-button-primary min-w-40 disabled:pointer-events-none disabled:opacity-50"
        >
          {isLastStep
            ? isSubmitting
              ? "Preparazione..."
              : "Prepara richiesta"
            : isPhotoUploading
              ? "Caricamento foto..."
              : isEmptyPhotoStep
                ? "Continua senza foto"
                : "Avanti"}
        </button>
      </div>
    </div>
  );
}
