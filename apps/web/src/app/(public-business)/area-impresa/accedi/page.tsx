import Link from "next/link";

import {
  cn,
  Container,
  tokens,
} from "@fixpro/ui";

import {
  ImpresaLoginForm,
} from "./impresa-login-form";

type AreaImpresaLoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

export default async function AreaImpresaLoginPage({
  searchParams,
}: AreaImpresaLoginPageProps) {
  const { registered } =
    await searchParams;

  const justRegistered =
    registered === "1";

  return (
    <main className="bg-surface-primary">
      <section className={tokens.spacing.sectionXl}>
        <Container size="xl">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <p className="text-sm font-medium text-text-secondary">
                  FixPro Imprese
                </p>

                <h1
                  className={cn(
                    "max-w-2xl text-text-primary",
                    tokens.typography.hero,
                  )}
                >
                  Accedi alla tua area impresa.
                </h1>

                <p
                  className={cn(
                    "max-w-xl",
                    tokens.typography.subtitle,
                  )}
                >
                  Gestisci richieste, territorio operativo e profilo
                  della tua attività da un’unica piattaforma.
                </p>
              </div>

              {justRegistered ? (
                <div
                  className={cn(
                    "border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800",
                    tokens.radius.md,
                  )}
                >
                  Profilo impresa creato. Ora accedi per continuare.
                </div>
              ) : null}
            </div>

            <div
              className={cn(
                "border border-border-primary bg-surface-elevated p-8",
                tokens.radius.lg,
                tokens.shadows.surface,
              )}
            >
              <ImpresaLoginForm />

              <p className="mt-6 text-sm text-text-secondary">
                Non hai ancora un profilo?{" "}
                <Link
                  href="/area-impresa/iscriviti"
                  className="font-semibold text-text-primary transition-colors hover:text-text-primary/80"
                >
                  Inizia da qui
                </Link>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}