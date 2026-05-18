'use client'

import {
  useMemo,
  useState,
} from 'react'

import {
  Button,
  Input,
  Textarea,
  cn,
  tokens,
} from '@fixpro/ui'

import type {
  RequestDraft,
  RuntimeCapability,
  RuntimeCapabilityId,
  RuntimeFunnelPayload,
} from '@fixpro/db'

import {
  CityAutocomplete,
  isLocationComplete,
} from '../location/city-autocomplete'

type RuntimeAnswers = Partial<
  Record<RuntimeCapabilityId, unknown>
>

type JsonRequestDraft = Omit<
  RequestDraft,
  'createdAt'
> & {
  createdAt: string
}

export type JsonRuntimeFunnelPayload = Omit<
  RuntimeFunnelPayload,
  'requestDraft'
> & {
  requestDraft: JsonRequestDraft
}

type RuntimeFunnelProps = {
  payload: JsonRuntimeFunnelPayload
  onReset: () => void
}

type CreatedRequestPayload = {
  requestId: string
  status: 'PENDING_VERIFICATION'
  verificationEmailSent: boolean
  verificationEmailProvider:
    | 'resend'
    | 'console'
}

type SubmittedRequestPayload = {
  requestDraft: JsonRequestDraft
  request: CreatedRequestPayload
}

type RequestApiErrorPayload = {
  error?: string
  code?: string
}

type ContactAnswer = {
  firstName?: string
  lastName?: string
  name?: string
  phone?: string
  email?: string
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value),
  )
}

function isFilled(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  if (typeof value === 'number') {
    return Number.isFinite(value)
  }

  return Boolean(value)
}

function readRequestApiError(
  value: unknown,
): RequestApiErrorPayload {
  if (!isRecord(value)) {
    return {}
  }

  return {
    error:
      typeof value.error === 'string'
        ? value.error
        : undefined,
    code:
      typeof value.code === 'string'
        ? value.code
        : undefined,
  }
}

function getRequestSubmitErrorMessage({
  code,
  status,
}: {
  code?: string
  status: number
}) {
  switch (code) {
    case 'invalid_customer_email':
      return 'Inserisci una email valida per confermare la richiesta.'

    case 'invalid_customer_name':
      return 'Inserisci nome e cognome per continuare.'

    case 'invalid_customer_phone':
      return 'Inserisci un numero di telefono valido.'

    case 'invalid_request_location':
      return 'Seleziona un indirizzo dai suggerimenti per continuare.'

    case 'missing_intervention_slug':
    case 'missing_intervention':
    case 'intervention_not_found':
      return 'Non abbiamo trovato l\'intervento selezionato. Riprova dalla ricerca.'

    case 'missing_required_services':
    case 'invalid_required_services':
      return 'Non siamo riusciti a collegare i servizi necessari. Riprova tra poco.'

    case 'invalid_json_payload':
      return 'La richiesta non e stata preparata correttamente. Riprova.'

    case 'request_creation_failed':
      return 'Non siamo riusciti a creare la richiesta. Riprova tra poco.'

    default:
      return status >= 500
        ? 'Non siamo riusciti a creare la richiesta. Riprova tra poco.'
        : 'Controlla i dati inseriti e riprova.'
  }
}

function splitLegacyName(
  value: string,
): {
  firstName?: string
  lastName?: string
} {
  const parts =
    value.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) {
    return {}
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
    }
  }

  return {
    firstName: parts[0],
    lastName:
      parts.slice(1).join(' '),
  }
}

function buildContactName({
  firstName,
  lastName,
}: {
  firstName?: string
  lastName?: string
}) {
  return [firstName, lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
}

function getContactAnswer(
  value: unknown,
): ContactAnswer {
  if (!isRecord(value)) {
    return {}
  }

  const legacyName =
    typeof value.name === 'string'
      ? value.name
      : ''

  const legacyParts =
    splitLegacyName(legacyName)

  const firstName =
    typeof value.firstName === 'string'
      ? value.firstName
      : typeof value.nome === 'string'
      ? value.nome
      : legacyParts.firstName ?? ''

  const lastName =
    typeof value.lastName === 'string'
      ? value.lastName
      : typeof value.cognome === 'string'
      ? value.cognome
      : legacyParts.lastName ?? ''

  const name =
    buildContactName({
      firstName,
      lastName,
    }) || legacyName

  return {
    firstName,
    lastName,
    name,
    phone:
      typeof value.phone === 'string'
        ? value.phone
        : '',
    email:
      typeof value.email === 'string'
        ? value.email
        : '',
  }
}

function isContactComplete(
  value: unknown,
) {
  const contact =
    getContactAnswer(value)
  const hasExplicitFirstName =
    isRecord(value) &&
    isFilled(value.firstName)
  const hasExplicitLastName =
    isRecord(value) &&
    isFilled(value.lastName)
  const hasStructuredName =
    isFilled(contact.firstName) &&
    isFilled(contact.lastName)
  const hasLegacyName =
    isRecord(value) &&
    !hasExplicitFirstName &&
    !hasExplicitLastName &&
    isFilled(value.name)

  return (
    (hasStructuredName || hasLegacyName) &&
    isFilled(contact.phone) &&
    isFilled(contact.email)
  )
}

function isCapabilityAnswerComplete(
  capability: RuntimeCapability,
  value: unknown,
) {
  if (capability.type === 'location') {
    return isLocationComplete(value)
  }

  if (capability.type === 'contact') {
    return isContactComplete(value)
  }

  return isFilled(value)
}

function getAnswerLabel(value: unknown) {
  if (Array.isArray(value)) {
    return `${value.length} file`
  }

  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return value ? 'Compilato' : 'Non compilato'
}

function countFilledAnswers(
  answers: RuntimeAnswers,
) {
  return Object.entries(answers).filter(
    ([capabilityId, value]) =>
      capabilityId === 'location'
        ? isLocationComplete(value)
        : capabilityId === 'contact'
        ? isContactComplete(value)
        : isFilled(value),
  ).length
}

function renderCapabilityInput({
  capability,
  value,
  onChange,
}: {
  capability: RuntimeCapability
  value: unknown
  onChange: (value: unknown) => void
}) {switch (capability.type) {
    case 'contact': {
      const contact =
        getContactAnswer(value)

      const fields: Array<{
        id: keyof ContactAnswer
        label: string
        type: 'text' | 'tel' | 'email'
        placeholder: string
        autoComplete: string
      }> = [
        {
          id: 'firstName',
          label: 'Nome',
          type: 'text',
          placeholder: 'Nome',
          autoComplete: 'given-name',
        },
        {
          id: 'lastName',
          label: 'Cognome',
          type: 'text',
          placeholder: 'Cognome',
          autoComplete: 'family-name',
        },
        {
          id: 'email',
          label: 'Email',
          type: 'email',
          placeholder: 'email@esempio.it',
          autoComplete: 'email',
        },
        {
          id: 'phone',
          label: 'Telefono',
          type: 'tel',
          placeholder: 'Numero di telefono',
          autoComplete: 'tel',
        },
      ]

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
                autoComplete={
                  field.autoComplete
                }
                value={
                  contact[field.id] ?? ''
                }
                onChange={(event) => {
                  const nextContact = {
                    ...contact,
                    [field.id]:
                      event.target.value,
                  }

                  onChange({
                    ...nextContact,
                    name:
                      buildContactName({
                        firstName:
                          nextContact.firstName,
                        lastName:
                          nextContact.lastName,
                      }) ||
                      nextContact.name,
                  })
                }}
                placeholder={
                  field.placeholder
                }
                    />
            </label>
          ))}
        </div>
      )
    }

    case 'location':
      return (
        <CityAutocomplete
          value={value}
          onChange={onChange}
        />
      )

    case 'single_select':
      return (
        <div className="grid gap-2 sm:grid-cols-2">
          {capability.options?.map(
            (option) => {
              const selected =
                value === option.value

              return (
                <Button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(
                      option.value,
                    )
                  }}
                  className={cn(
                    'min-h-12 border px-4 py-3 text-left text-sm transition-colors',
                    selected
                      ? 'border-brand-primary bg-surface-elevated text-text-primary'
                      : 'border-border-primary bg-surface-primary text-text-secondary hover:border-border-focus',
                  )}
                >{option.label}</Button>
              )
            },
          )}
        </div>
      )

    case 'number':
      return (
        <Input
          type="number"
          min="0"
          value={
            typeof value === 'number' ||
            typeof value === 'string'
              ? value
              : ''
          }
          onChange={(event) => {
            onChange(
              event.target.value,
            )
          }}
          placeholder="Inserisci una stima"
        />
      )

    case 'photo_upload':
      return (
        <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-border-primary bg-surface-primary px-4 py-6 text-center transition-colors hover:border-border-focus">
          <span className="text-sm font-medium text-text-primary">
            Aggiungi foto
          </span>

          <span className="text-xs text-text-muted">
            Puoi selezionare una o più immagini.
          </span>

          <input
            type="file"
            multiple
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const files = Array.from(
                event.target.files ?? [],
              ).map((file) => ({
                name: file.name,
                size: file.size,
              }))

              onChange(files)
            }}
          />

          {Array.isArray(value) &&
          value.length > 0 ? (
            <span className="text-xs text-text-secondary">
              {value.length} file selezionati
            </span>
          ) : null}
        </label>
      )

    case 'text':
      return (
        <Input
          value={
            typeof value === 'string'
              ? value
              : ''
          }
          onChange={(event) => {
            onChange(
              event.target.value,
            )
          }}
          placeholder="Scrivi qui"
        />
      )

    default:
      return (
        <Input
          value={
            typeof value === 'string'
              ? value
              : ''
          }
          onChange={(event) => {
            onChange(
              event.target.value,
            )
          }}
          placeholder="Scrivi qui"
        />
      )
  }
}

export function RuntimeFunnel({
  payload,
  onReset,
}: RuntimeFunnelProps) {
  const [answers, setAnswers] =
    useState<RuntimeAnswers>({})

  const [
    customerDescription,
    setCustomerDescription,
  ] = useState('')

  const [stepIndex, setStepIndex] =
    useState(0)

  const [error, setError] =
    useState<string | null>(null)

  const [
    submittedRequest,
    setSubmittedRequest,
  ] =
    useState<SubmittedRequestPayload | null>(
    null,
  )

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const capabilities =
    payload.orderedCapabilities

  const currentCapability =
    capabilities[stepIndex]

  const totalSteps =
    capabilities.length

  const isLastStep =
    stepIndex === totalSteps - 1

  const filledAnswers =
    countFilledAnswers(answers)

  const draftState =
    useMemo(() => {
      return {
        ...payload.requestDraft,
        rawAnswers: answers,
        ...(customerDescription.trim()
          ? {
              customerDescription:
                customerDescription.trim(),
            }
          : {}),
      }
    }, [
      answers,
      customerDescription,
      payload.requestDraft,
    ])

  function updateAnswer(
    capabilityId: RuntimeCapabilityId,
    value: unknown,
  ) {
    setAnswers((current) => ({
      ...current,
      [capabilityId]: value,
    }))
    setError(null)
  }

  async function submitDraft() {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        '/api/requests',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            interventionSlug:
              payload
                .selectedIntervention
                .slug,
            query:
              payload.originalQuery,
            answers,
            customerDescription,
          }),
        },
      )

      const responseBody =
        (await response
          .json()
          .catch(() => null)) as unknown

      if (!response.ok) {
        const apiError =
          readRequestApiError(
            responseBody,
          )

        console.warn(
          '[runtime-funnel] Request submit failed',
          {
            status: response.status,
            code: apiError.code,
            error: apiError.error,
          },
        )

        setError(
          getRequestSubmitErrorMessage(
            {
              code: apiError.code,
              status:
                response.status,
            },
          ),
        )

        return
      }

      if (!isRecord(responseBody)) {
        throw new Error(
          'Invalid request response',
        )
      }

      setSubmittedRequest(
        responseBody as SubmittedRequestPayload,
      )
    } catch (error) {
      console.warn(
        '[runtime-funnel] Request submit crashed',
        {
          error:
            error instanceof Error
              ? error.message
              : String(error),
        },
      )

      setError(
        'Non siamo riusciti a contattare il server. Riprova tra poco.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  async function goNext() {
    if (!currentCapability) {
      return
    }

    const currentValue =
      answers[currentCapability.id]

    if (
      !currentCapability.optional &&
      !isCapabilityAnswerComplete(
        currentCapability,
        currentValue,
      )
    ) {
      setError(
        currentCapability.type ===
          'location'
          ? 'Seleziona un indirizzo dai suggerimenti per continuare.'
          : currentCapability.type ===
          'contact'
          ? 'Inserisci nome, cognome, telefono ed email per continuare.'
          : 'Completa questo passaggio per continuare.',
      )

      return
    }

    if (isLastStep) {
      await submitDraft()

      return
    }

    setStepIndex((current) =>
      Math.min(
        current + 1,
        totalSteps - 1,
      ),
    )
  }

  if (!currentCapability) {
    return null
  }

  if (submittedRequest) {
    return (
      <div
        className={cn(
          'border border-border-primary bg-surface-elevated p-5 md:p-6',
          tokens.radius.lg,
          tokens.shadows.surface,
        )}
      >
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-primary">
              Controlla la tua email
            </p>

            <h2 className="text-xl font-semibold text-text-primary">
              Conferma la tua richiesta.
            </h2>

            <p className="text-sm leading-6 text-text-secondary">
              Ti abbiamo inviato un link per confermare la richiesta. Dopo la conferma andra in revisione.
            </p>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="border border-border-primary bg-surface-primary p-3">
              <span className="block text-xs text-text-muted">
                Intervento
              </span>
              <span className="text-text-primary">
                {
                  payload
                    .selectedIntervention
                    .name
                }
              </span>
            </div>

            <div className="border border-border-primary bg-surface-primary p-3">
              <span className="block text-xs text-text-muted">
                Servizi richiesti
              </span>
              <span className="text-text-primary">
                {
                  submittedRequest
                    .requestDraft
                    .matchingSignals
                    .requiredServiceSlugs
                    .length
                }
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={onReset}
            >
              Nuova richiesta
            </Button>

            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSubmittedRequest(null)
                setStepIndex(0)
              }}
            >
              Modifica risposte
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'border border-border-primary bg-surface-elevated p-5 md:p-6',
        tokens.radius.lg,
        tokens.shadows.surface,
      )}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3 text-xs text-text-muted">
            <span>
              Passaggio {stepIndex + 1} di {totalSteps}
            </span>

            <span>
              {filledAnswers} risposte raccolte
            </span>
          </div>

          <div className="h-1 w-full bg-surface-tertiary">
            <div
              className="h-full bg-brand-primary transition-all"
              style={{
                width: `${
                  ((stepIndex + 1) /
                    totalSteps) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-primary">
            {
              payload.selectedIntervention
                .name
            }
          </p>

          <h2 className="text-2xl font-semibold leading-tight text-text-primary">
            {currentCapability.question}
          </h2>

          {currentCapability.description ? (
            <p className="text-sm leading-6 text-text-secondary">
              {
                currentCapability.description
              }
            </p>
          ) : null}
        </div>

        {renderCapabilityInput({
          capability:
            currentCapability,
          value:
            answers[
              currentCapability.id
            ],
          onChange: (value) => {
            updateAnswer(
              currentCapability.id,
              value,
            )
          },
        })}

        {isLastStep ? (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary">
              Aggiungi qualche dettaglio utile
            </label>

            <Textarea
              value={
                customerDescription
              }
              onChange={(event) => {
                setCustomerDescription(
                  event.target.value,
                )
              }}
              rows={4}
              placeholder="Descrivi brevemente il lavoro, se vuoi." />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-brand-primary">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (stepIndex === 0) {
                onReset()
                return
              }

              setStepIndex(
                (current) =>
                  current - 1,
              )
            }}
            className="border-0 bg-transparent text-text-secondary hover:bg-transparent hover:text-text-primary"
          >
            {stepIndex === 0
              ? 'Cambia intervento'
              : 'Indietro'}
          </Button>

          <Button
            type="button"
            onClick={() => {
              void goNext()
            }}
            disabled={isSubmitting}
          >
            {isLastStep
              ? isSubmitting
                ? 'Preparazione...'
                : 'Prepara richiesta'
              : 'Continua'}
          </Button>
        </div>

        <div className="border-t border-border-primary pt-4 text-xs text-text-muted">
          Bozza runtime: {
            Object.keys(
              draftState.rawAnswers,
            ).length
          } risposte sincronizzate.
        </div>
      </div>
    </div>
  )
}



