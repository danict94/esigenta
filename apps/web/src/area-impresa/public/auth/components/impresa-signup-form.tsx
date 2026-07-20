"use client";

import type { FormEvent } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { GeoPlace } from "@esigenta/shared";
import { Input, Select, cn } from "@esigenta/ui";

import { authClient } from "../../../../auth/client";
import { completeCompanyOnboardingAction } from "../actions/signup-action";

type ImpresaSignupFormProps = {
  categorySlug?: string;
  geoPlace: GeoPlace | null;
  hasValidLeadLocation: boolean;
};

type SignupStep = "company" | "account";

const operatingRadiusOptions = [10, 20, 30, 50, 75, 100] as const;

function hasText(value: string) {
  return Boolean(value.trim());
}

export function ImpresaSignupForm({
  categorySlug,
  geoPlace,
  hasValidLeadLocation,
}: ImpresaSignupFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>("company");
  const [companyName, setCompanyName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [operatingRadiusKm, setOperatingRadiusKm] = useState(30);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasAcceptedLegalTerms, setHasAcceptedLegalTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateCompanyStep() {
    if (!hasValidLeadLocation) {
      return "Seleziona prima la citta dalla pagina professionisti.";
    }

    if (!categorySlug) {
      return "Seleziona prima la categoria professionale dalla pagina professionisti.";
    }

    if (!hasText(companyName)) {
      return "Inserisci il nome azienda.";
    }

    if (!hasText(vatNumber)) {
      return "Inserisci la partita IVA.";
    }

    if (!hasText(phone)) {
      return "Inserisci il numero di telefono.";
    }

    return null;
  }

  function validateAccountStep() {
    if (!hasText(name)) {
      return "Inserisci il nome referente.";
    }

    if (!hasText(email)) {
      return "Inserisci l'email.";
    }

    if (password.length < 8) {
      return "La password deve contenere almeno 8 caratteri.";
    }

    if (!hasAcceptedLegalTerms) {
      return "Accetta termini e informativa privacy per continuare.";
    }

    return null;
  }

  function handleContinue() {
    const validationError = validateCompanyStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setStep("account");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const companyStepError = validateCompanyStep();

    if (companyStepError) {
      setError(companyStepError);
      setStep("company");
      return;
    }

    const accountStepError = validateAccountStep();

    if (accountStepError) {
      setError(accountStepError);
      setStep("account");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const signupResult = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (signupResult.error) {
        setError(signupResult.error.message || "Non e stato possibile creare l'account.");
        return;
      }

      if (!geoPlace) {
        setError("Seleziona prima la citta dalla pagina professionisti.");
        return;
      }

      const onboardingResult = await completeCompanyOnboardingAction({
        name: companyName,
        vatNumber,
        phone,
        categorySlug,
        operatingRadiusKm,
        geoPlace,
      });

      if (!onboardingResult.ok) {
        setError(
          onboardingResult.message ||
            "Accesso creato, ma non e stato possibile completare il profilo azienda.",
        );
        return;
      }

      await authClient.signOut();
      router.replace("/area-impresa/accedi?registered=1");
      router.refresh();
    } catch {
      setError("Impossibile completare l'iscrizione. Riprova tra poco.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-eg-hairline pb-5">
        <StepLabel active={step === "company"} number="1" label="Dati azienda" />
        <span className="h-px flex-1 bg-eg-hairline" />
        <StepLabel active={step === "account"} number="2" label="Accesso" />
      </div>

      {step === "company" ? (
        <div className="space-y-5">
          <div>
            <h2 className="eg-h3">Dati azienda</h2>
            <p className="eg-body-muted mt-2">
              Inserisci le informazioni principali della tua impresa.
            </p>
          </div>

          <label className="eg-form-field" htmlFor="companyName">
            <span className="eg-form-label">Nome azienda</span>
            <Input
              id="companyName"
              type="text"
              autoComplete="organization"
              required
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
            />
          </label>

          <label className="eg-form-field" htmlFor="vatNumber">
            <span className="eg-form-label">Partita IVA</span>
            <Input
              id="vatNumber"
              type="text"
              autoComplete="off"
              required
              value={vatNumber}
              onChange={(event) => setVatNumber(event.target.value)}
            />
          </label>

          <label className="eg-form-field" htmlFor="phone">
            <span className="eg-form-label">Numero di telefono</span>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </label>

          <label className="eg-form-field" htmlFor="operatingRadiusKm">
            <span className="eg-form-label">Raggio d&apos;azione</span>
            <Select
              id="operatingRadiusKm"
              required
              value={operatingRadiusKm}
              onChange={(event) => setOperatingRadiusKm(Number(event.target.value))}
            >
              {operatingRadiusOptions.map((option) => (
                <option key={option} value={option}>
                  {option} km
                </option>
              ))}
            </Select>
            <span className="eg-form-help">
              Il raggio sara calcolato dalla citta selezionata nel passaggio
              precedente. Potrai modificarlo piu avanti.
            </span>
          </label>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <h2 className="eg-h3">Referente e accesso</h2>
            <p className="eg-body-muted mt-2">
              Inserisci i dati della persona che gestira l&apos;area impresa.
            </p>
          </div>

          <label className="eg-form-field" htmlFor="name">
            <span className="eg-form-label">Nome referente</span>
            <Input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="eg-form-field" htmlFor="email">
            <span className="eg-form-label">Email</span>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="eg-form-field" htmlFor="password">
            <span className="eg-form-label">Password</span>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-eg-ardesia">
            <input
              type="checkbox"
              required
              checked={hasAcceptedLegalTerms}
              className="mt-1"
              onChange={(event) => {
                setHasAcceptedLegalTerms(event.target.checked);
              }}
            />
            <span>
              Ho letto l&apos;
              <Link href="/privacy" className="font-medium text-eg-cotto-dark">
                informativa privacy
              </Link>{" "}
              e accetto i{" "}
              <Link href="/termini" className="font-medium text-eg-cotto-dark">
                termini del servizio
              </Link>
              .
            </span>
          </label>
        </div>
      )}

      {error ? <p className="eg-alert">{error}</p> : null}

      {step === "company" ? (
        <button type="button" className="eg-button-primary w-full" onClick={handleContinue}>
          Continua <span aria-hidden="true">&rarr;</span>
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <button type="submit" disabled={isSubmitting} className="eg-button-primary w-full">
            {isSubmitting ? "Creazione in corso..." : "Crea accesso impresa"}
          </button>

          <button
            type="button"
            className="eg-button-ghost w-full"
            onClick={() => {
              setError(null);
              setStep("company");
            }}
          >
            Indietro
          </button>
        </div>
      )}
    </form>
  );
}

function StepLabel({
  active,
  number,
  label,
}: {
  active: boolean;
  number: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-full border text-[12px] font-medium transition-colors",
          active
            ? "border-eg-cotto bg-eg-cotto text-eg-calce"
            : "border-eg-hairline text-eg-ardesia",
        )}
      >
        {number}
      </span>
      <span className={cn("text-[14px] font-medium", active ? "text-eg-terra" : "text-eg-ardesia")}>
        {label}
      </span>
    </span>
  );
}
