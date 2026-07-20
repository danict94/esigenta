import { ProMarker, ProSectionHeader } from "./pro-primitives";

const steps = [
  {
    number: "01",
    state: "active",
    title: "Ricevi richieste filtrate",
    body: "Solo la tua categoria, solo la tua zona. Ti arriva gia scomposta: cosa serve, dove, con quale urgenza.",
  },
  {
    number: "02",
    state: "idle",
    title: "Sblocchi solo cio che ti serve",
    body: "Leggi l'anteprima, valuti se fa per te, e usi il credito solo sulle richieste che vuoi davvero seguire.",
  },
  {
    number: "03",
    state: "idle",
    title: "Contatti il cliente",
    body: "Recapito diretto, subito. Nessun intermediario che rallenta, nessuna asta.",
  },
  {
    number: "04",
    state: "done",
    title: "Chiudi il lavoro",
    body: "Il lavoro fatto rafforza il tuo profilo verificato e ti porta le prossime richieste, senza rincorrere nessuno.",
  },
] as const;

export function ProFlow() {
  return (
    <section
      className="relative z-[2] mx-auto max-w-[760px] px-12 py-[110px] max-[860px]:px-[22px]"
      aria-labelledby="pro-flow-title"
    >
      <ProSectionHeader
        eyebrow="Come funziona per te"
        title="Quattro passi, zero attriti."
        titleId="pro-flow-title"
      />

      <ol>
        {steps.map((step) => (
          <li key={step.number} className="relative py-[60px] text-center first:pt-0 last:pb-0">
            <span className="eg-index-tag absolute left-1/2 top-3 -translate-x-1/2 text-[11px]">
              {step.number}
            </span>
            <ProMarker state={step.state} />
            <h3 className="text-2xl font-medium leading-[1.2] tracking-[-0.01em]">{step.title}</h3>
            <p className="mx-auto mt-3 max-w-[40ch] text-[15px] leading-[1.6] text-eg-ardesia">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
