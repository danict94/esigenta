import { cn } from "@esigenta/ui";

import { blueprintTitleClassName } from "../../../site/shared/section-header";
import { ProCheckIcon } from "./pro-icons";
import { ProEyebrow } from "./pro-primitives";

const guarantees = [
  {
    title: "Numero inesistente o irraggiungibile",
    body: "Se il recapito non e reale, segnali e il credito rientra dopo verifica.",
  },
  {
    title: "Richiesta duplicata",
    body: "Stesso cliente, stesso lavoro arrivato due volte: non deve costarti due volte.",
  },
  {
    title: "Lavoro fuori categoria o zona",
    body: "Se la richiesta non compete davvero al tuo profilo, puoi richiedere controllo.",
  },
  {
    title: "Credito sempre visibile",
    body: "Consumo trasparente nell'area impresa: sai dove va ogni credito.",
  },
] as const;

function CheckMark() {
  return (
    <span
      className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-eg-success text-eg-on-brand"
      aria-hidden="true"
    >
      <ProCheckIcon className="size-3" />
    </span>
  );
}

export function ProGuarantee() {
  return (
    <section
      className="relative z-2 overflow-hidden bg-eg-ink py-22 text-eg-on-brand"
      aria-labelledby="pro-guarantee-title"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-65 -right-35 size-130 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--eg-color-brand) 28%, transparent), transparent 70%)",
        }}
      />

      <div className="eg-container relative">
        <div className="mb-12 max-w-155">
          <ProEyebrow>La garanzia sul credito</ProEyebrow>
          <h2 id="pro-guarantee-title" className={cn(blueprintTitleClassName, "mt-3.5 text-eg-on-brand")}>
            Se il contatto non e valido, il credito torna tuo.
          </h2>
          <p className="mt-3.5 max-w-140 text-[15px] leading-[1.6] text-eg-on-brand-muted">
            Il costo del lead e un rischio che ci prendiamo insieme a te, non
            che scarichiamo su di te. Ecco cosa copre la restituzione del
            credito dopo verifica.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-px border border-eg-on-brand-border bg-eg-on-brand-border min-[861px]:grid-cols-2">
          {guarantees.map((item) => (
            <div
              key={item.title}
              className="flex gap-3.5 bg-eg-ink px-7 py-6.5 transition-colors duration-250 ease-(--eg-ease-brand) hover:bg-[color-mix(in_srgb,var(--eg-color-ink)_88%,white)]"
            >
              <CheckMark />
              <div>
                <h3 className="font-(family-name:--eg-font-brand) text-[14.5px] font-semibold leading-[1.35]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-normal text-eg-on-brand-muted">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
