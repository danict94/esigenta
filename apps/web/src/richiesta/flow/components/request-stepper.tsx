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

import type { FunnelAttributionResolution } from "../../../site/analytics/funnel-attribution";
import { resolveFunnelStartedAttribution } from "../../../site/analytics/funnel-attribution";
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
import { useRegisterFunnelExitGuard } from "../../../site/shell/funnel-exit-guard";
import { FunnelExitFeedbackModal } from "./funnel-exit-feedback-modal";
import { resolveExitFeedbackReasonOptions } from "./resolve-exit-feedback-reason-options";
import { RequestStepUI } from "./request-step-ui";
import {
  clearFunnelSessionId,
  resolveFunnelSessionId,
} from "./resolve-funnel-session-id";
import { trackFunnelEvent } from "./track-funnel-event";
import type { FunnelExitFeedbackReasonCode } from "./track-funnel-event";
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

// FASE 7 FINAL (§D2): un valore generoso, non aggressivo — la risposta di
// POST /api/requests include, sincronamente, l'invio dell'email di
// verifica (vedi createRequestFromDraft), quindi un tempo di risposta di
// alcuni secondi è normale, non un sintomo di problema. Questo timeout
// serve solo a evitare uno spinner attivo per un tempo indeterminato se
// il server non risponde affatto (vedi FASE 7A, LOW "nessun timeout
// esplicito submit/upload") — mai a interrompere un submit che sta
// semplicemente impiegando qualche secondo in più del solito.
//
// Sicuro da introdurre solo ORA, dopo la FASE 7B: un abort qui non
// implica che il server non abbia creato la Request — semplicemente non
// lo sappiamo — e un retry successivo continua a usare lo stesso
// funnelSessionId (mai ripulito su questo ramo, vedi submitDraft più
// sotto), quindi il fast-path/P2002 recovery della FASE 7B lo riconosce
// come lo stesso tentativo invece di crearne uno duplicato.
const SUBMIT_TIMEOUT_MS = 25_000;

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
      return "Inserisci un indirizzo email valido per confermare la richiesta.";

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
      return "La richiesta non è stata preparata correttamente. Riprova.";

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
  // FASE 9J: modal di uscita dal funnel — "al massimo una volta per
  // funnelSessionId". Un semplice ref in-memory (non sessionStorage/DB),
  // stesso identico principio già usato per generateLeadFiredRef/
  // googleAdsConversionFiredRef sopra: il vincolo è scoped al ciclo di
  // vita di QUESTO mount di RequestStepper, mai persistito oltre — un
  // refresh dopo aver già visto il modal potrebbe in teoria mostrarlo di
  // nuovo, ma è esattamente lo stesso trade-off già accettato per ogni
  // altro guard client-side in questo file. Se l'utente sceglie un vero
  // motivo, il vincolo "al più un exit_feedback_submitted per sessione"
  // resta comunque garantito a livello DB dall'indice unico parziale
  // esistente (vedi schema.prisma) — non toccato da questa fase.
  const hasShownExitFeedbackModalRef = useRef(false);
  // Cosa fare quando il modal si risolve con un'uscita reale (motivo
  // scelto oppure "Esci senza rispondere") — mai richiamata se l'utente
  // chiude il modal senza scegliere (vedi handleExitFeedbackDismiss).
  const pendingExitActionRef = useRef<(() => void) | null>(null);
  const [isExitFeedbackModalOpen, setIsExitFeedbackModalOpen] = useState(false);

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

  // funnel_opened (FASE 9A, rinominato da funnel_started): una sola volta
  // per mount (deps [] = solo al mount), deduplicato anche lato server per
  // funnelSessionId (refresh/back rimontano RequestStepper con lo stesso
  // id). Segna SOLO che il funnel è stato aperto — non richiede alcuna
  // interazione dell'utente. Per la prima vera interazione (modifica di
  // una risposta) vedi trackFunnelStarted più sotto, chiamata da
  // updateAnswer/updateCustomerDescription.
  useEffect(() => {
    trackFunnelEventOnce("funnel_opened", () => {
      // FASE 6E: riletta qui, non prima — un attribution già catturata su
      // una pagina precedente (FunnelAttributionCapture, montato nel root
      // layout) sopravvive comunque in sessionStorage; se invece l'utente
      // è atterrato direttamente su /richiesta/[slug]?gclid=... senza mai
      // passare da un'altra pagina, resolveFunnelAttribution() la cattura
      // qui per la prima volta — nessuna dipendenza dall'ordine.
      //
      // FASE 7D: isolata di proposito in un try/catch. Un fallimento
      // nella risoluzione dell'attribution (o nella lettura del consenso
      // qui sopra) deve poter costare SOLO i campi attribution — mai
      // l'intero evento funnel_opened (FASE 9A: rinominato da
      // funnel_started), che va comunque inviato subito sotto.
      // resolveFunnelStartedAttribution ha già un proprio
      // try/catch interno (vedi funnel-attribution.ts); questo è un
      // secondo livello che copre anche la lettura del consenso stesso.
      //
      // FASE 7E: il fallback del catch qui sotto usa status "unknown" di
      // proposito — se anche solo LEGGERE il consenso lancia, non sappiamo
      // davvero se ci fosse attribution da determinare, esattamente come
      // quando resolveFunnelStartedAttribution stessa fallisce al suo
      // interno.
      let resolution: FunnelAttributionResolution = {
        status: "unknown",
        attribution: null,
      };

      try {
        resolution = resolveFunnelStartedAttribution(
          readCookieConsentPreferences()?.marketing === true,
        );
      } catch {
        resolution = { status: "unknown", attribution: null };
      }

      // DB first-party: sempre, indipendentemente dal consenso (FASE 6C)
      // — l'unico filtro applicato è quello già calcolato sopra su
      // gclid/gbraid/wbraid (mai su funnel_opened in sé, mai sugli UTM).
      // attributionStatus (FASE 7E) distingue "risolta, magari vuota" da
      // "non determinabile" — vedi funnel-attribution.ts.
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "funnel_opened",
        attributionStatus: resolution.status,
        ...resolution.attribution,
      });

      // Mirror GA4: solo se analytics===true, la guardia è tutta dentro
      // trackFunnelEventGa4 stessa (FASE 6C.1). Nessun campo attribution
      // inviato a GA4 in nessun caso — richiesto esplicitamente FASE 6E.
      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "funnel_opened",
          intervention: payload.selectedIntervention.slug,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FASE 9A: funnel_started ridefinito — non più il mount (vedi
  // funnel_opened sopra), ma la PRIMA vera modifica/selezione di una
  // risposta da parte dell'utente. Punto centralizzato unico: chiamata
  // solo da updateAnswer e updateCustomerDescription più sotto, i soli due
  // punti in questo componente in cui un valore di risposta cambia per
  // un'azione reale dell'utente (click su un'opzione, digitazione,
  // selezione di un indirizzo, caricamento di una foto, rimozione di una
  // foto) — mai per mount, focus, scroll, o step_viewed. trackFunnelEventOnce
  // garantisce l'idempotenza lato client (stesso meccanismo già usato per
  // funnel_opened/step_viewed/ecc.); il vincolo di dedup lato DB
  // (funnelSessionId+eventType+stepKey+stepIndex, sentinel "at most once
  // per funnelSessionId" — vedi FUNNEL_EVENT_STEP_SENTINEL_KEY/INDEX)
  // garantisce che non possa mai comparire più di una riga
  // funnel_started per sessione, anche in caso di remount.
  function trackFunnelStarted() {
    trackFunnelEventOnce("funnel_started", () => {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "funnel_started",
      });

      if (GA_MEASUREMENT_ID) {
        trackFunnelEventGa4(GA_MEASUREMENT_ID, {
          eventType: "funnel_started",
          intervention: payload.selectedIntervention.slug,
        });
      }
    });
  }

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

  // FASE 9E: registra un tentativo esplicito di "Avanti"/"Prepara
  // richiesta" bloccato dalla validazione dello step corrente — mai
  // mentre l'utente digita/seleziona (questa funzione è chiamata SOLO da
  // goNext, mai da onChange/onCustomerDescriptionChange). Nessun valore
  // inserito, codice di errore o testo libero: solo funnelSessionId/
  // stepKey/stepIndex, esattamente come step_viewed/step_completed.
  //
  // Idempotenza: chiave "per step" (capability.id + index), NON per
  // singolo click — un secondo click sullo stesso step ancora invalido
  // non produce un secondo evento (né lato client, via
  // trackFunnelEventOnce, né lato server, grazie al vincolo di dedup
  // esistente su FunnelEvent). Scelta deliberata: senza alcun dettaglio
  // su COSA sia invalido (per design, vedi sopra), un secondo tentativo
  // identico sullo stesso step non aggiunge informazione — solo "quante
  // sessioni sono rimaste bloccate da questo step almeno una volta" è
  // utile, mai "quante volte hanno premuto il bottone". Se l'utente torna
  // più tardi allo stesso step (stessa capability.id, stesso index) dopo
  // essere avanzato e tornato indietro, la chiave coincide di nuovo e
  // l'evento resta deduplicato — coerente con "un solo evento per step
  // per sessione", non "per visita allo step".
  function trackClientValidationFailed(
    capability: typeof currentCapability,
    index: number,
  ) {
    if (!capability) {
      return;
    }

    trackFunnelEventOnce(`client_validation_failed:${capability.id}:${index}`, () => {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "client_validation_failed",
        stepKey: capability.id,
        stepIndex: index,
      });
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
    trackFunnelStarted();

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
    trackFunnelStarted();

    setCustomerDescription(value);
    setError(null);

    if (hasCustomerDescription(value)) {
      setShowLeadQualityHint(false);
    }
  }

  // FASE 9J — unico punto che decide se un'uscita "controllabile" (bottone
  // Indietro dallo step 0, logo, link della navbar — MAI browser
  // back/refresh/chiusura tab/navigazione esterna, che restano fuori
  // dalla portata del nostro codice) deve mostrare il modal oppure
  // lasciar proseguire subito. `proceed` è la navigazione che avrebbe
  // avuto luogo comunque (onReset per il bottone Indietro, router.push
  // per Navbar — vedi funnel-exit-guard.tsx).
  //
  // Non intercetta MAI (ritorna false, il chiamante deve navigare subito)
  // se: la richiesta è già stata creata (schermata post-conversione — non
  // ha senso chiedere "perché stai uscendo" a chi ha appena convertito),
  // oppure il modal è già stato mostrato una volta in questo mount.
  function attemptControlledExit(proceed: () => void): boolean {
    if (submittedRequest) {
      return false;
    }

    if (hasShownExitFeedbackModalRef.current) {
      return false;
    }

    hasShownExitFeedbackModalRef.current = true;
    pendingExitActionRef.current = proceed;
    setIsExitFeedbackModalOpen(true);

    return true;
  }

  // Registra questo handler per la Navbar (logo + link) — vedi
  // funnel-exit-guard.tsx. Ri-registrato ad ogni render con la chiusura
  // più recente (submittedRequest/hasShownExitFeedbackModalRef aggiornati),
  // costo trascurabile (scrittura di un ref, nessun re-render).
  useRegisterFunnelExitGuard(attemptControlledExit);

  function handleExitFeedbackReasonSelected(reasonCode: FunnelExitFeedbackReasonCode) {
    // FASE 9J: registra exit_feedback_submitted usando il tracking già
    // predisposto (stessa trackFunnelEvent fire-and-forget di ogni altro
    // evento in questo file — vedi track-funnel-event.ts: non blocca mai
    // l'uscita, il fetch non viene mai atteso). currentCapability/stepIndex
    // sono quelli dello step su cui l'utente si trovava quando ha aperto
    // il modal — invariati mentre il modal è aperto (nessun'altra
    // interazione possibile sotto l'overlay).
    if (currentCapability) {
      trackFunnelEvent({
        funnelSessionId,
        interventionSlug: payload.selectedIntervention.slug,
        eventType: "exit_feedback_submitted",
        stepKey: currentCapability.id,
        stepIndex,
        reasonCode,
      });
    }

    setIsExitFeedbackModalOpen(false);
    pendingExitActionRef.current?.();
    pendingExitActionRef.current = null;
  }

  function handleExitFeedbackSkip() {
    // "Esci senza rispondere": esce SUBITO, nessun exit_feedback_submitted.
    setIsExitFeedbackModalOpen(false);
    pendingExitActionRef.current?.();
    pendingExitActionRef.current = null;
  }

  function handleExitFeedbackDismiss() {
    // Chiuso senza scegliere (X, backdrop, Esc): resta nel funnel — la
    // navigazione che l'aveva aperto viene semplicemente abbandonata.
    setIsExitFeedbackModalOpen(false);
    pendingExitActionRef.current = null;
  }

  function goBack() {
    if (isPhotoUploading) {
      setError("Attendi il completamento del caricamento delle foto.");
      return;
    }

    if (stepIndex === 0) {
      // FASE 9J fix: attemptControlledExit ritorna false quando NON deve
      // intercettare (già mostrato una volta, o post-conversione) — in tal
      // caso il chiamante deve eseguire subito la navigazione originaria,
      // esattamente come già fa Navbar (funnel-exit-guard.tsx). Prima di
      // questo fix il valore di ritorno veniva ignorato: un secondo
      // tentativo di uscita dopo aver già chiuso il modal (X/Esc/backdrop)
      // non richiamava mai onReset, lasciando l'utente bloccato sullo
      // step 0 senza alcun feedback.
      if (!attemptControlledExit(onReset)) {
        onReset();
      }

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

    // FASE 7 FINAL (§D2): il timer viene sempre ripulito nel finally più
    // sotto, sia che scada sia che il fetch finisca prima — mai un timer
    // residuo tra un tentativo e l'altro.
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, SUBMIT_TIMEOUT_MS);

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
        signal: abortController.signal,
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
      clearTimeout(timeoutId);

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
          ? "Seleziona un indirizzo dai suggerimenti, oppure conferma la località trovata, per continuare."
          : currentCapability.type === "contact"
            ? "Inserisci nome, cognome, telefono ed email per continuare."
            : "Completa questo passaggio per continuare.",
      );

      // FASE 9E: tentativo esplicito di avanzare, bloccato dalla
      // validazione — vedi trackClientValidationFailed sopra per cosa
      // viene registrato e perché. Il ramo "foto in caricamento" sopra
      // NON chiama questa funzione di proposito: non è una risposta
      // invalida, è un'attesa temporanea che si risolve da sola.
      trackClientValidationFailed(currentCapability, stepIndex);

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
    <>
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

      {/* FASE 9J: montato solo se isExitFeedbackModalOpen — vedi
          attemptControlledExit. reasonOptions ricalcolate ad ogni render
          da currentCapability/stepIndex (invariati mentre il modal è
          aperto), mai da cosa l'utente ha già scelto. */}
      <FunnelExitFeedbackModal
        open={isExitFeedbackModalOpen}
        reasonOptions={resolveExitFeedbackReasonOptions(currentCapability, stepIndex)}
        onSelectReason={handleExitFeedbackReasonSelected}
        onSkip={handleExitFeedbackSkip}
        onDismiss={handleExitFeedbackDismiss}
      />
    </>
  );
}
