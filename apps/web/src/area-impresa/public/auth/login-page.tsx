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
    <AuthShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-medium tracking-[-0.01em] text-cantiere-ink text-[clamp(1.5rem,1.2rem+1vw,2rem)]">
            Accedi
          </h1>

          <p className="text-[15px] leading-[1.5] text-cantiere-ink-secondary">
            Inserisci le tue credenziali per continuare.
          </p>
        </div>

        {justRegistered ? (
          <div className="rounded-[8px] border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm font-medium text-cantiere-ink">
            Profilo impresa creato. Ora accedi per continuare.
          </div>
        ) : null}

        <ImpresaLoginForm />

        <div className="flex items-center gap-4 text-cantiere-ink-secondary">
          <span className="h-px flex-1 bg-cantiere-hairline" />
          <span className="text-xs">o</span>
          <span className="h-px flex-1 bg-cantiere-hairline" />
        </div>

        <p className="text-center text-sm text-cantiere-ink-secondary">
          Non hai ancora un profilo?{" "}
          <Link
            href="/area-impresa/iscriviti"
            className="font-semibold text-cantiere-accent transition-colors hover:text-cantiere-accent-hover"
          >
            Inizia da qui
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
