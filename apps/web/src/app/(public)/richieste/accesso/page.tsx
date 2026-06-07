import { redirect } from "next/navigation";

import {
  Button,
  Card,
  CardContent,
  Container,
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
      <div className="py-10 md:py-14 lg:py-20">
        <Container size="lg">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,29rem)] lg:items-center lg:gap-16">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-5 text-center lg:mx-0 lg:text-left">
              <p className="text-sm font-semibold text-brand-primary">
                Le mie richieste
              </p>

              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl">
                Accedi al tuo
                <br />
                storico richieste
              </h1>

              <p className="mx-auto max-w-xl text-base leading-7 text-text-secondary md:text-lg md:leading-8 lg:mx-0">
                Inserisci la tua email e ricevi un link sicuro per controllare
                le richieste che hai inviato su esigenta. Non devi ricordare
                password e non devi creare un account.
              </p>
            </div>

            <Card className="mx-auto w-full max-w-md">
              <CardContent className="flex flex-col gap-6 p-6 pt-6 md:p-8">
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold tracking-tight text-text-primary md:text-2xl">
                    Ricevi il link di accesso
                  </h2>

                  <p className="text-sm leading-6 text-text-secondary">
                    Ti invieremo un&apos;email con un link sicuro per entrare
                    nella tua area richieste.
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
                    Se l&apos;indirizzo &egrave; associato a una o pi&ugrave;
                    richieste, riceverai un link di accesso.
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

                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="es.nome@email.it"
                    />
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
        </Container>
      </div>
    </PublicShell>
  );
}
