import Link from "next/link";

import { Card, CardContent, Container } from "@esigenta/ui";

import { PublicShell } from "../../../site/shell/public-shell";
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
    <PublicShell>
      <div className="flex items-center py-12 md:py-16 lg:py-20">
        <Container size="sm">
          <Card className="mx-auto w-full max-w-md">
            <CardContent className="flex flex-col gap-6 p-6 pt-6 md:p-8">
              <div className="flex flex-col gap-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight text-cantiere-ink">
                  Accedi
                </h1>

                <p className="text-sm leading-6 text-cantiere-ink-secondary">
                  Inserisci le tue credenziali per continuare.
                </p>
              </div>

              {justRegistered ? (
                <div
                  className={`${"rounded-[8px]"} border border-cantiere-accent bg-cantiere-linen px-4 py-3 text-sm font-medium text-cantiere-ink`}
                >
                  Profilo impresa creato. Ora accedi per continuare.
                </div>
              ) : null}

              <ImpresaLoginForm />

              <div className="flex items-center gap-4 text-cantiere-ink-secondary">
                <span className="h-px flex-1 bg-border-primary" />
                <span className="text-xs">o</span>
                <span className="h-px flex-1 bg-border-primary" />
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
            </CardContent>
          </Card>
        </Container>
      </div>
    </PublicShell>
  );
}
