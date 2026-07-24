"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import { useState } from "react";

import { Input } from "@esigenta/ui";

import { authClient } from "../../../../auth/client";

export function ImpresaLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordEditable, setIsPasswordEditable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const submittedEmail = email.trim();
    const submittedPassword = password;

    setError(null);

    if (!submittedEmail || !submittedPassword) {
      setError("Inserisci email e password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email: submittedEmail,
        password: submittedPassword,
      });

      if (result.error) {
        setError(result.error.message || "Credenziali non valide.");
        return;
      }

      window.location.href = "/area-impresa/richieste";
    } catch {
      setError("Impossibile accedere. Riprova tra poco.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <label className="eg-form-field" htmlFor="email">
        <span className="eg-form-label">Email</span>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="azienda@esempio.it"
        />
      </label>

      <label className="eg-form-field" htmlFor="password">
        <span className="eg-form-label">Password</span>
        <Input
          id="password"
          name="company-login-password"
          type="password"
          autoComplete="new-password"
          required
          readOnly={!isPasswordEditable}
          value={password}
          onFocus={() => setIsPasswordEditable(true)}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Inserisci la password"
        />
      </label>

      <div className="flex justify-end">
        <Link
          href="/area-impresa/recupera-password"
          className="text-sm font-medium text-eg-brand-strong hover:text-eg-brand"
        >
          Recupera password
        </Link>
      </div>

      {error ? <div className="eg-alert eg-alert-error">{error}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="eg-button-primary w-full"
      >
        {isSubmitting ? "Accesso in corso..." : "Accedi"}
      </button>

      <p className="eg-form-help text-center">
        Usando l&apos;area impresa confermi di aver letto l&apos;
        <Link href="/privacy" className="font-medium text-eg-brand-strong hover:text-eg-brand">
          informativa privacy
        </Link>{" "}
        e i{" "}
        <Link href="/termini" className="font-medium text-eg-brand-strong hover:text-eg-brand">
          termini del servizio
        </Link>
        .
      </p>
    </form>
  );
}
