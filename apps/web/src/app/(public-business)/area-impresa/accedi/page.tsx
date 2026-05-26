import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

import { Card, CardContent, cn, HeroSurface, tokens } from "@fixpro/ui";

import { Navbar } from "../../../../components/navigation/navbar";
import { ImpresaLoginForm } from "./impresa-login-form";

type AreaImpresaLoginPageProps = {
  searchParams: Promise<{
    registered?: string;
  }>;
};

const loginIllustrationSrc = "/assets/images/impresa-login.webp";

const benefits = [
  "Gestisci richieste e appuntamenti",
  "Aggiorna il profilo della tua azienda",
  "Comunica e rispondi ai clienti in modo semplice",
] as const;

export default async function AreaImpresaLoginPage({
  searchParams,
}: AreaImpresaLoginPageProps) {
  const { registered } = await searchParams;

  const justRegistered = registered === "1";

  return (
    <div className="min-h-screen bg-surface-primary text-text-primary">
      <Navbar />

      <main className="pb-8 md:pb-10">
        <HeroSurface className="pt-10 pb-8 md:py-12 xl:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,31.25rem)] lg:items-center xl:gap-10">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 text-center lg:mx-0 lg:pl-8 lg:text-left xl:gap-6 xl:pl-12">
              <div className="flex flex-col gap-4">
                <h1
                  className={cn(
                    "max-w-xl text-2xl font-semibold leading-tight tracking-tight text-text-primary sm:text-3xl md:text-4xl",
                  )}
                >
                  Accedi alla tua
                  <br />
                  area impresa
                </h1>

                <p className="mx-auto max-w-xl text-base leading-7 text-text-secondary md:text-lg md:leading-8 xl:mx-0">
                  Gestisci le tue richieste, aggiorna il profilo della tua
                  azienda e rispondi ai clienti, tutto da un unico spazio.
                </p>
              </div>

              {justRegistered ? (
                <div
                  className={cn(
                    "border border-brand-primary bg-surface-elevated px-4 py-3 text-sm font-medium text-text-primary",
                    tokens.radius.lg,
                  )}
                >
                  Profilo impresa creato. Ora accedi per continuare.
                </div>
              ) : null}

              <ul className="mx-auto hidden w-full max-w-xl flex-col gap-3 text-left md:flex lg:mx-0">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 text-sm text-text-secondary md:text-base"
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-brand-primary"
                    >
                      <Check className="size-4" />
                    </span>

                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <LoginIllustration />
            </div>

            <Card className="mx-auto w-full max-w-lg bg-surface-elevated shadow-surface lg:max-w-xl">
              <CardContent className="flex flex-col gap-6 p-6 md:p-8 xl:p-10">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
                    Accedi
                  </h2>

                  <p className="text-sm leading-6 text-text-secondary">
                    Inserisci le tue credenziali per continuare.
                  </p>
                </div>

                <ImpresaLoginForm />

                <div className="flex items-center gap-4 text-text-muted">
                  <span className="h-px flex-1 bg-border-primary" />
                  <span className="text-xs">o</span>
                  <span className="h-px flex-1 bg-border-primary" />
                </div>

                <p className="text-center text-sm text-text-secondary">
                  Non hai ancora un profilo?{" "}
                  <Link
                    href="/area-impresa/iscriviti"
                    className="font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
                  >
                    Inizia da qui
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </HeroSurface>
      </main>
    </div>
  );
}

function LoginIllustration() {
  return (
    <div className="relative mx-auto hidden min-h-[260px] w-full max-w-2xl md:min-h-[300px] xl:mx-0 xl:-mt-4 xl:block xl:min-h-[320px]">
      <Image
        src={loginIllustrationSrc}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1280px) 620px, 100vw"
        className="object-contain object-center"
      />
    </div>
  );
}
