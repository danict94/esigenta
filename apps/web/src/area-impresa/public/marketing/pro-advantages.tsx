import {
  BadgeCheck,
  CreditCard,
  RotateCcw,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { ProSectionHeader } from "./pro-primitives";

type Advantage = {
  index: string;
  title: string;
  body: string;
  badgeClassName: string;
  iconClassName: string;
  glyph: LucideIcon;
};

const advantages: Advantage[] = [
  {
    index: "01",
    title: "Lead verificati, non curiosi",
    body: "Ogni richiesta passa per identita e reale intenzione. Chi scrive vuole davvero fare il lavoro: niente perditempo, niente numeri falsi.",
    badgeClassName: "bg-eg-cotto-tint",
    iconClassName: "text-eg-cotto-dark",
    glyph: BadgeCheck,
  },
  {
    index: "02",
    title: "Credito rimborsato sui lead non validi",
    body: "Numero inesistente, richiesta doppia o fuori zona? Segnali il contatto e ti restituiamo il credito.",
    badgeClassName: "bg-eg-salvia/15",
    iconClassName: "text-eg-salvia",
    glyph: RotateCcw,
  },
  {
    index: "03",
    title: "Paghi solo il contatto reale",
    body: "Nessun abbonamento obbligatorio, nessun canone fisso. Ricarichi il credito quando vuoi e lo consumi solo sui contatti che decidi di sbloccare.",
    badgeClassName: "bg-eg-miele-tint",
    iconClassName: "text-eg-miele",
    glyph: CreditCard,
  },
  {
    index: "04",
    title: "Zona protetta, non guerra al ribasso",
    body: "Limitiamo quanti professionisti ricevono la stessa richiesta. Il cliente confronta poche proposte serie.",
    badgeClassName: "bg-eg-terra/10",
    iconClassName: "text-eg-terra",
    glyph: UsersRound,
  },
];

export function ProAdvantages() {
  return (
    <section
      className="relative z-[2] mx-auto max-w-[1120px] px-12 pb-10 pt-[120px] max-[860px]:px-[22px]"
      aria-labelledby="pro-advantages-title"
    >
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

      <div className="grid grid-cols-2 gap-px border border-eg-hairline bg-eg-hairline max-[860px]:grid-cols-1">
        {advantages.map(({ index, title, body, badgeClassName, iconClassName, glyph: Glyph }) => (
          <article key={index} className="relative min-h-[200px] overflow-hidden bg-eg-calce px-[34px] py-[38px]">
            <span className="absolute right-[34px] top-[30px] font-mono text-xs text-eg-ardesia-2">
              {index}
            </span>
            <div className={["mb-5 flex size-[34px] items-center justify-center rounded-full", badgeClassName].join(" ")}>
              <Glyph className={["size-[18px]", iconClassName].join(" ")} strokeWidth={1.8} />
            </div>
            <h3 className="text-xl font-medium leading-[1.2] tracking-[-0.01em]">{title}</h3>
            <p className="mt-3 max-w-[42ch] text-[14.5px] leading-[1.6] text-eg-ardesia">
              {body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
