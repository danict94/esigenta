import React from "react";
import { BadgeCheck, FileText, ShieldCheck } from "lucide-react";

import type { ProfessionEditorialSection } from "./profession-editorial-content";

export type ProfessionEditorialSectionsProps = {
  readonly sections: readonly ProfessionEditorialSection[];
};

export function ProfessionEditorialSections({
  sections,
}: ProfessionEditorialSectionsProps) {
  if (sections.length === 0) {
    return null;
  }

  const choiceIcons = [ShieldCheck, FileText, BadgeCheck] as const;

  return (
    <section
      aria-label="Approfondimenti sulla professione"
      className="border-t border-eg-border py-10"
      data-profession-editorial-sections=""
    >
      <div className="eg-container grid gap-9 md:grid-cols-2 md:gap-12">
        {sections.map((section) => (
          <article key={section.heading}>
            <h2 className="eg-h2">{section.heading}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="eg-body-muted mt-4">
                {paragraph}
              </p>
            ))}

            {section.items && section.items.length > 0 ? (
              <ul className="mt-4 grid gap-3">
                {section.items.map((item, index) => {
                  const ChoiceIcon = choiceIcons[index % choiceIcons.length]!;
                  const itemKey =
                    typeof item === "string" ? item : item.title;

                  return (
                    <li
                      key={itemKey}
                      className="flex gap-3 text-[14px] leading-[1.55] text-eg-text-muted"
                    >
                      {section.kind === "how-to-choose" ? (
                        <ChoiceIcon
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0 text-eg-brand-strong"
                          strokeWidth={1.8}
                        />
                      ) : null}
                      {typeof item === "string" ? (
                        <span>{item}</span>
                      ) : (
                        <div>
                          <h3 className="font-semibold text-eg-ink">
                            {item.title}
                          </h3>
                          <p className="mt-0.5">{item.description}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
