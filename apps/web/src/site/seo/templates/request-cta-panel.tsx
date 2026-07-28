import Link from "next/link";

/**
 * Fase 5.D — sostituisce il vecchio GeoRequestForm: quel form aveva un campo
 * "Comune o città" che il funnel non leggeva (input finto). Il comune si
 * indica DENTRO la richiesta, quindi qui resta solo una CTA onesta.
 */
export type RequestCtaPanelProps = {
  requestHref: string;
  ctaLabel: string;
};

export function RequestCtaPanel({ requestHref, ctaLabel }: RequestCtaPanelProps) {
  return (
    <div className="space-y-5 border border-eg-border bg-eg-surface p-6.5 shadow-eg-slab">
      <div>
        <h3 className="font-(family-name:--eg-font-brand) text-[17px] font-semibold leading-[1.3]">
          Trova professionisti nella tua zona
        </h3>

        <p className="eg-body-muted mt-2 text-[13.5px]">
          Il comune lo indichi durante la richiesta: bastano pochi passaggi.
        </p>
      </div>

      <Link href={requestHref} className="eg-button-primary w-full justify-center">
        {ctaLabel}
      </Link>

      <p className="eg-form-help">
        Gratis, senza impegno. Preventivi da professionisti qualificati.
      </p>
    </div>
  );
}
