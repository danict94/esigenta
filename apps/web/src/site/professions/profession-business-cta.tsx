import Link from "next/link";
import React from "react";

export type ProfessionBusinessCtaProps = {
  readonly professionName: string;
};

function buildBusinessCtaTitle(professionName: string): string {
  const normalizedName = professionName.trim().toLocaleLowerCase("it");
  const article = normalizedName.startsWith("impresa ") ? "un’" : "un ";

  return `Sei ${article}${normalizedName}?`;
}

export function ProfessionBusinessCta({
  professionName,
}: ProfessionBusinessCtaProps) {
  return (
    <section className="border-y-[0.5px] border-eg-header-border bg-eg-header py-7 text-eg-header-text">
      <div className="eg-container flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div className="max-w-[650px]">
          <h2 className="text-[clamp(23px,3vw,28px)] font-semibold leading-tight tracking-[-0.01em]">
            {buildBusinessCtaTitle(professionName)}
          </h2>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-eg-header-text/75 sm:text-[14px]">
            Fai conoscere la tua attività su Esigenta e ricevi opportunità
            compatibili con i lavori che svolgi.
          </p>
        </div>

        <Link
          href="/area-impresa/iscriviti"
          prefetch={false}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-eg-md bg-eg-header-action px-5 py-3 text-[14px] font-semibold text-eg-header transition-[filter] hover:brightness-105"
        >
          Registrati come professionista <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
