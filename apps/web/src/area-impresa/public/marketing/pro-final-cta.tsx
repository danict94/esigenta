import Link from "next/link";

import { ProCheckIcon } from "./pro-icons";
import { ProEyebrow } from "./pro-primitives";

const finalCtaMeta = [
  "Registrazione gratuita",
  "Verifica P.IVA",
  "Credito solo quando vuoi",
] as const;

export function ProFinalCta() {
  return (
    <>
      <section id="registrati" className="relative z-2 py-22" aria-labelledby="pro-final-title">
        <div className="eg-container">
          <div className="max-w-140">
            <ProEyebrow>Inizia ora</ProEyebrow>
            <h2
              id="pro-final-title"
              className="mt-3.5 mb-3.5 font-(family-name:--eg-font-brand) text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.2]"
            >
              Attiva il tuo profilo <span className="text-eg-accent">in pochi minuti.</span>
            </h2>
            <p className="mb-7.5 text-[15.5px] leading-[1.6] text-eg-text-muted">
              Verifichiamo P.IVA e requisiti, poi iniziano ad arrivare le richieste.
              Nessun costo per registrarsi.
            </p>
            <Link href="#inizia" className="eg-button-primary inline-flex">
              Crea il profilo professionista <span aria-hidden="true">&rarr;</span>
            </Link>

            <ul className="mt-4.5 flex flex-wrap items-center gap-x-5.5 gap-y-2">
              {finalCtaMeta.map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-1.5 font-(family-name:--eg-font-brand) text-xs text-eg-text-muted"
                >
                  <ProCheckIcon className="size-3.5 text-eg-success" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <footer className="relative z-2 border-t border-eg-border py-7 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.08em] text-eg-text-muted">
        <div className="eg-container flex flex-wrap justify-between gap-2.5">
          <span>&copy; 2026 Esigenta / Pro</span>
          <span>Il lavoro giusto, gia organizzato</span>
        </div>
      </footer>
    </>
  );
}
