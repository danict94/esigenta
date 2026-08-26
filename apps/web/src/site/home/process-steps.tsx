import { processSteps } from "../shared/process-steps";
import { Reveal } from "../shared/reveal";

// Sezione a ridosso della hero (poco respiro, non zero): l'header (eyebrow +
// H2) e' stato tolto dal design ma resta come H2 sr-only per accessibilita'
// e SEO (la struttura di outline della pagina non deve perdere il livello).
export function ProcessSteps() {
  return (
    <section
      id="processo"
      className="relative z-1 bg-eg-surface pt-16 pb-24 max-[600px]:pt-10 max-[600px]:pb-16"
      aria-labelledby="process-title"
    >
      <h2 id="process-title" className="sr-only">
        Un percorso chiaro, dall&apos;idea alla scelta.
      </h2>

      <div className="eg-container">
        <div className="relative">
          {/* Linea di collegamento orizzontale (solo desktop, min-861px):
              dal centro del primo nodo al centro dell'ultimo. 3 colonne
              uguali senza gap tra loro -> i centri cadono esattamente a
              1/6 e 5/6 della larghezza, qualunque sia il container. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 left-[16.6667%] right-[16.6667%] hidden h-px bg-eg-border min-[861px]:block"
          />

          <ol className="-mb-10 flex flex-col min-[861px]:mb-0 min-[861px]:flex-row">
            {processSteps.map((step, index) => (
              <li key={step.title} className="min-[861px]:flex-1">
                <Reveal
                  delayMs={index * 90}
                  className="relative flex items-start gap-4 pb-10 min-[861px]:flex-col min-[861px]:items-center min-[861px]:gap-0 min-[861px]:px-6 min-[861px]:pb-0 min-[861px]:text-center"
                >
                  {/* Linea di collegamento verticale (solo mobile): usa lo
                      spazio riservato da pb-10 su questo stesso elemento
                      (h-full include il padding) per raggiungere il nodo
                      successivo -> niente calcoli a px, si adatta da solo. */}
                  {index < processSteps.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-3 left-1.5 h-full w-px bg-eg-border min-[861px]:hidden"
                    />
                  ) : null}

                  {/* Nodo: un punto, non un altro numero — "PASSO N" sotto
                      gia' dice qual e' lo step, ripeterlo nel cerchio era
                      rumore. L'alone ring-eg-page "interrompe" la linea
                      dietro al punto invece di farla toccare il bordo. */}
                  <span
                    aria-hidden="true"
                    className="relative z-1 mt-1.5 h-3 w-3 shrink-0 rounded-full bg-eg-brand-hover ring-4 ring-eg-page min-[861px]:mt-0 min-[861px]:mb-5"
                  />

                  <div className="min-[861px]:max-w-[26ch]">
                    <span className="mb-1.5 block font-(family-name:--eg-font-mono) text-[13px] font-bold uppercase tracking-[0.08em] text-eg-accent">
                      {step.marker}
                    </span>
                    <h3 className="eg-h3 mb-2 text-[17px]">{step.title}</h3>
                    <p className="eg-body-muted text-[14.5px] leading-[1.55]">{step.description}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
