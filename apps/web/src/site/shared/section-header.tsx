// Trattamento "tavola tecnica" (docs/index.md): eyebrow mono con lineetta
// guida in Brand, titolo mono/semibold piu' compatto del default .eg-h2.
// Un solo valore, riusato da Processo, Lavori e Servizi via
// eyebrowClassName/titleClassName — non duplicare questa stringa altrove.
export const blueprintEyebrowClassName =
  "flex items-center gap-[10px] font-(family-name:--eg-font-brand) tracking-[0.14em] text-eg-brand before:inline-block before:h-px before:w-[22px] before:bg-eg-brand before:content-['']";
export const blueprintTitleClassName = "text-[clamp(24px,3.4vw,34px)] font-semibold leading-[1.22]";

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  id?: string;
  className?: string;
  // Override puntuali per una singola istanza (es. dimensioni titolo o
  // trattamento eyebrow diversi dal default condiviso), senza toccare le
  // classi .eg-eyebrow/.eg-h2 usate da tutte le altre chiamate.
  eyebrowClassName?: string;
  titleClassName?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  id,
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
}: SectionHeaderProps) {
  return (
    <div className={["text-center", className].filter(Boolean).join(" ")}>
      <p className={["eg-eyebrow", eyebrowClassName].filter(Boolean).join(" ")}>{eyebrow}</p>
      <h2 id={id} className={["eg-h2 mt-4", titleClassName].filter(Boolean).join(" ")}>
        {title}
      </h2>
    </div>
  );
}
