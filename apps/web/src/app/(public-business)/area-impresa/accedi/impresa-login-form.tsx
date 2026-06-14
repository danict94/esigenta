"use client"

import type {
  FormEvent,
} from "react"
import {
  useState,
} from "react"
import Link from "next/link"
import {
  Eye,
  Lock,
  Mail,
} from "lucide-react"
import {
  Button,
  Input,
} from "@esigenta/ui"

import {
  authClient,
} from "../../../../auth/client"

export function ImpresaLoginForm() {
  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [isPasswordEditable, setIsPasswordEditable] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    const submittedEmail =
      email.trim()
    const submittedPassword =
      password

    setError(null)

    if (!submittedEmail || !submittedPassword) {
      setError("Inserisci email e password.")
      return
    }

    setIsSubmitting(true)

    try {
      const result =
        await authClient.signIn.email({
          email:
            submittedEmail,
          password:
            submittedPassword,
        })

      if (result.error) {
        setError(
          result.error.message ||
            "Credenziali non valide.",
        )

        return
      }

      window.location.href = "/area-impresa/richieste"
    } catch {
      setError(
        "Impossibile accedere. Riprova tra poco.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      autoComplete="off"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-text-primary"
        >
          Email
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-text-muted"
          />

          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="es.azienda@esempio.it"
            className="pl-12"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-text-primary"
        >
          Password
        </label>

        <div className="relative">
          <Lock
            aria-hidden="true"
            className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-text-muted"
          />

          <Input
            id="password"
            name="company-login-password"
            type="password"
            autoComplete="new-password"
            required
            readOnly={!isPasswordEditable}
            value={password}
            onFocus={() =>
              setIsPasswordEditable(true)
            }
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Inserisci la password"
            className="pl-12 pr-12"
          />

          <Eye
            aria-hidden="true"
            className="absolute right-4 top-1/2 z-10 size-5 -translate-y-1/2 text-text-muted"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/area-impresa/recupera-password"
          className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
        >
          Recupera password
        </Link>
      </div>

      {error ? (
        <div className="border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="mt-2 w-full"
      >
        {isSubmitting
          ? "Accesso in corso..."
          : "Accedi"}
      </Button>

      <p className="text-center text-xs leading-5 text-text-muted">
        Usando l&apos;area impresa confermi di aver letto l&apos;
        <Link href="/privacy" className="font-medium text-brand-primary">
          informativa privacy
        </Link>{" "}
        e i{" "}
        <Link href="/termini" className="font-medium text-brand-primary">
          termini del servizio
        </Link>
        .
      </p>
    </form>
  )
}
