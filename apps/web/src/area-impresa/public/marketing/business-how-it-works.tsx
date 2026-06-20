import Image from "next/image"

import {
  Container,
  cn,
  tokens,
} from "@esigenta/ui"

const illustrationSrc =
  "/assets/images/area-professionista.webp"

const topSteps = [
  {
    number: "1",
    title: "Ti iscrivi gratis",
    description:
      "Crei il profilo impresa nessun abbonamento, configuri servizi, zona operativa e dati attività.",
  },
  {
    number: "2",
    title: "Acquisti crediti quando vuoi",
    description:
      "Ricarichi il saldo con pacchetti crediti. I crediti restano disponibili nel tuo account.",
  },
  {
    number: "3",
    title: "Entra facilmente in contatto con nuovi clienti",
    description:
      "Dopo lo sblocco puoi contattare il cliente via email o telefono.",
  },
] as const

const sideSteps = [
  {
    title: "Configura servizi e zona",
    description:
      "Indichi cosa offri e dove lavori, così la dashboard mostra opportunità più pertinenti.",
  },
  {
    title: "Ricevi notifiche compatibili",
    description:
      "Ricevi richieste coerenti con la tua zona operativa e con i tuoi servizi.",
  },
  {
    title: "Sblocca solo quelle utili",
    description:
      "Usi i crediti solo sulle richieste che vuoi approfondire davvero.",
  },
] as const

export function BusinessHowItWorks() {
  return (
    <section className={tokens.spacing.sectionLg}>
      <Container size="xl">
        <h2
          className={cn(
            "text-center text-text-primary",
            tokens.typography.title,
          )}
        >
          Come funziona?
        </h2>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {topSteps.map((step) => (
            <div
              key={step.number}
              className="grid gap-4 sm:grid-cols-[auto_1fr]"
            >
              <div className="flex size-10 items-center justify-center rounded-full border border-brand-primary text-xl font-medium text-brand-primary">
                {step.number}
              </div>

              <div>
                <h3 className="text-base font-semibold text-text-primary">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-xs text-sm leading-6 text-text-primary">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_0.9fr] lg:items-center">
          <div className="relative mx-auto min-h-[420px] w-full max-w-2xl">
            <Image
              src={illustrationSrc}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1024px) 620px, 100vw"
              className="object-contain object-center"
            />
          </div>

          <div className="mx-auto grid w-full max-w-lg gap-12 lg:mx-0">
            {sideSteps.map((step) => (
              <div
                key={step.title}
                className="border-l-4 border-brand-primary pl-6"
              >
                <h3 className="text-lg font-semibold leading-6 text-text-primary">
                  {step.title}
                </h3>

                <p className="mt-2 text-base leading-6 text-text-primary">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
