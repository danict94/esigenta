"use client"

import { type FormEvent, useState, } from "react"
import Link from "next/link"
import {
  useRouter, } from "next/navigation"

import {
  Button, Input, Select, cn } from "@esigenta/ui";

import {
  type GeoPlace,
} from "@esigenta/shared"

import {
  authClient,
} from "../../../../auth/client"

import {
  completeCompanyOnboardingAction,
} from "../actions/signup-action"

type ImpresaSignupFormProps = {
  categorySlug?: string
  geoPlace: GeoPlace | null
  hasValidLeadLocation: boolean
}

type SignupStep =
  | "company"
  | "account"

const operatingRadiusOptions = [
  10,
  20,
  30,
  50,
  75,
  100,
] as const

function hasText(value: string) {
  return Boolean(value.trim())
}

export function ImpresaSignupForm({
  categorySlug,
  geoPlace,
  hasValidLeadLocation,
}: ImpresaSignupFormProps) {
  const router =
    useRouter()

  const [step, setStep] =
    useState<SignupStep>("company")

  const [companyName, setCompanyName] =
    useState("")
  const [vatNumber, setVatNumber] =
    useState("")
  const [phone, setPhone] =
    useState("")
  const [
    operatingRadiusKm,
    setOperatingRadiusKm,
  ] = useState(30)

  const [name, setName] =
    useState("")
  const [email, setEmail] =
    useState("")
  const [password, setPassword] =
    useState("")
  const [
    hasAcceptedLegalTerms,
    setHasAcceptedLegalTerms,
  ] = useState(false)

  const [error, setError] =
    useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  function validateCompanyStep() {
    if (!hasValidLeadLocation) {
      return "Seleziona prima la città dalla pagina professionisti."
    }

    if (!categorySlug) {
      return "Seleziona prima la categoria professionale dalla pagina professionisti."
    }

    if (!hasText(companyName)) {
      return "Inserisci il nome azienda."
    }

    if (!hasText(vatNumber)) {
      return "Inserisci la partita IVA."
    }

    if (!hasText(phone)) {
      return "Inserisci il numero di telefono."
    }

    return null
  }

  function validateAccountStep() {
    if (!hasText(name)) {
      return "Inserisci il nome referente."
    }

    if (!hasText(email)) {
      return "Inserisci l’email."
    }

    if (password.length < 8) {
      return "La password deve contenere almeno 8 caratteri."
    }

    if (!hasAcceptedLegalTerms) {
      return "Accetta termini e informativa privacy per continuare."
    }

    return null
  }

  function handleContinue() {
    const validationError =
      validateCompanyStep()

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setStep("account")
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const companyStepError =
      validateCompanyStep()

    if (companyStepError) {
      setError(companyStepError)
      setStep("company")
      return
    }

    const accountStepError =
      validateAccountStep()

    if (accountStepError) {
      setError(accountStepError)
      setStep("account")
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      const signupResult =
        await authClient.signUp.email({
          name,
          email,
          password,
        })

      if (signupResult.error) {
        setError(
          signupResult.error.message ||
            "Non è stato possibile creare l’account.",
        )

        return
      }

      if (!geoPlace) {
        setError(
          "Seleziona prima la città dalla pagina professionisti.",
        )
        return
      }

      const onboardingResult =
        await completeCompanyOnboardingAction({
          name: companyName,
          vatNumber,
          phone,
          categorySlug,
          operatingRadiusKm,
          geoPlace,
        })

      if (!onboardingResult.ok) {
        setError(
          onboardingResult.message ||
            "Accesso creato, ma non è stato possibile completare il profilo azienda.",
        )
        return
      }

      await authClient.signOut()
      router.replace(
        "/area-impresa/accedi?registered=1",
      )
      router.refresh()
    } catch {
      setError(
        "Impossibile completare l’iscrizione. Riprova tra poco.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-3 pb-1">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
              step === "company"
                ? "bg-cantiere-accent text-cantiere-paper"
                : "border border-cantiere-hairline text-cantiere-ink-secondary",
            )}
          >
            1
          </span>

          <span
            className={cn(
              "text-[14px] font-medium",
              step === "company"
                ? "text-cantiere-ink"
                : "text-cantiere-ink-secondary",
            )}
          >
            Dati azienda
          </span>
        </span>

        <span className="h-px flex-1 bg-cantiere-hairline" />

        <span className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-6 items-center justify-center rounded-full text-[12px] font-medium transition-colors",
              step === "account"
                ? "bg-cantiere-accent text-cantiere-paper"
                : "border border-cantiere-hairline text-cantiere-ink-secondary",
            )}
          >
            2
          </span>

          <span
            className={cn(
              "text-[14px] font-medium",
              step === "account"
                ? "text-cantiere-ink"
                : "text-cantiere-ink-secondary",
            )}
          >
            Accesso
          </span>
        </span>
      </div>

      {step === "company" ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-cantiere-ink">
              Dati azienda
            </h2>

            <p className="mt-1 text-sm leading-5 text-cantiere-ink-secondary">
              Inserisci le informazioni principali della tua impresa.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="companyName"
              className="text-sm font-medium text-cantiere-ink"
            >
              Nome azienda
            </label>

            <Input
              id="companyName"
              type="text"
              autoComplete="organization"
              required
              value={companyName}
              onChange={(event) =>
                setCompanyName(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="vatNumber"
              className="text-sm font-medium text-cantiere-ink"
            >
              Partita IVA
            </label>

            <Input
              id="vatNumber"
              type="text"
              autoComplete="off"
              required
              value={vatNumber}
              onChange={(event) =>
                setVatNumber(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-cantiere-ink"
            >
              Numero di telefono
            </label>

            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value,
                )
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="operatingRadiusKm"
              className="text-sm font-medium text-cantiere-ink"
            >
              Raggio d’azione
            </label>

            <Select
              id="operatingRadiusKm"
              required
              value={operatingRadiusKm}
              onChange={(event) =>
                setOperatingRadiusKm(
                  Number(event.target.value),
                )
              }
            >
              {operatingRadiusOptions.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option} km
                  </option>
                ),
              )}
            </Select>

            <p className={"text-sm text-cantiere-ink-secondary"}>
              Il raggio sarà calcolato dalla città selezionata nel passaggio
              precedente. Potrai modificarlo più avanti.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-cantiere-ink">
              Referente e accesso
            </h2>

            <p className="mt-1 text-sm leading-5 text-cantiere-ink-secondary">
              Inserisci i dati della persona che gestirà l’area impresa.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-cantiere-ink"
            >
              Nome referente
            </label>

            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-cantiere-ink"
            >
              Email
            </label>

            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-cantiere-ink"
            >
              Password
            </label>

            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
            />
          </div>

          <label className="flex items-start gap-3 text-sm leading-6 text-cantiere-ink-secondary">
            <input
              type="checkbox"
              required
              checked={hasAcceptedLegalTerms}
              className="mt-1"
              onChange={(event) => {
                setHasAcceptedLegalTerms(
                  event.target.checked,
                )
              }}
            />
            <span>
              Ho letto l&apos;
              <Link
                href="/privacy"
                className="font-medium text-cantiere-accent"
              >
                informativa privacy
              </Link>{" "}
              e accetto i{" "}
              <Link
                href="/termini"
                className="font-medium text-cantiere-accent"
              >
                termini del servizio
              </Link>
              .
            </span>
          </label>
        </div>
      )}

      {error ? (
        <p
          className={cn(
            "border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm text-cantiere-ink",
            "rounded-[6px]",
          )}
        >
          {error}
        </p>
      ) : null}

      {step === "company" ? (
        <Button
          type="button"
          className="w-full"
          onClick={handleContinue}
        >
          Continua
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting
              ? "Creazione in corso..."
              : "Crea accesso impresa"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setError(null)
              setStep("company")
            }}
          >
            Indietro
          </Button>
        </div>
      )}
    </form>
  )
}
