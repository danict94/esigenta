import type { Metadata } from "next"

import {
  Badge,
  Card,
  Container,
} from "@fixpro/ui"

import { PublicShell } from "../../components/layout/public-shell"
import {
  getFiscalUpdateNotice,
  getInitialPhaseNotice,
  getLegalControllerLabel,
  legalProfile,
} from "../../content/legal/legal-profile"

export const metadata: Metadata = {
  title: "Termini di servizio | Esigenta",
  description:
    "Termini di servizio Esigenta per clienti, imprese e professionisti.",
}

const userRules = [
  "clienti e imprese devono fornire dati corretti, aggiornati e non ingannevoli",
  "le richieste devono descrivere interventi reali e non contenere contenuti illeciti o offensivi",
  "le imprese devono usare l'area riservata nel rispetto delle regole della piattaforma",
  "le credenziali di accesso devono essere custodite con attenzione",
]

const platformLimits = [
  "Esigenta non esegue direttamente i lavori richiesti",
  "imprese e professionisti sono soggetti terzi e autonomi",
  "Esigenta non garantisce disponibilita, numero di preventivi o conclusione del lavoro",
  "preventivi, sopralluoghi, contratti e lavori restano sotto responsabilita delle parti coinvolte",
]

export default function TermsPage() {
  const initialNotice = getInitialPhaseNotice()
  const fiscalNotice = getFiscalUpdateNotice()

  return (
    <PublicShell>
      <Container size="lg" gutter="md">
        <article className="py-12 md:py-16">
          <header className="max-w-3xl">
            <Badge variant="success">Termini</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text-primary">
              Termini di servizio
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Questi termini regolano l&apos;uso di {legalProfile.projectName}, una
              piattaforma di raccolta richieste e contatto tra clienti e
              imprese/professionisti.
            </p>
          </header>

          <div className="mt-8 grid gap-5">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Gestore del servizio
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Il servizio e gestito da {getLegalControllerLabel()} per il
                progetto {legalProfile.projectName}.
              </p>
              {legalProfile.legalMode === "business_registered" &&
              legalProfile.businessName ? (
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Ragione sociale: {legalProfile.businessName}.
                </p>
              ) : null}
              {legalProfile.hasVatNumber && legalProfile.vatNumber ? (
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  P.IVA: {legalProfile.vatNumber}.
                </p>
              ) : null}
              {legalProfile.registeredOffice ? (
                <p className="mt-3 text-sm leading-6 text-text-secondary">
                  Sede legale: {legalProfile.registeredOffice}.
                </p>
              ) : null}
              {initialNotice || fiscalNotice ? (
                <p className="mt-4 border-t border-border-primary pt-4 text-sm leading-6 text-text-secondary">
                  {initialNotice ?? fiscalNotice}
                </p>
              ) : null}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Ruolo di Esigenta
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Esigenta raccoglie richieste, le organizza e puo metterle a
                disposizione di imprese o professionisti registrati. Esigenta
                non e l&apos;impresa che svolge il lavoro e non sostituisce accordi,
                preventivi o contratti tra cliente e professionista.
              </p>
            </Card>

            <LegalSection title="Regole per utenti e imprese" items={userRules} />
            <LegalSection title="Limiti del servizio" items={platformLimits} />

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Crediti e pagamenti
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Se i pacchetti crediti sono attivi, prezzo, quantita, durata e
                condizioni operative sono quelli mostrati prima dell&apos;acquisto.
                Il pagamento viene gestito tramite Stripe. I crediti possono
                essere usati secondo le regole della piattaforma e non
                garantiscono automaticamente aggiudicazione di lavori,
                preventivi o contatti conclusivi.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Account impresa
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                L&apos;impresa deve inserire dati corretti e aggiornati. Esigenta puo
                verificare il profilo, limitarne le funzioni, sospenderlo o
                bloccarlo in caso di dati non coerenti, uso improprio o esigenze
                di sicurezza.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Contatti
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Per richieste di supporto o chiarimenti sui termini e possibile
                scrivere a {legalProfile.supportEmail}.
              </p>
            </Card>

            <Card className="bg-surface-secondary p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Nota di revisione
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Documento operativo in bozza. Deve essere revisionato prima del
                lancio commerciale pieno e aggiornato quando saranno disponibili
                dati fiscali, ragione sociale, sede e condizioni definitive dei
                pacchetti.
              </p>
              <p className="mt-3 text-xs text-text-muted">
                Ultimo aggiornamento: {legalProfile.lastUpdated}
              </p>
            </Card>
          </div>
        </article>
      </Container>
    </PublicShell>
  )
}

function LegalSection({
  items,
  title,
}: {
  items: string[]
  title: string
}) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  )
}
