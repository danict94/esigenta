import Image from "next/image"

import {
  Badge,
  Card,
  CardContent,
  cn,
  Container,
  tokens,
} from "@fixpro/ui"

type HowItWorksStep = {
  id: string
  badge: string
  title: string
  description: string
  imageSrc: string
}

const steps: HowItWorksStep[] = [
  {
    id: "describe",
    badge: "Step 1",
    title: "Descrivi il lavoro",
    description:
      "Raccontaci cosa devi fare, dove serve l’intervento e quando vuoi ricevere aiuto.",
    imageSrc: "/assets/images/descrivi-lavoro.webp",
  },
  {
    id: "proposals",
    badge: "Step 2",
    title: "Ricevi risposte",
    description:
      "I professionisti interessati leggono la richiesta e ti inviano una proposta.",
    imageSrc: "/assets/images/ricevi-risposte.webp",
  },
  {
    id: "choose",
    badge: "Step 3",
    title: "Scegli il professionista",
    description:
      "Confronta le proposte e scegli il professionista più adatto alle tue esigenze.",
    imageSrc: "/assets/images/scegli-professionista.webp",
  },
]

export function HowItWorks() {
  return (
    <section className={tokens.spacing.sectionMd}>
      <Container size="xl">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <p className="text-sm font-medium text-brand-primary">
            Come funziona
          </p>

          <h2
            className={cn(
              "text-text-primary",
              tokens.typography.title,
            )}
          >
            Da esigenza a professionista, senza confusione
          </h2>

          <p className="max-w-2xl text-base leading-7 text-text-secondary">
            Esigenta ti accompagna in pochi passaggi: parti dal lavoro
            che devi fare e arrivi a una proposta concreta.
          </p>
        </div>

        <div className="grid gap-6 pt-10 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.id}>
              <CardContent className="flex h-full flex-col gap-6 p-6">
                <Badge variant="success">
                  {step.badge}
                </Badge>

                <div
                  className={cn(
                    "relative min-h-40 overflow-hidden bg-surface-secondary",
                    tokens.radius["2xl"],
                  )}
                >
                  <Image
                    src={step.imageSrc}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-contain p-4"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-xl font-semibold tracking-tight text-text-primary">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-6 text-text-secondary">
                    {step.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}