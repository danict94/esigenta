import { redirect } from "next/navigation";
import { Mail, ShieldCheck, Clock, History } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  HeroSurface,
  Input,
  cn,
  tokens,
} from "@fixpro/ui";

import { sendCustomerRequestsAccessEmail } from "@fixpro/db";

import { PublicShell } from "../../../../components/layout/public-shell";

type CustomerRequestsAccessPageProps = {
  searchParams: Promise<{
    sent?: string;
  }>;
};

const benefits = [
  {
    title: "Controlla lo stato",
    description:
      "Vedi se una richiesta è in attesa di conferma, in revisione o pubblicata.",
    icon: ShieldCheck,
  },
  {
    title: "Ritrova lo storico",
    description: "Accedi alle richieste già inviate usando la stessa email.",
    icon: History,
  },
  {
    title: "Accesso semplice",
    description:
      "Ricevi un link temporaneo senza creare un account e senza password.",
    icon: Clock,
  },
] as const;

async function requestCustomerAccessAction(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  await sendCustomerRequestsAccessEmail({
    email,
  });

  redirect("/richieste/accesso?sent=1");
}

export default async function CustomerRequestsAccessPage({
  searchParams,
}: CustomerRequestsAccessPageProps) {
  const { sent } = await searchParams;

  const hasSent = sent === "1";

  return (
    <PublicShell>
      <div className="pb-8 md:pb-10">
        <HeroSurface className="pt-10 pb-8 md:py-12 xl:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:items-center xl:gap-12">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 text-center lg:mx-0 lg:pl-8 lg:text-left xl:pl-12">
                <div className="flex flex-col gap-5">
                  <p className="text-sm font-semibold text-brand-primary">
                    Le mie richieste
                  </p>

                  <h1
                    className={cn(
                      "max-w-xl text-2xl font-semibold leading-tight tracking-tight text-text-primary sm:text-3xl md:text-4xl",
                    )}
                  >
                    Accedi al tuo
                    <br />
                    storico richieste
                  </h1>

                  <p className="mx-auto max-w-xl text-base leading-7 text-text-secondary md:text-lg md:leading-8 xl:mx-0">
                    Inserisci la tua email e ricevi un link sicuro per
                    controllare le richieste che hai inviato su Esigenta. Non
                    devi ricordare password e non devi creare un account.
                  </p>
                </div>

                <div className="mx-auto hidden w-full max-w-xl gap-4 text-left md:grid lg:mx-0">
                  {benefits.map((benefit) => {
                    const Icon = benefit.icon;

                    return (
                      <div key={benefit.title} className="flex gap-4">
                        <span
                          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-brand-primary"
                          aria-hidden="true"
                        >
                          <Icon className="size-5" />
                        </span>

                        <div>
                          <h2 className="text-sm font-semibold text-text-primary md:text-base">
                            {benefit.title}
                          </h2>

                          <p className="mt-1 text-sm leading-6 text-text-secondary">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Card className="mx-auto w-full max-w-lg bg-surface-elevated shadow-surface lg:max-w-xl">
                <CardContent className="flex flex-col gap-6 p-6 md:p-8 xl:p-10">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
                      Ricevi il link di accesso
                    </h2>

                    <p className="text-sm leading-6 text-text-secondary">
                      Ti invieremo un’email con un link sicuro per entrare nella
                      tua area richieste.
                    </p>
                  </div>

                  {hasSent ? (
                    <div
                      className={cn(
                        "border border-border-primary bg-surface-secondary px-4 py-3 text-sm leading-6 text-text-secondary",
                        tokens.radius.lg,
                      )}
                    >
                      <strong className="font-semibold text-text-primary">
                        Controlla la tua email.
                      </strong>{" "}
                      Se l’indirizzo è associato a una o più richieste,
                      riceverai un link di accesso.
                    </div>
                  ) : null}

                  <form
                    action={requestCustomerAccessAction}
                    className="flex flex-col gap-5"
                  >
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-text-primary"
                      >
                        Email
                      </label>

                      <div className="relative">
                        <Mail
                          className="absolute left-4 top-1/2 z-10 size-5 -translate-y-1/2 text-text-muted"
                          aria-hidden="true"
                        />

                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          placeholder="es.nome@email.it"
                          className="pl-12"
                        />
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full">
                      Invia link di accesso
                    </Button>
                  </form>

                  <p className="text-center text-sm leading-6 text-text-secondary">
                    Non serve una password. Usa la stessa email indicata quando
                    hai inviato la richiesta.
                  </p>
                </CardContent>
              </Card>
          </div>
        </HeroSurface>
      </div>
    </PublicShell>
  );
}
