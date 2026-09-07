import React from "react";

import { InternalPageFinalCta } from "../shared/internal-page-final-cta";

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
    <InternalPageFinalCta
      title={buildBusinessCtaTitle(professionName)}
      description="Fai conoscere la tua attività su Esigenta e ricevi opportunità compatibili con i lavori che svolgi."
      href="/area-impresa/iscriviti"
      ctaLabel="Registrati come professionista"
    />
  );
}
