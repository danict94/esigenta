import type { Metadata } from "next"
import Link from "next/link"
import {
  redirect,
} from "next/navigation"

import {
  prisma,
  reactivateCompanyAccount,
  getCurrentUserFromHeaders,
} from "@fixpro/db"

import {
  Badge,
  Button,
  Card,
  Container,
  cn,
  tokens,
} from "@fixpro/ui"

import {
  CompanyLeadForm,
} from "./_components/company-lead-form"

import {
  headers,
} from "next/headers"

export const metadata: Metadata = {
  title:
    "FixPro per professionisti | Ricevi richieste di lavoro nella tua zona",
  description:
    "Iscrivi la tua impresa a FixPro e ricevi richieste per lavori casa, ristrutturazioni, impianti, manutenzioni e interventi nella tua zona.",
}
async function getProfessionalCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      slug: true,
      name: true,
    },
  })
}

const secondaryLinkClass =
  "inline-flex h-12 items-center justify-center rounded-md border border-border-primary bg-surface-primary px-5 text-sm font-medium text-text-primary transition-colors hover:border-border-focus"

const inverseLinkClass =
  "inline-flex h-12 items-center justify-center rounded-md border border-surface-primary bg-surface-primary px-5 text-sm font-medium text-text-primary transition-colors hover:border-border-focus"

const benefits = [
  {
    title: "Richieste da clienti interessati",
    description:
      "Ricevi richieste da persone che stanno cercando un professionista per un intervento reale, non semplici contatti generici.",
  },
  {
    title: "Lavori nella tua zona",
    description:
      "Configuri l’area in cui lavori e concentri l’attività sulle richieste più adatte alla tua impresa.",
  },
  {
    title: "Servizi coerenti con ciò che offri",
    description:
      "Scegli i servizi che vuoi proporre usando le categorie reali disponibili su FixPro.",
  },
  {
    title: "Più controllo sulle opportunità",
    description:
      "Valuti le richieste disponibili e decidi quali approfondire in base a zona, servizio e tipo di lavoro.",
  },
]

const steps = [
  {
    title: "Crea il profilo impresa",
    description:
      "Apri il tuo accesso professionale e prepara il profilo con le informazioni principali.",
  },
  {
    title: "Scegli servizi e zona",
    description:
      "Indichi cosa fai e dove lavori, così FixPro può mostrarti richieste più pertinenti.",
  },
  {
    title: "Ricevi richieste compatibili",
    description:
      "Le richieste vengono organizzate per intervento, località e informazioni utili sul lavoro.",
  },
  {
    title: "Decidi quali seguire",
    description:
      "Approfondisci solo le richieste che hanno senso per la tua attività e la tua disponibilità.",
  },
]

const faqs = [
  {
    question: "L’iscrizione a FixPro è gratuita?",
    answer:
      "Puoi creare il profilo impresa e iniziare la configurazione senza impegno. Le funzioni commerciali avanzate verranno gestite in modo separato e trasparente.",
  },
  {
    question: "Che tipo di richieste posso ricevere?",
    answer:
      "Richieste per lavori casa, manutenzioni, ristrutturazioni, impianti, tinteggiature, idraulica, elettricità e altri interventi professionali.",
  },
  {
    question: "Posso scegliere la zona in cui lavoro?",
    answer:
      "Sì. Il profilo impresa è pensato per collegare servizi offerti e area operativa, così da evitare richieste lontane o poco pertinenti.",
  },
  {
    question: "Devo seguire tutte le richieste?",
    answer:
      "No. L’obiettivo è darti controllo: puoi valutare le informazioni principali e decidere quali richieste approfondire.",
  },
  {
    question: "FixPro è adatto anche ad artigiani e piccole imprese?",
    answer:
      "Sì. La pagina impresa è pensata per ditte, artigiani, tecnici e professionisti che vogliono ricevere nuove opportunità nella propria zona.",
  },
]

async function reactivateAccountAction() {
  "use server"

  const user =
    await getCurrentUserFromHeaders(
      await headers(),
    )

  if (!user) {
    return
  }

  await reactivateCompanyAccount(
    user.id,
  )

  redirect(
    "/area-impresa/richieste",
  )
}

export default async function AreaImpresaLandingPage() {
  const categories =
    await getProfessionalCategories()

  const currentUser =
    await getCurrentUserFromHeaders(
      await headers(),
    )

  const hasDeactivatedCompany =
    currentUser
      ? await prisma.companyMembership.findFirst({
          where: {
            userId:
              currentUser.id,
            company: {
              is: {
                isActive: false,
              },
            },
          },
        })
      : null

  return (
    <main className="bg-surface-primary text-text-primary">
      <section className="relative overflow-hidden border-b border-border-primary bg-surface-primary">
        <Container size="xl">
          <div className="grid min-h-[calc(100vh-4rem)] gap-12 py-16 md:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
            <div className="max-w-3xl">
              <Badge>
                FixPro per professionisti
              </Badge>

              <h1
                className={cn(
                  "mt-6 text-text-primary",
                  tokens.typography.hero,
                )}
              >
                Ricevi richieste di lavoro nella tua zona
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
                Iscrivi la tua impresa a FixPro, indica i servizi che offri
                e inizia a ricevere richieste da clienti che cercano
                professionisti per lavori casa, impianti e ristrutturazioni.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/area-impresa/accedi"
                  className={cn(secondaryLinkClass, "w-full sm:w-auto")}
                >
                  Accedi all’area impresa
                </Link>
              </div>

              <div className="mt-8 grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
                <p>Richieste per lavori reali</p>
                <p>Servizi e zona configurabili</p>
                <p>Profilo impresa dedicato</p>
              </div>
            </div>

            {
              hasDeactivatedCompany ? (
                <Card className="border-amber-500/30 bg-amber-500/5 p-6">
                  <div className="space-y-3">
                    <Badge>
                      Account disattivato
                    </Badge>

                    <h2 className="text-2xl font-semibold text-text-primary">
                      Il tuo account impresa è stato disattivato
                    </h2>

                    <p className="text-sm leading-6 text-text-secondary">
                      Abbiamo trovato un account FixPro associato a questa sessione.
                      Puoi riattivarlo mantenendo storico, richieste e configurazione.
                    </p>

                    <form
                      action={reactivateAccountAction}
                      className="pt-2"
                    >
                      <Button type="submit">
                        Riattiva account
                      </Button>
                    </form>
                  </div>
                </Card>
              ) : (
                <CompanyLeadForm categories={categories} />
              )
            }
          </div>
        </Container>
      </section>

      <section className={tokens.spacing.sectionLg}>
        <Container size="xl">
          <div className="max-w-2xl">
            <Badge>
              Perché iscriversi
            </Badge>

            <h2
              className={cn(
                "mt-4 text-text-primary",
                tokens.typography.title,
              )}
            >
              Un nuovo canale per trovare lavori adatti alla tua impresa
            </h2>

            <p className="mt-4 text-base leading-7 text-text-secondary">
              FixPro organizza le richieste per tipo di intervento, zona e
              informazioni operative, così puoi concentrarti sui lavori che
              rientrano davvero nei tuoi servizi.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <Card
                key={benefit.title}
                className="p-6"
              >
                <h3 className="text-base font-semibold text-text-primary">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border-primary bg-surface-secondary py-16 md:py-24">
        <Container size="xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <Badge>
                Come funziona
              </Badge>

              <h2
                className={cn(
                  "mt-4 text-text-primary",
                  tokens.typography.title,
                )}
              >
                Dalla registrazione alle prime richieste
              </h2>

              <p className="mt-4 text-base leading-7 text-text-secondary">
                Il percorso è pensato per essere progressivo: prima crei
                l’accesso impresa, poi completi servizi, zona e profilo
                operativo.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {steps.map((step, index) => (
                <Card
                  key={step.title}
                  className="p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-brand-on-primary">
                    {index + 1}
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-text-primary">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className={tokens.spacing.sectionLg}>
        <Container size="xl">
          <div className="max-w-2xl">
            <Badge>
              Settori e interventi
            </Badge>

            <h2
              className={cn(
                "mt-4 text-text-primary",
                tokens.typography.title,
              )}
            >
              Richieste per imprese e professionisti dei lavori casa
            </h2>

            <p className="mt-4 text-base leading-7 text-text-secondary">
              FixPro è pensato per intercettare richieste concrete: dalla
              tinteggiatura alla ristrutturazione, dagli impianti alle
              manutenzioni.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Badge key={category.slug}>
                {category.name}
              </Badge>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-surface-secondary py-16 md:py-24">
        <Container size="xl">
          <Card className="overflow-hidden">
            <div className="grid gap-8 p-6 md:p-10 lg:grid-cols-[1fr_0.75fr] lg:items-center">
              <div>
                <Badge>
                  Controllo sulle richieste
                </Badge>

                <h2
                  className={cn(
                    "mt-4 text-text-primary",
                    tokens.typography.title,
                  )}
                >
                  Valuta prima di approfondire
                </h2>

                <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
                  Non devi inseguire ogni contatto. Entri, guardi le richieste
                  disponibili e decidi quali sono davvero compatibili con i
                  servizi che offri, la zona in cui lavori e la tua
                  disponibilità.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/area-impresa/iscriviti"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-brand-primary bg-brand-primary px-5 text-sm font-medium text-brand-on-primary transition-colors hover:border-brand-primary-hover hover:bg-brand-primary-hover"
                >
                  Inizia gratuitamente
                </Link>

                <Link
                  href="/area-impresa/accedi"
                  className={secondaryLinkClass}
                >
                  Accedi
                </Link>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      <section className={tokens.spacing.sectionLg}>
        <Container size="lg">
          <div className="text-center">
            <Badge>
              Domande frequenti
            </Badge>

            <h2
              className={cn(
                "mt-4 text-text-primary",
                tokens.typography.title,
              )}
            >
              Prima di iniziare
            </h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <Card
                key={faq.question}
                className="p-6"
              >
                <h3 className="text-base font-semibold text-text-primary">
                  {faq.question}
                </h3>

                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  {faq.answer}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border-primary bg-brand-primary py-16 text-brand-on-primary md:py-24">
        <Container size="lg">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wide opacity-80">
              FixPro per professionisti
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Vuoi trovare nuovi lavori nella tua zona?
            </h2>

            <p className="mt-5 text-base leading-7 opacity-85">
              Crea il tuo accesso impresa e prepara il profilo per ricevere
              richieste più adatte ai servizi che offri.
            </p>

            <div className="mt-8">
              <Link
                href="/area-impresa/iscriviti"
                className={inverseLinkClass}
              >
                Inizia gratuitamente
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
