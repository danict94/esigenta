import { Check } from "lucide-react";

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
    <span className="flex size-[22px] items-center justify-center rounded-full border border-eg-salvia text-eg-salvia" aria-hidden="true">
      <Check className="size-3" strokeWidth={2.4} />
    </span>
  );
}

export function ProGuarantee() {
  return (
    <section className="relative z-[2] bg-eg-terra px-12 py-[90px] text-eg-calce max-[860px]:px-[22px] max-[860px]:py-[60px]">
      <div className="mx-auto grid max-w-[900px] items-center gap-14 lg:grid-cols-2">
        <div>
          <ProEyebrow tone="light">La garanzia sul credito</ProEyebrow>
          <h2 className="mt-5 text-[clamp(26px,3.2vw,38px)] font-normal leading-[1.15] tracking-[-0.01em]">
            Se il contatto non e valido,
            <br />
            <b className="font-medium text-eg-miele">il credito torna tuo.</b>
          </h2>
          <p className="mt-[18px] text-[15px] leading-[1.65] text-eg-calce/75">
            Il costo del lead e un rischio che ci prendiamo insieme a te, non
            che scarichiamo su di te. Ecco cosa copre la restituzione del
            credito dopo verifica.
          </p>
        </div>

        <div>
          {guarantees.map((item) => (
            <div
              key={item.title}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 border-t border-eg-calce/15 py-5 last:border-b"
            >
              <CheckMark />
              <div>
                <h3 className="text-[15.5px] font-medium leading-[1.35]">{item.title}</h3>
                <p className="mt-1 text-[13.5px] leading-[1.5] text-eg-calce/65">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
