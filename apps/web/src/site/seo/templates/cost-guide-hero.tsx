import { blueprintEyebrowClassName } from "../../shared/section-header";

/**
 * Blocco prezzo dell'Hero. Renderizzato come `afterTitle` di
 * `InternalPageIntro`, SUBITO dopo l'H1 e PRIMA di descrizione/CTA/immagine:
 * il prezzo deve leggersi come risposta diretta alla domanda del titolo
 * ("Quanto costa...?"), non come un blocco che arriva dopo aver attraversato
 * testo e pulsanti (fix UI review). Nessun margine proprio: lo decide il
 * chiamante (vedi cost-page-template.tsx), per restare compatto e vicino
 * all'H1 senza appesantire l'Hero con altezza aggiuntiva.
 *
 * Tre varianti, decise dai dati esistenti (nessun campo nuovo):
 * - `pricingTeaser` presente → guida senza prezzi ancora verificati: stesso
 *   comportamento di sempre, nessun price-highlight.
 * - `nationalRange` numerico (contiene "€") → UN SOLO prezzo grande, il
 *   costo al mq NON compare qui (si trova nella sezione Riferimenti).
 * - `nationalRange` non numerico (es. impermeabilizzare-tetto: "Nessun
 *   totale complessivo…") → frase informativa in corpo normale, MAI con lo
 *   stile tipografico di un prezzo vero.
 */
export type CostGuideHeroProps = {
  nationalRange?: string;
  nationalRangeLabel?: string;
  nationalRangeNote?: string;
  pricingTeaser?: string;
};

function hasNumericNationalRange(nationalRange: string | undefined): boolean {
  return Boolean(nationalRange && nationalRange.includes("€"));
}

export function CostGuideHero({
  nationalRange,
  nationalRangeLabel,
  nationalRangeNote,
  pricingTeaser,
}: CostGuideHeroProps) {
  if (pricingTeaser) {
    return (
      <div className="mt-4 max-w-170 border border-eg-border bg-eg-surface px-6.5 py-7">
        <p className="text-[14.5px] leading-[1.6] text-eg-ink">{pricingTeaser}</p>
      </div>
    );
  }

  if (hasNumericNationalRange(nationalRange)) {
    return (
      <div className="mt-3 max-w-170">
        {nationalRangeLabel ? (
          <p className={blueprintEyebrowClassName}>{nationalRangeLabel}</p>
        ) : null}

        <p
          className={`${nationalRangeLabel ? "mt-2" : ""} font-(family-name:--eg-font-primary) text-[clamp(32px,5.6vw,48px)] font-bold leading-[1.05] text-eg-brand-strong [font-variant-numeric:tabular-nums]`}
        >
          {nationalRange}
        </p>

        {nationalRangeNote ? (
          <p className="mt-3.5 max-w-155 text-[14px] leading-[1.6] text-eg-ink">{nationalRangeNote}</p>
        ) : null}
      </div>
    );
  }

  // Nessun totale numerico (es. impermeabilizzare-tetto, sourceType
  // "official"): frase informativa in corpo normale, mai un falso
  // price-highlight.
  return (
    <div className="mt-3 max-w-170">
      {nationalRangeLabel ? (
        <p className={blueprintEyebrowClassName}>{nationalRangeLabel}</p>
      ) : null}

      {nationalRange ? (
        <p className="mt-2.5 max-w-160 text-[16px] font-medium leading-[1.5] text-eg-ink">
          {nationalRange}
        </p>
      ) : null}

      {nationalRangeNote ? (
        <p className="mt-3 max-w-155 text-[14px] leading-[1.6] text-eg-text-muted">{nationalRangeNote}</p>
      ) : null}
    </div>
  );
}
