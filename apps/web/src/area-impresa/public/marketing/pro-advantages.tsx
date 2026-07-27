import { ProSectionHeader } from "./pro-primitives";

type Advantage = {
  index: string;
  title: string;
  body: string;
};

const advantages: Advantage[] = [
  {
    index: "01",
    title: "Lead verificati, non curiosi",
    body: "Ogni richiesta passa per identita e reale intenzione. Chi scrive vuole davvero fare il lavoro: niente perditempo, niente numeri falsi.",
  },
  {
    index: "02",
    title: "Credito rimborsato sui lead non validi",
    body: "Numero inesistente, richiesta doppia o fuori zona? Segnali il contatto e ti restituiamo il credito.",
  },
  {
    index: "03",
    title: "Paghi solo il contatto reale",
    body: "Nessun abbonamento obbligatorio, nessun canone fisso. Ricarichi il credito quando vuoi e lo consumi solo sui contatti che decidi di sbloccare.",
  },
  {
    index: "04",
    title: "Zona protetta, non guerra al ribasso",
    body: "Limitiamo quanti professionisti ricevono la stessa richiesta. Il cliente confronta poche proposte serie.",
  },
];

export function ProAdvantages() {
  return (
    <section className="relative z-2 py-22" aria-labelledby="pro-advantages-title">
      <div className="eg-container">
        <ProSectionHeader
          eyebrow="Perche Esigenta"
          title={
            <>
              Costruita per chi lavora,
              <br />
              non per chi vende lead.
            </>
          }
          titleId="pro-advantages-title"
        />

        <div className="grid grid-cols-1 gap-px border border-eg-border bg-eg-border min-[601px]:grid-cols-2 min-[861px]:grid-cols-4">
          {advantages.map(({ index, title, body }) => (
            <article
              key={index}
              className="relative bg-eg-surface px-6.5 py-7.5 transition-shadow duration-250 ease-(--eg-ease-brand) hover:z-1 hover:shadow-eg-step"
            >
              <span className="mb-4 block font-(family-name:--eg-font-brand) text-xs font-bold text-eg-accent">
                {index}
              </span>
              <h3 className="font-(family-name:--eg-font-brand) text-[15.5px] font-semibold leading-[1.3]">
                {title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-[1.55] text-eg-text-muted">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
