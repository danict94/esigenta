import type { Metadata } from "next"

import {
  Badge,
  Card,
  Container,
} from "@esigenta/ui"

import { PublicShell } from "../shell/public-shell"
import { legalProfile } from "./legal-profile"

export const metadata: Metadata = {
  title: "Cookie policy | Esigenta",
  description:
    "Cookie policy Esigenta: cookie tecnici, preferenze e servizi funzionali.",
}

const cookieCategories = [
  {
    title: "Necessari",
    status: "Sempre attivi",
    description:
      "Servono per sicurezza, autenticazione, sessione, funzionamento del sito, gestione richieste e pagamenti avviati dall'utente.",
  },
  {
    title: "Funzionali",
    status: "Disattivati di default",
    description:
      "Permettono funzionalita aggiuntive come i suggerimenti automatici di Google Maps Places per indirizzi e citta.",
  },
  {
    title: "Analytics",
    status: "Non attivi al momento",
    description:
      "Esigenta non usa strumenti analytics nel codice attuale. Se verranno aggiunti, non partiranno prima del consenso.",
  },
  {
    title: "Marketing",
    status: "Non attivi al momento",
    description:
      "Esigenta non usa pixel marketing o profilazione pubblicitaria nel codice attuale.",
  },
]

export function CookiePolicyPage() {
  return (
    <PublicShell>
      <Container size="lg" gutter="md">
        <article className="py-12 md:py-16">
          <header className="max-w-3xl">
            <Badge variant="success">Cookie</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-text-primary">
              Cookie policy
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Questa pagina descrive cookie, preferenze locali e strumenti
              simili usati da {legalProfile.projectName}. Le preferenze possono
              essere modificate dal footer tramite &quot;Preferenze cookie&quot;.
            </p>
          </header>

          <div className="mt-8 grid gap-5">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Preferenza cookie salvata localmente
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Esigenta salva nel browser una preferenza locale con chiave
                <span className="font-medium text-text-primary">
                  {" "}
                  esigenta_cookie_consent
                </span>
                . Questa scelta serve a ricordare se l&apos;utente ha accettato o
                rifiutato categorie facoltative. Non e un consenso marketing e
                non viene salvata nel database.
              </p>
            </Card>

            <div className="grid gap-5 md:grid-cols-2">
              {cookieCategories.map((category) => (
                <Card key={category.title} className="p-6">
                  <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-semibold text-text-primary">
                      {category.title}
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      {category.status}
                    </p>
                    <p className="text-sm leading-6 text-text-secondary">
                      {category.description}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Google Maps Places
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                I suggerimenti automatici per indirizzi e citta usano Google
                Maps Places e sono trattati come servizio funzionale opzionale.
                Lo script non deve essere caricato prima del consenso
                funzionale o di un&apos;attivazione esplicita tramite preferenze.
                Se la funzionalita non e abilitata, l&apos;input manuale resta
                disponibile.
              </p>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Analytics e marketing
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Nel codice attuale non risultano Google Analytics, Meta Pixel,
                Vercel Analytics, Speed Insights o strumenti equivalenti. Se in
                futuro saranno introdotti, dovranno essere dichiarati e bloccati
                fino al consenso della categoria corretta.
              </p>
            </Card>

            <Card className="bg-surface-secondary p-6">
              <h2 className="text-xl font-semibold text-text-primary">
                Aggiornamenti
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                Questa policy deve essere aggiornata se cambiano servizi terzi,
                categorie di cookie, finalita o strumenti di tracciamento.
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
