import Link from "next/link";

import { ProCheckIcon } from "./pro-icons";
const finalCtaMeta = [
  "Registrazione gratuita",
  "Verifica P.IVA",
  "Credito solo quando vuoi",
] as const;

export function ProFinalCta() {
  return (
    <aside
      id="registrati"
      className="mt-14 border-t border-eg-on-brand-border pt-12"
      aria-labelledby="pro-final-title"
    >
      <div className="max-w-155">
        <h2 id="pro-final-title" className="eg-h2">
          Pronto a ricevere richieste piu adatte al tuo lavoro?
        </h2>
        <p className="eg-body mt-4 max-w-140 text-eg-on-brand-muted">
          Configura gratuitamente categoria e zona operativa. Verificheremo i
          requisiti prima di attivare il profilo.
        </p>
        <Link href="#inizia" className="eg-button-primary eg-button-arrow mt-7">
          Crea il profilo professionista
        </Link>

        <ul className="mt-5 flex flex-wrap items-center gap-x-5.5 gap-y-2">
          {finalCtaMeta.map((label) => (
            <li key={label} className="flex items-center gap-1.5 text-xs text-eg-on-brand-muted">
              <ProCheckIcon className="size-3.5 text-eg-success" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
