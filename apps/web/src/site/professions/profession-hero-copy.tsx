import React from "react";

import type { ProfessionEditorialIntro } from "./profession-editorial-content";

export type ProfessionHeroCopyProps = {
  readonly intro: ProfessionEditorialIntro;
};

export function ProfessionHeroCopy({ intro }: ProfessionHeroCopyProps) {
  return (
    <div className="mt-4 max-w-[580px]" data-profession-hero-copy="">
      {intro.lead ? (
        <p className="text-[15.5px] font-medium leading-[1.48] text-eg-ink sm:text-[17px]">
          {intro.lead}
        </p>
      ) : null}

      {intro.paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className={`${intro.lead ? "mt-2" : ""} text-[13.5px] leading-[1.5] text-eg-text-muted sm:text-[14px]`}
        >
          {paragraph}
        </p>
      ))}

      {intro.note ? (
        <p className="mt-2.5 text-[12.5px] leading-[1.5] text-eg-text-muted sm:text-[13px]">
          {intro.note}
        </p>
      ) : null}
    </div>
  );
}
