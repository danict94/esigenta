"use client"

import type {
  FormEvent,
} from "react"
import {
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"

import {
  Button,
  Input,
} from "@fixpro/ui"

import {
  authClient,
} from "../../../../auth/client"

export function ImpresaLoginForm() {
  const router =
    useRouter()

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

      router.replace("/area-impresa/richieste")
      router.refresh()
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
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-text-primary"
        >
          Password
        </label>

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
        />
      </div>

      {error ? (
        <div className="border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full"
      >
        {isSubmitting
          ? "Accesso in corso..."
          : "Accedi"}
      </Button>
    </form>
  )
}
