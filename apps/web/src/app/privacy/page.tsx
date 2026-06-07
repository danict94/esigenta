import type { Metadata } from "next"

import {
  Badge,
  Card,
  Container,
} from "@esigenta/ui"

import { PublicShell } from "../../components/layout/public-shell"
import {
  getFiscalUpdateNotice,
  getInitialPhaseNotice,
  getLegalControllerLabel,
  legalProfile,
} from "../../content/legal/legal-profile"

export const metadata: Metadata = {
  title: "Privacy | Esigenta",
  description:
    "Informativa privacy Esigenta per clienti, imprese e utenti della piattaforma.",
}

const customerData = [
  "nome e cognome",
  "email e telefono",
  "citta, indirizzo e coordinate normalizzate della richiesta",
  "descrizione del lavoro e risposte inserite nel percorso guidato",
  "foto caricate per descrivere la richiesta",
]

const companyData = [
  "dati account del referente",
  "nome impresa o ditta indicata dall'utente",
  "P.IVA inserita dall'impresa, quando fornita",
  "telefono, email, sito web e dati di contatto",
  "sede, citta, indirizzo e raggio operativo",
  "categorie e servizi configurati nell'area impresa",
]

const purposes = [
  "gestire e verificare le richieste inviate dai clienti",
  "mettere in contatto clienti e imprese/professionisti interessati",
  "gestire account, accessi e sicurezza dell'area impresa",
  "gestire acquisto crediti e operazioni collegate ai pagamenti",
  "inviare email transazionali, link di verifica e reset password",
  "prevenire abusi, errori tecnici e utilizzi non autorizzati",
]

const services = [
  "Better Auth: autenticazione, sessioni e gestione accessi.",
  "Stripe: pagamenti e checkout. Esigenta non salva direttamente i dati della carta.",
  "UploadThing: caricamento e gestione tecnica delle foto allegate alle richieste.",
  "Resend: invio di email transazionali e comunicazioni di servizio.",
  "Google Maps Places: suggerimenti automatici per indirizzi e citta, solo previo consenso funzionale o attivazione dell'utente.",
]

export default function PrivacyPage() {
  const initialNotice = getInitialPhaseNotice()
  const fiscalNotice = getFiscalUpdateNotice()

  return (
    <PublicShell>
      <Container size="lg" gutter="md">
        <article className="py-12 md:py-16">
          <header className="max-w-3xl">
            <Badge variant="success">Privacy</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text-primary">
              Informativa privacy
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Questa bozza descrive come {legalProfile.projectName} tratta i
              dati personali raccolti tramite sito pubblico, richieste cliente,
              area impresa, pagamenti, upload foto ed email transazionali.
            </p>
          </header>

          <div className="mt-8 grid gap-5">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Titolare del trattamento
              </h2>
              <dl className="mt-4 grid gap-3 text-sm leading-6 text-text-secondary">
                <div>
                  <dt className="font-medium text-text-primary">Progetto</dt>
                  <dd>{legalProfile.projectName}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-primary">Titolare</dt>
                  <dd>{getLegalControllerLabel()}</dd>
                </div>
                {legalProfile.legalMode === "business_registered" &&
                legalProfile.businessName ? (
                  <div>
                    <dt className="font-medium text-text-primary">
                      Ragione sociale
                    </dt>
                    <dd>{legalProfile.businessName}</dd>
                  </div>
                ) : null}
                {legalProfile.hasVatNumber && legalProfile.vatNumber ? (
                  <div>
                    <dt className="font-medium text-text-primary">P.IVA</dt>
                    <dd>{legalProfile.vatNumber}</dd>
                  </div>
                ) : null}
                {legalProfile.registeredOffice ? (
                  <div>
                    <dt className="font-medium text-text-primary">
                      Sede legale
                    </dt>
                    <dd>{legalProfile.registeredOffice}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="font-medium text-text-primary">
                    Contatto privacy
                  </dt>
                  <dd>{legalProfile.privacyEmail}</dd>
                </div>
                {legalProfile.pecEmail ? (
                  <div>
                    <dt className="font-medium text-text-primary">PEC</dt>
                    <dd>{legalProfile.pecEmail}</dd>
                  </div>
                ) : null}
              </dl>

              {initialNotice || fiscalNotice ? (
                <p className="mt-5 border-t border-border-primary pt-4 text-sm leading-6 text-text-secondary">
                  {initialNotice ?? fiscalNotice}
                </p>
              ) : null}
            </Card>

            <LegalSection title="Dati trattati dei clienti" items={customerData} />
            <LegalSection title="Dati trattati delle imprese" items={companyData} />

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Pagamenti e dati tecnici
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Per gli acquisti di crediti, il pagamento viene gestito tramite
                Stripe. Esigenta conserva informazioni operative collegate
                all&apos;ordine, allo stato del pagamento e ai crediti, ma non salva
                direttamente i dati completi della carta. Il sito tratta anche
                dati tecnici necessari a sicurezza, sessioni, log applicativi e
                funzionamento delle API.
              </p>
            </Card>

            <LegalSection title="Finalita del trattamento" items={purposes} />
            <LegalSection title="Servizi terzi utilizzati" items={services} />

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Conservazione dei dati
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                I tempi di conservazione devono essere definiti e revisionati in
                base agli obblighi applicabili, alle esigenze di sicurezza,
                verifica delle richieste, gestione contrattuale e tutela dei
                diritti. Questa sezione va completata prima del lancio
                commerciale pieno.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Diritti degli interessati
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Gli interessati possono chiedere accesso, rettifica,
                cancellazione, limitazione, opposizione e portabilita dei dati,
                nei casi previsti dalla normativa applicabile. Le richieste
                possono essere inviate a {legalProfile.privacyEmail}.
              </p>
            </Card>

            <Card className="bg-surface-secondary p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Nota di revisione
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Documento operativo in bozza. Deve essere revisionato da un
                professionista prima del lancio commerciale pieno e aggiornato
                quando saranno disponibili dati fiscali, societari, tempi di
                conservazione definitivi e ruoli privacy dei fornitori.
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
