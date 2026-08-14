// Trattamento eyebrow editoriale condiviso.
// guida in Brand, titolo Primary piu' compatto del default .eg-h2.
// Un solo valore, riusato dalle sezioni editoriali via
// eyebrowClassName/titleClassName — non duplicare questa stringa altrove.
export const blueprintEyebrowClassName =
  "font-(family-name:--eg-font-mono) tracking-[0.14em] text-eg-brand-strong";
export const blueprintEyebrowOnDarkClassName =
  "font-(family-name:--eg-font-mono) text-xs uppercase tracking-[0.14em] text-eg-brand-on-dark";
export const blueprintTitleClassName = "text-[clamp(24px,3.4vw,34px)] leading-[1.22]";

const sectionHeaderAlignment = {
  left: "text-left",
  center: "text-center",
} as const;

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  align: keyof typeof sectionHeaderAlignment;
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
  align,
  id,
  className = "",
  eyebrowClassName = "",
  titleClassName = "",
}: SectionHeaderProps) {
  const alignment = sectionHeaderAlignment[align];

  return (
    <div className={[alignment, className].filter(Boolean).join(" ")}>
      <p
        className={["eg-eyebrow", eyebrowClassName].filter(Boolean).join(" ")}
      >
        {eyebrow}
      </p>
      <h2 id={id} className={["eg-h2 mt-4", titleClassName].filter(Boolean).join(" ")}>
        {title}
      </h2>
    </div>
  );
}
