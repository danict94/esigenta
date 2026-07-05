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
  title: "Privacy | Esigenta",
  description:
    "Informativa privacy Esigenta per clienti, imprese e utenti della piattaforma.",
};

const customerData = [
  "nome e cognome",
  "email e telefono",
  "citta, indirizzo e coordinate normalizzate della richiesta",
  "descrizione del lavoro e risposte inserite nel percorso guidato",
  "foto caricate per descrivere la richiesta",
];

const companyData = [
  "dati account del referente",
  "nome impresa o ditta indicata dall'utente",
  "P.IVA inserita dall'impresa, quando fornita",
  "telefono, email, sito web e dati di contatto",
  "sede, citta, indirizzo e raggio operativo",
  "categorie e servizi configurati nell'area impresa",
];

const purposes = [
  "gestire e verificare le richieste inviate dai clienti",
  "mettere in contatto clienti e imprese/professionisti interessati",
  "gestire account, accessi e sicurezza dell'area impresa",
  "gestire acquisto crediti e operazioni collegate ai pagamenti",
  "inviare email transazionali, link di verifica e reset password",
  "prevenire abusi, errori tecnici e utilizzi non autorizzati",
];

const services = [
  "Better Auth: autenticazione, sessioni e gestione accessi.",
  "Stripe: pagamenti e checkout. Esigenta non salva direttamente i dati della carta.",
  "UploadThing: caricamento e gestione tecnica delle foto allegate alle richieste.",
  "Resend: invio di email transazionali e comunicazioni di servizio.",
  "Google Maps Places: suggerimenti automatici per indirizzi e citta, solo previo consenso funzionale o attivazione dell'utente.",
];

export function PrivacyPage() {
  const initialNotice = getInitialPhaseNotice();
  const fiscalNotice = getFiscalUpdateNotice();

  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <article className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <header className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Privacy</p>
              <h1 className="eg-h1 mt-5">Informativa privacy.</h1>
              <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-ardesia">
                Come {legalProfile.projectName} tratta i dati personali raccolti
                tramite sito pubblico, richieste cliente, area impresa,
                pagamenti, upload foto ed email transazionali.
              </p>
            </header>

            <div className="mx-auto mt-12 grid max-w-[860px] gap-5">
              <section className="eg-panel p-6">
                <h2 className="eg-h3">Titolare del trattamento</h2>
                <dl className="eg-body-muted mt-4 grid gap-3">
                  <LegalDefinition label="Progetto" value={legalProfile.projectName} />
                  <LegalDefinition label="Titolare" value={getLegalControllerLabel()} />
                  {legalProfile.legalMode === "business_registered" &&
                  legalProfile.businessName ? (
                    <LegalDefinition label="Ragione sociale" value={legalProfile.businessName} />
                  ) : null}
                  {legalProfile.hasVatNumber && legalProfile.vatNumber ? (
                    <LegalDefinition label="P.IVA" value={legalProfile.vatNumber} />
                  ) : null}
                  {legalProfile.registeredOffice ? (
                    <LegalDefinition label="Sede legale" value={legalProfile.registeredOffice} />
                  ) : null}
                  <LegalDefinition label="Contatto privacy" value={legalProfile.privacyEmail} />
                  {legalProfile.pecEmail ? (
                    <LegalDefinition label="PEC" value={legalProfile.pecEmail} />
                  ) : null}
                </dl>

                {initialNotice || fiscalNotice ? (
                  <p className="eg-body-muted mt-5 border-t border-eg-hairline pt-4">
                    {initialNotice ?? fiscalNotice}
                  </p>
                ) : null}
              </section>

              <LegalSection title="Dati trattati dei clienti" items={customerData} />
              <LegalSection title="Dati trattati delle imprese" items={companyData} />

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Pagamenti e dati tecnici</h2>
                <p className="eg-body-muted mt-3">
                  Per gli acquisti di crediti, il pagamento viene gestito
                  tramite Stripe. Esigenta conserva informazioni operative
                  collegate all&apos;ordine, allo stato del pagamento e ai
                  crediti, ma non salva direttamente i dati completi della carta.
                  Il sito tratta anche dati tecnici necessari a sicurezza,
                  sessioni, log applicativi e funzionamento delle API.
                </p>
              </section>

              <LegalSection title="Finalita del trattamento" items={purposes} />
              <LegalSection title="Servizi terzi utilizzati" items={services} />

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Conservazione dei dati</h2>
                <p className="eg-body-muted mt-3">
                  I tempi di conservazione devono essere definiti e revisionati
                  in base agli obblighi applicabili, alle esigenze di sicurezza,
                  verifica delle richieste, gestione contrattuale e tutela dei
                  diritti. Questa sezione va completata prima del lancio
                  commerciale pieno.
                </p>
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Diritti degli interessati</h2>
                <p className="eg-body-muted mt-3">
                  Gli interessati possono chiedere accesso, rettifica,
                  cancellazione, limitazione, opposizione e portabilita dei dati,
                  nei casi previsti dalla normativa applicabile. Le richieste
                  possono essere inviate a {legalProfile.privacyEmail}.
                </p>
              </section>

              <section className="eg-panel bg-eg-calce-2 p-6">
                <h2 className="eg-h3">Nota di revisione</h2>
                <p className="eg-body-muted mt-3">
                  Documento operativo in bozza. Deve essere revisionato da un
                  professionista prima del lancio commerciale pieno e aggiornato
                  quando saranno disponibili dati fiscali, societari, tempi di
                  conservazione definitivi e ruoli privacy dei fornitori.
                </p>
                <p className="eg-mono-label mt-4">
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

function LegalDefinition({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-eg-terra">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
