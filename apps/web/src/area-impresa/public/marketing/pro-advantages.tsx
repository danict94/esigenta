import type { ComponentType, SVGProps } from "react";

import { cn } from "@esigenta/ui";

import {
  ProQualityIcon,
  ProReturnIcon,
  ProTimeIcon,
  ProUsersIcon,
} from "./pro-icons";
import { ProSectionHeader } from "./pro-primitives";

type Advantage = {
  index: string;
  title: string;
  body: string;
  badgeClassName: string;
  iconClassName: string;
  glyph: ComponentType<SVGProps<SVGSVGElement>>;
};

const advantages: Advantage[] = [
  {
    index: "01",
    title: "Lead verificati, non curiosi",
    body: "Ogni richiesta passa per identita e reale intenzione. Chi scrive vuole davvero fare il lavoro: niente perditempo, niente numeri falsi.",
    badgeClassName: "bg-eg-brand-soft",
    iconClassName: "text-eg-brand-strong",
    glyph: ProQualityIcon,
  },
  {
    index: "02",
    title: "Credito rimborsato sui lead non validi",
    body: "Numero inesistente, richiesta doppia o fuori zona? Segnali il contatto e ti restituiamo il credito.",
    badgeClassName: "bg-eg-brand-soft",
    iconClassName: "text-eg-brand-strong",
    glyph: ProReturnIcon,
  },
  {
    index: "03",
    title: "Paghi solo il contatto reale",
    body: "Nessun abbonamento obbligatorio, nessun canone fisso. Ricarichi il credito quando vuoi e lo consumi solo sui contatti che decidi di sbloccare.",
    badgeClassName: "bg-eg-brand-soft",
    iconClassName: "text-eg-brand-strong",
    glyph: ProTimeIcon,
  },
  {
    index: "04",
    title: "Zona protetta, non guerra al ribasso",
    body: "Limitiamo quanti professionisti ricevono la stessa richiesta. Il cliente confronta poche proposte serie.",
    badgeClassName: "bg-eg-brand-soft",
    iconClassName: "text-eg-brand-strong",
    glyph: ProUsersIcon,
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

      <div className="grid grid-cols-2 gap-px border border-eg-border bg-eg-border max-[860px]:grid-cols-1">
        {advantages.map(({ index, title, body, badgeClassName, iconClassName, glyph: Glyph }) => (
          <article key={index} className="relative min-h-[200px] overflow-hidden bg-eg-surface px-[34px] py-[38px]">
            <span className="eg-index-tag absolute right-[34px] top-[30px] text-xs">
              {index}
            </span>
            <div className={cn("mb-5 flex size-[34px] items-center justify-center rounded-full", badgeClassName)}>
              <Glyph className={cn("size-[18px]", iconClassName)} />
            </div>
            <h3 className="text-xl font-medium leading-[1.2] tracking-[-0.01em]">{title}</h3>
            <p className="mt-3 max-w-[42ch] text-[14.5px] leading-[1.6] text-eg-text-muted">
              {body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
