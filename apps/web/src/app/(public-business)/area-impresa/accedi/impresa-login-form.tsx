"use client"

import {
  useEffect,
  useRef,
  useState,
} from "react"
import {
  useRouter,
} from "next/navigation"

import {
  Button,
  cn,
  tokens,
} from "@fixpro/ui"

import {
  authClient,
} from "../../../../auth/client"

export function ImpresaLoginForm() {
  const router =
    useRouter()
  const passwordInputRef =
    useRef<HTMLInputElement>(null)

  const [email, setEmail] =
    useState("")

  const [password, setPassword] =
    useState("")

  const [error, setError] =
    useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] =
    useState(false)

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)
    setIsSubmitting(true)

    const formData =
      new FormData(event.currentTarget)
    const submittedEmail =
      String(
        formData.get("email") ?? email,
      ).trim()
    const submittedPassword =
      String(
        formData.get("password") ?? password,
      )

    if (!submittedEmail || !submittedPassword) {
      setError("Inserisci email e password.")
      setIsSubmitting(false)
      return
    }

    try {
      const result =
        await authClient.signIn.email({
          email: submittedEmail,
          password: submittedPassword,
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

  useEffect(() => {
    function clearAutofilledPassword() {
      setPassword("")

      if (passwordInputRef.current) {
        passwordInputRef.current.value = ""
      }
    }

    clearAutofilledPassword()

    const timers = [
      window.setTimeout(
        clearAutofilledPassword,
        50,
      ),
      window.setTimeout(
        clearAutofilledPassword,
        250,
      ),
    ]

    return () => {
      timers.forEach((timer) =>
        window.clearTimeout(timer),
      )
    }
  }, [])

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

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className={cn(
            "h-14 w-full border border-border-primary bg-surface-primary px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus",
            tokens.radius.lg,
          )}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-text-primary"
        >
          Password
        </label>

        <input
          id="password"
          ref={passwordInputRef}
          name="password"
          type="password"
          autoComplete="off"
          required
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          className={cn(
            "h-14 w-full border border-border-primary bg-surface-primary px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-border-focus",
            tokens.radius.lg,
          )}
        />
      </div>

      {error ? (
        <div
          className={cn(
            "border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700",
            tokens.radius.md,
          )}
        >
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
