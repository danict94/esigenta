"use client"

import {
  type FormEvent,
  useState,
} from "react"
import Link from "next/link"
import {
  useRouter,
} from "next/navigation"

import {
  Badge,
  Button,
  Input,
  Select,
  cn,
  tokens,
} from "@esigenta/ui"

import {
  authClient,
} from "../../../../auth/client"

import {
  completeCompanyOnboardingAction,
} from "./actions"

type InitialCompanyInput = {
  address?: string
  city?: string
  postalCode?: string
  latitude?: number
  longitude?: number
}

type ImpresaSignupFormProps = {
  categorySlug?: string
  initialCompany?: InitialCompanyInput
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
  initialCompany = {},
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

      const onboardingResult =
        await completeCompanyOnboardingAction({
          name: companyName,
          vatNumber,
          phone,
          categorySlug,
          operatingRadiusKm,
          ...(initialCompany.address
            ? {
                address:
                  initialCompany.address,
              }
            : {}),
          ...(initialCompany.city
            ? {
                city:
                  initialCompany.city,
              }
            : {}),
          ...(initialCompany.postalCode
            ? {
                postalCode:
                  initialCompany.postalCode,
              }
            : {}),
          ...(initialCompany.latitude !== undefined
            ? {
                latitude:
                  initialCompany.latitude,
              }
            : {}),
          ...(initialCompany.longitude !== undefined
            ? {
                longitude:
                  initialCompany.longitude,
              }
            : {}),
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
      <div className="flex items-center gap-2 pb-1">
        <Badge
          variant={step === "company" ? "success" : "neutral"}
        >
          1
        </Badge>

        <span
          className={cn(
            "text-sm font-semibold",
            step === "company"
              ? "text-text-primary"
              : "text-text-secondary",
          )}
        >
          Dati azienda
        </span>

        <span className="h-px flex-1 bg-border-primary" />

        <Badge
          variant={step === "account" ? "success" : "neutral"}
        >
          2
        </Badge>

        <span
          className={cn(
            "text-sm font-semibold",
            step === "account"
              ? "text-text-primary"
              : "text-text-secondary",
          )}
        >
          Accesso
        </span>
      </div>

      {step === "company" ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Dati azienda
            </h2>

            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Inserisci le informazioni principali della tua impresa.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="companyName"
              className="text-sm font-medium text-text-primary"
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
              className="text-sm font-medium text-text-primary"
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
              className="text-sm font-medium text-text-primary"
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
              className="text-sm font-medium text-text-primary"
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

            <p className={tokens.typography.caption}>
              Il raggio sarà calcolato dalla città selezionata nel passaggio
              precedente. Potrai modificarlo più avanti.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Referente e accesso
            </h2>

            <p className="mt-1 text-sm leading-5 text-text-secondary">
              Inserisci i dati della persona che gestirà l’area impresa.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-text-primary"
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
              className="text-sm font-medium text-text-primary"
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
              className="text-sm font-medium text-text-primary"
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

          <label className="flex items-start gap-3 text-sm leading-6 text-text-secondary">
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
                className="font-medium text-brand-primary"
              >
                informativa privacy
              </Link>{" "}
              e accetto i{" "}
              <Link
                href="/termini"
                className="font-medium text-brand-primary"
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
            "border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary",
            tokens.radius.md,
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
