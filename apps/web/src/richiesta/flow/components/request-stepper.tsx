"use client";

import { useEffect, useRef, useState } from "react";

import type {
  RuntimeAnswers,
  RuntimeStepId,
} from "@esigenta/funnel";

import {
  countCompleteRuntimeAnswers,
  isRuntimeCapabilityAnswerComplete,
  NOTE_STEP_ID,
} from "@esigenta/funnel";

import {
  applyAttributionConsent,
  resolveFunnelAttribution,
} from "../../../site/analytics/funnel-attribution";
import {
  trackFunnelEventGa4,
  trackGenerateLead,
  trackGoogleAdsLeadConversion,
} from "../../../site/analytics/ga4-events";
// FASE 6E: unica lettura di consenso in questo file, e solo per decidere
// se allegare gclid/gbraid/wbraid a funnel_started (vedi applyAttributionConsent
// più sotto — CONSENT DECISION REQUIRED, report FASE 6E). Non gated
// dietro questo: funnel_started stesso, gli altri eventi funnel, il DB
// first-party, funnelSessionId — tutti restano indipendenti dal consenso
// come nelle fasi precedenti.
import { readCookieConsentPreferences } from "../../../site/shell/cookie-consent-storage";
import { RequestStepUI } from "./request-step-ui";
import {
  clearFunnelSessionId,
  resolveFunnelSessionId,
} from "./resolve-funnel-session-id";
import { trackFunnelEvent } from "./track-funnel-event";
import type {
  JsonRequestDraft,
  JsonRuntimeFunnelPayload,
} from "../runtime-payload";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const GOOGLE_ADS_CONVERSION_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
const GOOGLE_ADS_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;

// FASE 6D: stepKey fisso per submit_started/submit_failed — non uno step
// reale del funnel, un marker costante. stepIndex per questi due eventi
// non è un indice di step ma un contatore di TENTATIVI di submit (0-based,
// vedi submitAttemptCountRef più sotto): permette al vincolo di
// deduplicazione esistente (funnelSessionId+eventType+stepKey+stepIndex)
// di distinguere due tentativi realmente distinti — che devono restare
// entrambi visibili — da un doppio invio accidentale dello stesso
// tentativo, senza introdurre un secondo meccanismo di dedup.
const SUBMIT_STEP_KEY = "submit";

type RequestStepperProps = {
  payload: JsonRuntimeFunnelPayload;
  onReset: () => void;
};

type CreatedRequestPayload = {
  requestId: string;
  status: "PENDING_VERIFICATION";
  verificationEmailSent: boolean;
  verificationEmailProvider: "resend" | "console";
  interventionSlug: string;
  serviceGroupSlug: string | null;
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

function hasPhotoAnswer(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function hasCustomerDescription(value: string) {
  return value.trim().length > 0;
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

export function RequestStepper({
  payload,
  onReset,
}: RequestStepperProps) {
  const [answers, setAnswers] = useState<RuntimeAnswers>({});
  const [customerDescription, setCustomerDescription] = useState("");
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequest, setSubmittedRequest] =
    useState<SubmittedRequestPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [showLeadQualityHint, setShowLeadQualityHint] = useState(false);
  const [leadQualityHintDismissed, setLeadQualityHintDismissed] =
    useState(false);
  const generateLeadFiredRef = useRef(false);
  const googleAdsConversionFiredRef = useRef(false);
  // FASE 6D: 0-based, incrementato a ogni VERA chiamata di submitDraft()
  // (mai su un semplice re-render). Il bottone "Avanti"/"Prepara richiesta"
  // è già disabilitato durante isSubmitting, quindi due tentativi non
  // possono mai sovrapporsi — ogni valore è un tentativo di submit
  // realmente distinto.
  const submitAttemptCountRef = useRef(0);
  // FASE 6B: risolto una sola volta al mount (refresh/back/cambio step
  // riusano lo stesso id — vedi resolve-funnel-session-id.ts). Del tutto
  // indipendente dal consenso cookie: nessuna lettura di
  // site/shell/cookie-consent-storage qui, di proposito.
  const [funnelSessionId] = useState<string | null>(() =>
    resolveFunnelSessionId(payload.selectedIntervention.slug),
  );
  // FASE 6C: guardia client-side contro un doppio invio dello STESSO
  // evento logico (re-render, doppio click veloce su "Avanti", Strict Mode
  // in sviluppo) — un livello di difesa in più oltre al vincolo di
  // deduplicazione lato server (FunnelEvent.@@unique), non un sostituto.
  const trackedFunnelEventKeysRef = useRef<Set<string>>(new Set());

  function trackFunnelEventOnce(key: string, fire: () => void) {
    if (trackedFunnelEventKeysRef.current.has(key)) {
      return;
    }

    trackedFunnelEventKeysRef.current.add(key);
    fire();
  }

  const capabilities = payload.orderedCapabilities;
  const currentCapability = capabilities[stepIndex];
  const totalSteps = capabilities.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const filledAnswers = countCompleteRuntimeAnswers(answers);

  // funnel_started: una sola volta per mount (deps [] = solo al mount),
  // deduplicato anche lato server per funnelSessionId (refresh/back
  // rimontano RequestStepper con lo stesso id).
  useEffect(() => {
    trackFunnelEventOnce("funnel_started", () => {
      // FASE 6E: riletta qui, non prima — un attribution già catturata su
      // una pagina precedente (FunnelAttributionCapture, montato nel root
      // layout) sopravvive comunque in sessionStorage; se invece l'utente
      // è atterrato direttamente su /richiesta/[slug]?gclid=... senza mai
      // passare da un'altra pagina, resolveFunnelAttribution() la cattura
      // qui per la prima volta — nessuna dipendenza dall'ordine.
      const attribution = applyAttributionConsent(
        resolveFunnelAttribution(),
        readCookieConsentPreferences()?.marketing === true,
      );

      // DB first-party: sempre, indipendentemente dal consenso (FASE 6C)
      // — l'unico filtro applicato è quello già calcolato sopra su
      // gclid/gbraid/wbraid (mai su funnel_started in sé, mai sugli UTM).
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "funnel_started",
        ...attribution,
      });

      // Mirror GA4: solo se analytics===true, la guardia è tutta dentro
      // trackFunnelEventGa4 stessa (FASE 6C.1). Nessun campo attribution
      // inviato a GA4 in nessun caso — richiesto esplicitamente FASE 6E.
      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "funnel_started",
          intervention: payload.selectedIntervention.slug,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // step_viewed: ogni volta che lo step corrente cambia (avanti O
  // indietro) — mai per un semplice re-render che non cambia stepIndex,
  // perché l'effetto dipende solo da stepIndex (currentCapability è
  // interamente derivato da stepIndex a partire da `capabilities`, stabile
  // per tutta la compilazione).
  useEffect(() => {
    if (!currentCapability) {
      return;
    }

    trackFunnelEventOnce(`step_viewed:${currentCapability.id}:${stepIndex}`, () => {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "step_viewed",
        stepKey: currentCapability.id,
        stepIndex,
      });

      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "step_viewed",
          intervention: payload.selectedIntervention.slug,
          stepKey: currentCapability.id,
          stepIndex,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  function trackStepCompleted(capability: typeof currentCapability, index: number) {
    if (!capability) {
      return;
    }

    trackFunnelEventOnce(`step_completed:${capability.id}:${index}`, () => {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "step_completed",
        stepKey: capability.id,
        stepIndex: index,
      });

      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "step_completed",
          intervention: payload.selectedIntervention.slug,
          stepKey: capability.id,
          stepIndex: index,
        });
      }
    });
  }

  // FASE 6D: submit_started/submit_failed usano lo stesso trackFunnelEventOnce
  // degli altri eventi (difesa contro un doppio invio nello stesso tick),
  // ma con una chiave che include attemptIndex — quindi un VERO nuovo
  // tentativo (indice diverso) non viene mai soppresso, solo un
  // doppio-fire accidentale dello stesso tentativo lo sarebbe.
  function trackSubmitStarted(attemptIndex: number) {
    trackFunnelEventOnce(`submit_started:${attemptIndex}`, () => {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "submit_started",
        stepKey: SUBMIT_STEP_KEY,
        stepIndex: attemptIndex,
      });

      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "submit_started",
          intervention: payload.selectedIntervention.slug,
        });
      }
    });
  }

  function trackSubmitFailed(attemptIndex: number, errorCode: string) {
    trackFunnelEventOnce(`submit_failed:${attemptIndex}`, () => {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "submit_failed",
        stepKey: SUBMIT_STEP_KEY,
        stepIndex: attemptIndex,
        errorCode,
      });

      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "submit_failed",
          intervention: payload.selectedIntervention.slug,
          errorCode,
        });
      }
    });
  }

  function updateAnswer(capabilityId: RuntimeStepId, value: unknown) {
    setAnswers((current) => ({
      ...current,
      [capabilityId]: value,
    }));
    setError(null);

    if (capabilityId === "photos" && hasPhotoAnswer(value)) {
      setShowLeadQualityHint(false);
    }
  }

  function updateCustomerDescription(value: string) {
    setCustomerDescription(value);
    setError(null);

    if (hasCustomerDescription(value)) {
      setShowLeadQualityHint(false);
    }
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

    setShowLeadQualityHint(false);
    setStepIndex((current) => current - 1);
  }

  async function submitDraft() {
    setIsSubmitting(true);
    setError(null);

    // FASE 6D: catturato PRIMA di incrementare, così submit_started e un
    // eventuale submit_failed dello stesso tentativo condividono lo stesso
    // attemptIndex (stessa riga "tentativo" nel DB, eventType diverso).
    const attemptIndex = submitAttemptCountRef.current;
    submitAttemptCountRef.current += 1;

    trackSubmitStarted(attemptIndex);

    // Popolato in QUALUNQUE ramo di fallimento sotto, letto una sola volta
    // nel finally: garantisce esattamente un submit_failed per tentativo
    // fallito, mai zero, mai due (i due punti di fallimento — risposta
    // non-ok e catch — sono mutuamente esclusivi all'interno di un solo
    // submitDraft()).
    let submitFailureErrorCode: string | null = null;

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
          funnelSessionId,
        }),
      });

      const responseBody = (await response.json().catch(() => null)) as unknown;

      if (!response.ok) {
        const apiError = readRequestApiError(responseBody);

        console.warn("[request-stepper] Request submit failed", {
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

        // Categoria A (FASE 6D): codice applicativo reale se il server ne
        // ha restituito uno riconosciuto, altrimenti "unexpected_error" —
        // la normalizzazione/allow-list finale avviene comunque lato
        // server (packages/domain), questo è solo il valore di partenza.
        submitFailureErrorCode = apiError.code ?? "unexpected_error";

        return;
      }

      if (!isRecord(responseBody)) {
        throw new Error("Invalid request response");
      }

      const submitted = responseBody as SubmittedRequestPayload;

      setSubmittedRequest(submitted);

      // FASE 6B: la Request è già stata creata sul server a questo punto
      // (risposta 200 con un payload valido) — un nuovo tentativo dopo
      // questo non è più "la stessa compilazione", quindi il suo
      // funnelSessionId non deve essere riusato. Mai chiamato negli altri
      // rami (risposta non-ok, crash/rete, body non valido): lì la stessa
      // compilazione deve poter essere ritentata con lo stesso id.
      clearFunnelSessionId(payload.selectedIntervention.slug);

      // FASE 6D: mirror GA4-only di request_created. La riga DB
      // (server-authoritative) è già stata scritta dentro
      // createRequestFromDraft, PRIMA che questa risposta 200 arrivasse
      // qui — questa chiamata non scrive mai sul DB, solo su GA4, e solo
      // ora che la creazione è già confermata dal server. Nessun
      // funnelSessionId/requestId inviato a Google.
      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "request_created",
          intervention: submitted.request.interventionSlug,
        });
      }

      // Una richiesta realmente acquisita (transazione già committata sul
      // server, indipendentemente dall'esito dell'email di verifica) = al
      // massimo un generate_lead in questo browser. Il ref viene impostato
      // prima della chiamata Analytics stessa, non dopo: un doppio click è
      // già bloccato dal bottone disabilitato, questo copre re-render e
      // rimonti dello stepper sulla stessa risposta già elaborata.
      if (GA_MEASUREMENT_ID && !generateLeadFiredRef.current) {
        generateLeadFiredRef.current = true;

        trackGenerateLead(GA_MEASUREMENT_ID, {
          leadType: "customer_request",
          serviceGroup: submitted.request.serviceGroupSlug,
          intervention: submitted.request.interventionSlug,
        });
      }

      // Stessa garanzia del generate_lead sopra (ref impostato prima della
      // chiamata Analytics, non dopo), guardia indipendente perché il
      // consenso marketing (Ads) e analytics (GA4) possono differire: al
      // massimo una conversione Ads per questa risposta già committata dal
      // server, cioè al massimo una per requestId in questo browser.
      if (!googleAdsConversionFiredRef.current) {
        googleAdsConversionFiredRef.current = true;

        trackGoogleAdsLeadConversion({
          conversionId: GOOGLE_ADS_CONVERSION_ID,
          conversionLabel: GOOGLE_ADS_CONVERSION_LABEL,
          requestId: submitted.request.requestId,
        });
      }
    } catch (error) {
      console.warn("[request-stepper] Request submit crashed", {
        error: error instanceof Error ? error.message : String(error),
      });

      setError("Non siamo riusciti a contattare il server. Riprova tra poco.");

      // Categoria B (FASE 6D): copre sia un vero errore di rete/fetch sia
      // il throw "Invalid request response" qui sopra (200 ma body non
      // valido) — entrambi finiscono in questo stesso catch, ed entrambi
      // sono onestamente "un problema di rete/client", non un errore
      // applicativo noto né qualcosa di davvero inatteso lato dominio.
      submitFailureErrorCode = "network_error";
    } finally {
      // Esattamente un submit_failed per tentativo fallito: sul successo
      // submitFailureErrorCode resta null e questo non fa nulla.
      if (submitFailureErrorCode) {
        trackSubmitFailed(attemptIndex, submitFailureErrorCode);
      }

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

    if (
      currentCapability.id === NOTE_STEP_ID &&
      !leadQualityHintDismissed &&
      !hasPhotoAnswer(answers.photos) &&
      !hasCustomerDescription(customerDescription)
    ) {
      setShowLeadQualityHint(true);
      return;
    }

    // A questo punto lo step corrente ha superato ogni validazione — è
    // "completato" indipendentemente dal fatto che il prossimo passo sia
    // avanzare al successivo o inviare la richiesta (isLastStep).
    trackStepCompleted(currentCapability, stepIndex);

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
    <RequestStepUI
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
      onCustomerDescriptionChange={updateCustomerDescription}
      onPhotoUploadingChange={setIsPhotoUploading}
      leadQualityHintVisible={
        currentCapability.id === NOTE_STEP_ID && showLeadQualityHint
      }
      onAddLeadQualityDetails={() => {
        setShowLeadQualityHint(false);
      }}
      onContinueAfterLeadQualityHint={() => {
        // Bypassa goNext() (arriva dal bottone "Continua comunque" del
        // suggerimento lead quality): stesso punto concettuale di
        // completamento dello step "note", va tracciato qui perché
        // goNext() non viene mai chiamata in questo percorso.
        trackStepCompleted(currentCapability, stepIndex);
        setLeadQualityHintDismissed(true);
        setShowLeadQualityHint(false);
        setStepIndex((current) => Math.min(current + 1, totalSteps - 1));
      }}
      onNext={() => {
        void goNext();
      }}
      onReset={onReset}
    />
  );
}
