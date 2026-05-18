"use client"

import {
  type FormEvent,
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"

import {
  Button,
  Input,
  Select,
} from "@fixpro/ui"

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

  const [error, setError] =
    useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)

    if (!hasValidLeadLocation) {
      setError(
        "Seleziona prima la cittÃ  dalla pagina professionisti.",
      )
      return
    }

    if (!categorySlug) {
      setError(
        "Seleziona prima la categoria professionale dalla pagina professionisti.",
      )
      return
    }

    if (!hasText(companyName)) {
      setError("Inserisci il nome azienda.")
      return
    }

    if (!hasText(vatNumber)) {
      setError("Inserisci la partita IVA.")
      return
    }

    if (!hasText(phone)) {
      setError("Inserisci il numero di telefono.")
      return
    }

    if (!hasText(name)) {
      setError("Inserisci il nome referente.")
      return
    }

    if (!hasText(email)) {
      setError("Inserisci l’email.")
      return
    }

    if (password.length < 8) {
      setError("La password deve contenere almeno 8 caratteri.")
      return
    }

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
      className="space-y-6"
    >
      <div className="space-y-5">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Dati azienda
          </h3>

          <p className="mt-1 text-sm leading-6 text-text-secondary">
            Inserisci le informazioni principali della tua impresa.
          </p>
        </div>

        <div className="space-y-2">
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

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
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

          <div className="space-y-2">
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
        </div>

        <div className="space-y-2">
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

          <p className="text-xs leading-5 text-text-muted">
            Il raggio sarÃ  calcolato dalla cittÃ  selezionata nel passaggio
            precedente. Potrai modificarlo più avanti.
          </p>
        </div>
      </div>

      <div className="space-y-5 border-t border-border-primary pt-6">
        <div className="space-y-2">
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

        <div className="space-y-2">
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

        <div className="space-y-2">
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
      </div>

      {error ? (
        <p className="border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Creazione in corso..."
          : "Crea accesso impresa"}
      </Button>
    </form>
  )
}

