"use client"

import {
  useEffect,
  useState,
} from "react"
import Link from "next/link"

import {
  Button,
  cn,
  tokens,
} from "@esigenta/ui"

import {
  COOKIE_CONSENT_OPEN_EVENT,
  type CookieConsentCategory,
  type CookieConsentPreferences,
  createAcceptedCookieConsentPreferences,
  createDefaultCookieConsentPreferences,
  readCookieConsentPreferences,
  writeCookieConsentPreferences,
} from "./cookie-consent-storage"

const optionalCategories: Array<{
  id: Exclude<
    CookieConsentCategory,
    "necessary"
  >
  label: string
  description: string
}> = [
  {
    id: "functional",
    label: "Funzionali",
    description:
      "Abilitano servizi opzionali come i suggerimenti automatici di Google Maps.",
  },
  {
    id: "analytics",
    label: "Analytics",
    description:
      "Non sono attivi oggi. Se aggiunti, partiranno solo con consenso.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description:
      "Non sono attivi oggi. Nessuna profilazione pubblicitaria viene caricata.",
  },
]

type StoredConsentState =
  | "loading"
  | CookieConsentPreferences
  | null

export function CookieConsent() {
  const [storedConsent, setStoredConsent] =
    useState<StoredConsentState>("loading")
  const [draft, setDraft] =
    useState<CookieConsentPreferences>(
      createDefaultCookieConsentPreferences,
    )
  const [isPanelOpen, setIsPanelOpen] =
    useState(false)

  useEffect(() => {
    const initTimeout =
      window.setTimeout(() => {
        const saved =
          readCookieConsentPreferences()

        setStoredConsent(saved)
        setDraft(
          saved ??
            createDefaultCookieConsentPreferences(),
        )
      }, 0)

    function handleOpenPreferences() {
      const saved =
        readCookieConsentPreferences()
      const nextDraft =
        saved ??
        createDefaultCookieConsentPreferences()

      setStoredConsent(saved)
      setDraft(nextDraft)
      setIsPanelOpen(true)
    }

    window.addEventListener(
      COOKIE_CONSENT_OPEN_EVENT,
      handleOpenPreferences,
    )

    return () => {
      window.clearTimeout(initTimeout)
      window.removeEventListener(
        COOKIE_CONSENT_OPEN_EVENT,
        handleOpenPreferences,
      )
    }
  }, [])

  function persistConsent(
    preferences: CookieConsentPreferences,
  ) {
    writeCookieConsentPreferences(
      preferences,
    )
    setStoredConsent(preferences)
    setDraft(preferences)
    setIsPanelOpen(false)
  }

  function rejectOptional() {
    persistConsent(
      createDefaultCookieConsentPreferences(),
    )
  }

  function acceptAll() {
    persistConsent(
      createAcceptedCookieConsentPreferences(),
    )
  }

  function saveDraft() {
    persistConsent({
      ...draft,
      necessary: true,
    })
  }

  if (storedConsent === "loading") {
    return null
  }

  const shouldShowBanner =
    !storedConsent && !isPanelOpen

  return (
    <>
      {shouldShowBanner ? (
        <aside
          aria-label="Preferenze cookie"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-5xl border border-border-primary bg-surface-elevated p-4 shadow-xl md:bottom-5 md:p-5"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="text-sm font-semibold text-text-primary">
                Preferenze cookie
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Usiamo cookie tecnici necessari. I servizi facoltativi, come i
                suggerimenti automatici di Google Maps, partono solo se li
                abiliti. Puoi leggere la{" "}
                <Link
                  href="/cookie-policy"
                  className="font-medium text-brand-primary"
                 prefetch={false}>
                  cookie policy
                </Link>
                .
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 md:min-w-96">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={rejectOptional}
              >
                Rifiuta
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsPanelOpen(true)
                }}
              >
                Personalizza
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={acceptAll}
              >
                Accetta tutti
              </Button>
            </div>
          </div>
        </aside>
      ) : null}

      {isPanelOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-surface-footer/70 p-3 md:place-items-center md:p-6">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-preferences-title"
            className={cn(
              "max-h-[90vh] w-full max-w-2xl overflow-auto border border-border-primary bg-surface-elevated p-5",
              tokens.radius.lg,
              tokens.shadows.surface,
            )}
          >
            <div>
              <p
                id="cookie-preferences-title"
                className="text-lg font-semibold text-text-primary"
              >
                Preferenze cookie
              </p>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Le categorie facoltative non sono preselezionate. Puoi cambiare
                scelta in qualsiasi momento dal footer.
              </p>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="border border-border-primary bg-surface-primary p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-1"
                    aria-label="Cookie necessari sempre attivi"
                  />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Necessari
                    </p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">
                      Sempre attivi per sicurezza, sessioni e funzionamento
                      della piattaforma.
                    </p>
                  </div>
                </div>
              </div>

              {optionalCategories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-start gap-3 border border-border-primary bg-surface-primary p-4"
                >
                  <input
                    type="checkbox"
                    checked={draft[category.id]}
                    className="mt-1"
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        [category.id]:
                          event.target.checked,
                      }))
                    }}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-text-primary">
                      {category.label}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text-secondary">
                      {category.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-3">
              <Button
                type="button"
                variant="secondary"
                onClick={rejectOptional}
              >
                Rifiuta
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={saveDraft}
              >
                Salva preferenze
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={acceptAll}
              >
                Accetta tutti
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
