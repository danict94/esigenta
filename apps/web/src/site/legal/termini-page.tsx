import type { Metadata } from "next";

import { PublicShell } from "../shell/public-shell";
import {
  getFiscalUpdateNotice,
  getInitialPhaseNotice,
  getLegalControllerLabel,
  legalProfile,
} from "./legal-profile";
import { LegalSection } from "./legal-section";

export const metadata: Metadata = {
  title: "Termini di servizio | Esigenta",
  description:
    "Termini di servizio Esigenta per clienti, imprese e professionisti.",
};

const userRules = [
  "clienti e imprese devono fornire dati corretti, aggiornati e non ingannevoli",
  "le richieste devono descrivere interventi reali e non contenere contenuti illeciti o offensivi",
  "le imprese devono usare l'area riservata nel rispetto delle regole della piattaforma",
  "le credenziali di accesso devono essere custodite con attenzione",
];

const platformLimits = [
  "Esigenta non esegue direttamente i lavori richiesti",
  "imprese e professionisti sono soggetti terzi e autonomi",
  "Esigenta non garantisce disponibilita, numero di preventivi o conclusione del lavoro",
  "preventivi, sopralluoghi, contratti e lavori restano sotto responsabilita delle parti coinvolte",
];

export function TerminiPage() {
  const initialNotice = getInitialPhaseNotice();
  const fiscalNotice = getFiscalUpdateNotice();

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <article className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <header className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Termini</p>
              <h1 className="eg-h1 mt-5">Termini di servizio.</h1>
              <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-ardesia">
                Le regole d&apos;uso di {legalProfile.projectName}, piattaforma di
                raccolta richieste e contatto tra clienti e
                imprese/professionisti.
              </p>
            </header>

            <div className="mx-auto mt-12 grid max-w-[860px] gap-5">
              <section className="eg-panel p-6">
                <h2 className="eg-h3">Gestore del servizio</h2>
                <p className="eg-body-muted mt-3">
                  Il servizio e gestito da {getLegalControllerLabel()} per il
                  progetto {legalProfile.projectName}.
                </p>
                {legalProfile.legalMode === "business_registered" &&
                legalProfile.businessName ? (
                  <p className="eg-body-muted mt-3">
                    Ragione sociale: {legalProfile.businessName}.
                  </p>
                ) : null}
                {legalProfile.hasVatNumber && legalProfile.vatNumber ? (
                  <p className="eg-body-muted mt-3">
                    P.IVA: {legalProfile.vatNumber}.
                  </p>
                ) : null}
                {legalProfile.registeredOffice ? (
                  <p className="eg-body-muted mt-3">
                    Sede legale: {legalProfile.registeredOffice}.
                  </p>
                ) : null}
                {initialNotice || fiscalNotice ? (
                  <p className="eg-body-muted mt-4 border-t border-eg-hairline pt-4">
                    {initialNotice ?? fiscalNotice}
                  </p>
                ) : null}
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Ruolo di Esigenta</h2>
                <p className="eg-body-muted mt-3">
                  Esigenta raccoglie richieste, le organizza e puo metterle a
                  disposizione di imprese o professionisti registrati. Esigenta
                  non e l&apos;impresa che svolge il lavoro e non sostituisce
                  accordi, preventivi o contratti tra cliente e professionista.
                </p>
              </section>

              <LegalSection title="Regole per utenti e imprese" items={userRules} />
              <LegalSection title="Limiti del servizio" items={platformLimits} />

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Crediti e pagamenti</h2>
                <p className="eg-body-muted mt-3">
                  Se i pacchetti crediti sono attivi, prezzo, quantita, durata e
                  condizioni operative sono quelli mostrati prima
                  dell&apos;acquisto. Il pagamento viene gestito tramite Stripe.
                  I crediti possono essere usati secondo le regole della
                  piattaforma e non garantiscono automaticamente aggiudicazione
                  di lavori, preventivi o contatti conclusivi.
                </p>
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Account impresa</h2>
                <p className="eg-body-muted mt-3">
                  L&apos;impresa deve inserire dati corretti e aggiornati.
                  Esigenta puo verificare il profilo, limitarne le funzioni,
                  sospenderlo o bloccarlo in caso di dati non coerenti, uso
                  improprio o esigenze di sicurezza.
                </p>
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Contatti</h2>
                <p className="eg-body-muted mt-3">
                  Per richieste di supporto o chiarimenti sui termini e
                  possibile scrivere a {legalProfile.supportEmail}.
                </p>
              </section>

              <section className="eg-panel bg-eg-calce-2 p-6">
                <h2 className="eg-h3">Nota di revisione</h2>
                <p className="eg-body-muted mt-3">
                  Documento operativo in bozza. Deve essere revisionato prima del
                  lancio commerciale pieno e aggiornato quando saranno
                  disponibili dati fiscali, ragione sociale, sede e condizioni
                  definitive dei pacchetti.
                </p>
                <p className="eg-doc-meta mt-4">
                  Ultimo aggiornamento: {legalProfile.lastUpdated}
                </p>
              </section>
            </div>
          </div>
        </article>
      </div>
    </PublicShell>
  );
}
