import { ProSectionHeader } from "./pro-primitives";

const steps = [
  {
    number: "01",
    title: "Ricevi richieste filtrate",
    body: "Solo la tua categoria, solo la tua zona. Ti arriva gia scomposta: cosa serve, dove, con quale urgenza.",
  },
  {
    number: "02",
    title: "Sblocchi solo cio che ti serve",
    body: "Leggi l'anteprima, valuti se fa per te, e usi il credito solo sulle richieste che vuoi davvero seguire.",
  },
  {
    number: "03",
    title: "Contatti il cliente",
    body: "Recapito diretto, subito. Nessun intermediario che rallenta, nessuna asta.",
  },
  {
    number: "04",
    title: "Chiudi il lavoro",
    body: "Il lavoro fatto rafforza il tuo profilo verificato e ti porta le prossime richieste, senza rincorrere nessuno.",
  },
] as const;

export function ProFlow() {
  return (
    <section className="relative z-2 py-22" aria-labelledby="pro-flow-title">
      <div className="eg-container">
        <ProSectionHeader
          eyebrow="Come funziona per te"
          title="Quattro passi, zero attriti."
          titleId="pro-flow-title"
        />

        <ol className="relative grid grid-cols-1 gap-y-7 min-[861px]:grid-cols-4 min-[861px]:gap-y-0">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-[9%] top-4.75 hidden h-px min-[861px]:block"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--eg-color-border) 0 6px, transparent 6px 12px)",
            }}
          />
          {steps.map((step) => (
            <li key={step.number} className="relative px-4 text-left">
              <span className="relative z-1 mb-4.5 flex size-9.5 items-center justify-center rounded-full border-2 border-eg-brand-strong bg-eg-surface font-(family-name:--eg-font-brand) text-sm font-bold text-eg-brand-strong">
                {step.number}
              </span>
              <h3 className="font-(family-name:--eg-font-brand) text-[15px] font-semibold leading-[1.3]">
                {step.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-eg-text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
