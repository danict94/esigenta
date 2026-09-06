import React from "react";

import type { ProfessionEditorialIntro as ProfessionEditorialIntroData } from "./profession-editorial-content";

export type ProfessionEditorialIntroProps = {
  readonly intro: ProfessionEditorialIntroData | null;
};

export function ProfessionEditorialIntro({
  intro,
}: ProfessionEditorialIntroProps) {
  if (!intro || intro.paragraphs.length === 0) {
    return null;
  }

  return (
    <section data-profession-editorial-intro="">
      <div className="eg-container">
        <div className="grid max-w-[760px] gap-5 pb-12">
          {intro.paragraphs.map((paragraph) => (
            <p key={paragraph} className="eg-body-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
