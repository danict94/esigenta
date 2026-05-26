"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Button,
  Input,
} from "@fixpro/ui";

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
    event: FormEvent<HTMLFormElement>,
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

        <Input
          id="email"
          name="email"
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
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
        />
      </div>

      {error ? (
        <p className="border border-border-focus bg-surface-secondary px-3 py-2 text-sm text-text-primary">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Link
          href="/admin/recupera-password"
          className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
        >
          Recupera password
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Accesso in corso..."
          : "Accedi"}
      </Button>
    </form>
  );
}
