import Link from "next/link";

import { AuthShell } from "./auth-shell";
import { ImpresaLoginForm } from "./components/impresa-login-form";

export type AreaImpresaLoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export async function AreaImpresaLoginPage({
  searchParams,
}: AreaImpresaLoginPageProps) {
  const { registered } = await searchParams;
  const justRegistered = registered === "1";

  return (
    <AuthShell
      headerAction={{ label: "Crea un account", href: "/area-impresa/iscriviti" }}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="eg-eyebrow">Area impresa</p>
          <h1 className="eg-h2 mt-4">Accedi al tuo spazio lavoro.</h1>
          <p className="eg-body-muted mt-4">
            Entra per leggere richieste, contatti e conversazioni raccolti nello
            stesso percorso.
          </p>
        </div>

        {justRegistered ? (
          <div className="eg-alert eg-alert-success">
            Profilo impresa creato. Ora accedi per continuare.
          </div>
        ) : null}

        <ImpresaLoginForm />

        <div className="flex items-center gap-4 text-eg-text-muted">
          <span className="h-px flex-1 bg-eg-border" />
          <span className="eg-divider-label text-[11px]">oppure</span>
          <span className="h-px flex-1 bg-eg-border" />
        </div>

        <p className="text-center text-sm text-eg-text-muted">
          Non hai ancora un profilo?{" "}
          <Link
            href="/area-impresa/iscriviti"
            className="font-medium text-eg-brand-strong hover:text-eg-brand"
          >
            Inizia da qui
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
