"use client";

import { Button, Input, Textarea, cn, tokens } from "@fixpro/ui";

import type { RuntimeCapability } from "@fixpro/db/funnel";

import {
  readRuntimeContactAnswer,
  updateRuntimeContactAnswerField,
} from "@fixpro/db/funnel-normalization";

import type { RuntimeContactAnswerField } from "@fixpro/db/funnel-normalization";

import { CityAutocomplete } from "../location/city-autocomplete";
import { PhotoUploadStep } from "./photo-upload-step";

type FunnelSubmittedRequest = {
  requestDraft: {
    matchingSignals: {
      requiredServiceSlugs: string[];
    };
  };
};

type FunnelUIProps = {
  selectedInterventionName: string;
  currentCapability: RuntimeCapability;
  currentValue: unknown;
  customerDescription: string;
  error: string | null;
  filledAnswers: number;
  isLastStep: boolean;
  isPhotoUploading: boolean;
  isSubmitting: boolean;
  stepIndex: number;
  submittedRequest: FunnelSubmittedRequest | null;
  totalSteps: number;
  onBack: () => void;
  onCapabilityChange: (value: unknown) => void;
  onCustomerDescriptionChange: (value: string) => void;
  onPhotoUploadingChange: (isUploading: boolean) => void;
  onEditSubmittedRequest: () => void;
  onNext: () => void;
  onReset: () => void;
};

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
        <div className="grid gap-3">
          {fields.map((field) => (
            <label
              key={field.id}
              className="grid gap-2 text-sm font-medium text-text-primary"
            >
              <span>{field.label}</span>

              <Input
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
              />
            </label>
          ))}
        </div>
      );
    }

    case "location":
      return <CityAutocomplete value={value} onChange={onChange} />;

    case "single_select":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          {capability.options?.map((option) => {
            const selected = value === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant="ghost"
                onClick={() => {
                  onChange(option.value);
                }}
                className={cn(
                  "h-auto min-h-12 w-full justify-start whitespace-normal border px-4 py-3 text-left text-sm font-medium transition-colors",
                  tokens.radius.lg,
                  selected
                    ? "border-brand-primary bg-surface-secondary text-text-primary"
                    : "border-border-primary bg-surface-primary text-text-secondary hover:border-border-focus hover:bg-surface-secondary",
                )}
              >
                <span className="flex w-full items-center gap-3">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected
                        ? "border-brand-primary bg-brand-primary"
                        : "border-border-secondary bg-surface-elevated",
                    )}
                    aria-hidden="true"
                  >
                    {selected ? (
                      <span className="size-2 rounded-full bg-brand-on-primary" />
                    ) : null}
                  </span>

                  <span>{option.label}</span>
                </span>
              </Button>
            );
          })}
        </div>
      );

    case "number":
      return (
        <Input
          type="number"
          min="0"
          value={
            typeof value === "number" || typeof value === "string" ? value : ""
          }
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Inserisci una stima"
        />
      );

    case "photo_upload":
      return (
        <PhotoUploadStep
          value={value}
          onChange={onChange}
          onUploadingChange={onPhotoUploadingChange}
        />
      );

    case "text":
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Scrivi qui"
        />
      );

    default:
      return (
        <Input
          value={typeof value === "string" ? value : ""}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          placeholder="Scrivi qui"
        />
      );
  }
}

export function FunnelUI({
  selectedInterventionName,
  currentCapability,
  currentValue,
  customerDescription,
  error,
  filledAnswers,
  isLastStep,
  isPhotoUploading,
  isSubmitting,
  stepIndex,
  submittedRequest,
  totalSteps,
  onBack,
  onCapabilityChange,
  onCustomerDescriptionChange,
  onPhotoUploadingChange,
  onEditSubmittedRequest,
  onNext,
  onReset,
}: FunnelUIProps) {
  if (submittedRequest) {
    return (
      <div
        className={cn(
          "border border-border-primary bg-surface-elevated p-6 md:p-8",
          tokens.radius["3xl"],
          tokens.shadows.surface,
        )}
      >
        <div className="flex flex-col gap-7">
          <div className="flex flex-col items-center gap-4 text-center">
            <span
              className="flex size-14 items-center justify-center rounded-full bg-surface-secondary text-brand-primary"
              aria-hidden="true"
            >
              ✓
            </span>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-brand-primary">
                Richiesta preparata
              </p>

              <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                Grazie, la tua richiesta è quasi pronta
              </h2>

              <p className="mx-auto max-w-xl text-sm leading-6 text-text-secondary">
                Ti abbiamo inviato un link via email per confermare la
                richiesta e completare l’invio. Dopo la conferma, la richiesta
                passerà in revisione: controlleremo le informazioni e ti
                contatteremo se serviranno altri dettagli per aiutarti.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            <div
              className={cn(
                "border border-border-primary bg-surface-primary p-4",
                tokens.radius.lg,
              )}
            >
              <h3 className="text-sm font-semibold text-text-primary">
                Conferma via email
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Apri il link che ti abbiamo inviato per far arrivare
                correttamente la richiesta.
              </p>
            </div>

            <div
              className={cn(
                "border border-border-primary bg-surface-primary p-4",
                tokens.radius.lg,
              )}
            >
              <h3 className="text-sm font-semibold text-text-primary">
                Revisione della richiesta
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Dopo la conferma, verificheremo i dati principali. Se qualcosa
                non è chiaro, potremo contattarti per completare le informazioni.
              </p>
            </div>

            <div
              className={cn(
                "border border-border-primary bg-surface-primary p-4",
                tokens.radius.lg,
              )}
            >
              <h3 className="text-sm font-semibold text-text-primary">
                Controlla lo stato da “Le mie richieste”
              </h3>

              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Da “Le mie richieste” puoi accedere allo storico e seguire lo
                stato delle richieste inviate usando il link ricevuto via email.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button type="button" onClick={onReset}>
              Nuova richiesta
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={onEditSubmittedRequest}
            >
              Modifica risposte
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={tokens.funnel.step}>
      <p className="sr-only">
        {selectedInterventionName}. Passaggio {stepIndex + 1} di {totalSteps}.
        {filledAnswers} risposte raccolte.
      </p>

      <div className={tokens.funnel.stepHeader}>
        <div className={tokens.funnel.accent} aria-hidden="true" />

        <div className="space-y-4">
          <h2 className={tokens.funnel.stepTitle}>
            {currentCapability.question}
          </h2>

          {currentCapability.description ? (
            <p className={tokens.funnel.stepDescription}>
              {currentCapability.description}
            </p>
          ) : null}
        </div>
      </div>

      {renderCapabilityInput({
        capability: currentCapability,
        value: currentValue,
        onChange: onCapabilityChange,
        onPhotoUploadingChange,
      })}

      {isLastStep ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">
            Aggiungi qualche dettaglio utile
          </label>

          <Textarea
            value={customerDescription}
            onChange={(event) => {
              onCustomerDescriptionChange(event.target.value);
            }}
            rows={4}
            placeholder="Descrivi brevemente il lavoro, se vuoi."
          />
        </div>
      ) : null}

      {error ? <p className="text-sm text-brand-primary">{error}</p> : null}

      <div className={tokens.funnel.actions}>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={isPhotoUploading}
          className={tokens.funnel.actionButton}
        >
          Indietro
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          disabled={isSubmitting || isPhotoUploading}
          className={tokens.funnel.actionButton}
        >
          {isLastStep
            ? isSubmitting
              ? "Preparazione..."
              : "Prepara richiesta"
            : isPhotoUploading
              ? "Caricamento foto..."
              : "Avanti"}
        </Button>
      </div>
    </div>
  );
}
