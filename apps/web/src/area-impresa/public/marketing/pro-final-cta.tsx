import Link from "next/link";

import { ProEyebrow } from "./pro-primitives";

export function ProFinalCta() {
  return (
    <>
      <section
        id="registrati"
        className="relative z-[2] mx-auto max-w-[680px] px-12 py-[110px] text-center max-[860px]:px-[22px]"
        aria-labelledby="pro-final-title"
      >
        <ProEyebrow>Inizia ora</ProEyebrow>
        <h2
          id="pro-final-title"
          className="mt-[18px] text-[clamp(28px,3.6vw,44px)] font-normal leading-[1.1] tracking-[-0.02em]"
        >
          Attiva il tuo profilo
          <br />
          <b className="font-semibold text-eg-cotto-dark">in pochi minuti.</b>
        </h2>
        <p className="mx-auto mt-[18px] max-w-[40ch] text-base leading-[1.6] text-eg-ardesia">
          Verifichiamo P.IVA e requisiti, poi iniziano ad arrivare le richieste.
          Nessun costo per registrarsi.
        </p>
        <Link href="#inizia" className="eg-button-primary mt-8">
          Crea il profilo professionista <span aria-hidden="true">&rarr;</span>
        </Link>
        <small className="mt-[18px] block font-mono text-[11.5px] text-eg-ardesia-2">
          Registrazione gratuita &middot; Verifica P.IVA &middot; Credito solo quando vuoi
        </small>
      </section>

      <footer className="relative z-[2] flex justify-between gap-6 border-t border-eg-hairline px-12 py-[34px] font-mono text-[11.5px] uppercase tracking-[0.08em] text-eg-ardesia-2 max-[860px]:flex-col max-[860px]:px-[22px]">
        <span>&copy; 2026 Esigenta / Pro</span>
        <span>Il lavoro giusto, gia organizzato</span>
      </footer>
    </>
  );
}
