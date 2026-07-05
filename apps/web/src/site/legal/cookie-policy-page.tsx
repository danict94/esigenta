import type { Metadata } from "next";

import { PublicShell } from "../shell/public-shell";
import { legalProfile } from "./legal-profile";

export const metadata: Metadata = {
  title: "Cookie policy | Esigenta",
  description:
    "Cookie policy Esigenta: cookie tecnici, preferenze e servizi funzionali.",
};

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
];

export function CookiePolicyPage() {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <div className="eg-thread" aria-hidden="true" />

        <article className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <header className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Cookie</p>
              <h1 className="eg-h1 mt-5">Cookie policy.</h1>
              <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-ardesia">
                Cookie, preferenze locali e strumenti simili usati da{" "}
                {legalProfile.projectName}. Le preferenze possono essere
                modificate dal footer tramite &quot;Preferenze cookie&quot;.
              </p>
            </header>

            <div className="mx-auto mt-12 grid max-w-[860px] gap-5">
              <section className="eg-panel p-6">
                <h2 className="eg-h3">Preferenza cookie salvata localmente</h2>
                <p className="eg-body-muted mt-3">
                  Esigenta salva nel browser una preferenza locale con chiave{" "}
                  <span className="font-medium text-eg-terra">
                    esigenta_cookie_consent
                  </span>
                  . Questa scelta serve a ricordare se l&apos;utente ha accettato
                  o rifiutato categorie facoltative. Non e un consenso marketing
                  e non viene salvata nel database.
                </p>
              </section>

              <div className="grid gap-5 md:grid-cols-2">
                {cookieCategories.map((category) => (
                  <section key={category.title} className="eg-panel p-6">
                    <h2 className="eg-h3">{category.title}</h2>
                    <p className="eg-mono-label mt-3">{category.status}</p>
                    <p className="eg-body-muted mt-3">{category.description}</p>
                  </section>
                ))}
              </div>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Google Maps Places</h2>
                <p className="eg-body-muted mt-3">
                  I suggerimenti automatici per indirizzi e citta usano Google
                  Maps Places e sono trattati come servizio funzionale opzionale.
                  Lo script non deve essere caricato prima del consenso
                  funzionale o di un&apos;attivazione esplicita tramite
                  preferenze. Se la funzionalita non e abilitata, l&apos;input
                  manuale resta disponibile.
                </p>
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Analytics e marketing</h2>
                <p className="eg-body-muted mt-3">
                  Nel codice attuale non risultano Google Analytics, Meta Pixel,
                  Vercel Analytics, Speed Insights o strumenti equivalenti. Se in
                  futuro saranno introdotti, dovranno essere dichiarati e
                  bloccati fino al consenso della categoria corretta.
                </p>
              </section>

              <section className="eg-panel bg-eg-calce-2 p-6">
                <h2 className="eg-h3">Aggiornamenti</h2>
                <p className="eg-body-muted mt-3">
                  Questa policy deve essere aggiornata se cambiano servizi
                  terzi, categorie di cookie, finalita o strumenti di
                  tracciamento.
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
