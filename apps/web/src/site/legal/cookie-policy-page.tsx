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
    title: "Analytics",
    status: "Disattivati di default",
    description:
      "Abilitano Google Analytics 4, usato per misurare traffico e utilizzo del sito. Lo script non viene caricato prima del consenso analytics.",
  },
  {
    title: "Marketing",
    status: "Disattivati di default",
    description:
      "Abilitano il tracciamento delle conversioni di Google Ads, se configurato per l'ambiente in uso.",
  },
];

export function CookiePolicyPage() {
  return (
    <PublicShell>
      <div className="eg-page eg-page-bg">
        <article className="eg-section-large pt-[calc(var(--eg-nav-clear)+48px)]">
          <div className="eg-container">
            <header className="mx-auto max-w-[760px] text-center">
              <p className="eg-eyebrow">Cookie</p>
              <h1 className="eg-h1 mt-5">Cookie policy.</h1>
              <p className="mx-auto mt-[22px] max-w-[44ch] text-base leading-[1.65] text-eg-text-muted">
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
                  <span className="font-medium text-eg-ink">
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
                    <p className="eg-status-label mt-3">{category.status}</p>
                    <p className="eg-body-muted mt-3">{category.description}</p>
                  </section>
                ))}
              </div>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Google Maps Places</h2>
                <p className="eg-body-muted mt-3">
                  I suggerimenti automatici per indirizzi e citta, usati per
                  indicare dove eseguire un intervento, si basano su Google
                  Maps Places. Lo script viene caricato quando si apre lo
                  step di localizzazione della richiesta, indipendentemente
                  dalle preferenze cookie scelte: e una componente tecnica
                  necessaria per completare una richiesta su Esigenta, non
                  una funzionalita facoltativa legata a una categoria di
                  consenso.
                </p>
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Google Analytics 4</h2>
                <p className="eg-body-muted mt-3">
                  Usiamo Google Analytics 4, fornito da Google, per misurare il
                  traffico e l&apos;utilizzo del sito in forma aggregata. Lo
                  script viene caricato solo dopo che la categoria Analytics
                  viene accettata dal banner o dalle preferenze cookie: prima
                  di quel momento non parte nessuna richiesta verso i domini
                  di Google Analytics. Puoi rifiutare o revocare il consenso
                  in qualsiasi momento dal footer tramite &quot;Preferenze
                  cookie&quot;; dopo la revoca non vengono inviate nuove
                  misurazioni.
                </p>
                <p className="eg-body-muted mt-3">
                  Quando la categoria e attiva, Google Analytics 4 puo
                  impostare cookie come{" "}
                  <span className="font-medium text-eg-ink">_ga</span> e{" "}
                  <span className="font-medium text-eg-ink">
                    _ga_&lt;ID&gt;
                  </span>
                  , usati per distinguere le sessioni di navigazione. Per
                  dettagli sul trattamento dei dati da parte di Google,
                  consulta l&apos;informativa privacy di Google.
                </p>
              </section>

              <section className="eg-panel p-6">
                <h2 className="eg-h3">Marketing e pubblicita</h2>
                <p className="eg-body-muted mt-3">
                  Il codice include il tracciamento delle conversioni di
                  Google Ads: viene attivato solo dopo che la categoria
                  Marketing viene accettata dal banner o dalle preferenze
                  cookie, e solo se una conversione Google Ads e configurata
                  per l&apos;ambiente in uso. Nessun altro pixel di
                  marketing, remarketing o strumento equivalente di
                  profilazione pubblicitaria e presente nel codice attuale.
                  Se in futuro saranno introdotti altri strumenti, dovranno
                  essere dichiarati qui e bloccati fino al consenso della
                  categoria Marketing.
                </p>
              </section>

              <section className="eg-panel bg-eg-surface-muted p-6">
                <h2 className="eg-h3">Aggiornamenti</h2>
                <p className="eg-body-muted mt-3">
                  Questa policy deve essere aggiornata se cambiano servizi
                  terzi, categorie di cookie, finalita o strumenti di
                  tracciamento.
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
