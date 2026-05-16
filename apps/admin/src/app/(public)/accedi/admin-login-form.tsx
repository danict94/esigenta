"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "../../../auth/client";

export function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);
    setIsSubmitting(true);

    try {
      const result =
        await authClient.signIn.email({
          email,
          password,
        });

      if (result.error) {
        setError(
          result.error.message ||
            "Credenziali non valide.",
        );

        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "Impossibile accedere. Riprova tra poco.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
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
          autoComplete="email"
          required
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-text-primary"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-text-primary"
        >
          Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          className="w-full rounded-xl border border-border-subtle bg-white px-3 py-2 text-sm text-text-primary outline-none focus:border-text-primary"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-text-primary px-4 py-2 text-sm font-medium text-surface-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Accesso in corso..."
          : "Accedi"}
      </button>
    </form>
  );
}