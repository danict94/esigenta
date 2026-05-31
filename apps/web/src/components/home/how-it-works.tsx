import type { LucideIcon } from "lucide-react";

import { ClipboardList, Handshake, MessagesSquare } from "lucide-react";

import { cn, tokens } from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";

type HowItWorksStep = {
  description: string;
  iconClassName: string;
  Icon: LucideIcon;
  title: string;
};

const steps: HowItWorksStep[] = [
  {
    title: "Descrivi il lavoro",
    description: "Racconta cosa ti serve, aggiungi dettagli, foto e posizione.",
    Icon: ClipboardList,
    iconClassName: "text-accent-step-two",
  },
  {
    title: "Ricevi risposte",
    description:
      "I professionisti interessati valutano la richiesta e ti rispondono.",
    Icon: MessagesSquare,
    iconClassName: "text-accent-step-two",
  },
  {
    title: "Scegli con calma",
    description:
      "Confronta chiarezza, disponibilità e profili prima di decidere.",
    Icon: Handshake,
    iconClassName: "text-action-primary",
  },
];

export function HowItWorks() {
  return (
    <section className={tokens.home.compactSoftSection}>
      <HomeContentRail>
        <div className="mx-auto max-w-3xl text-center">
          <p className={tokens.home.sectionLabel}>
            Come funziona?
          </p>

          <h2 className={cn("mt-2", tokens.home.sectionTitleCompact)}>
            Richiedi in pochi passi, risolvi senza stress.
          </h2>
        </div>

        <div className="mt-8 grid gap-7 md:grid-cols-3 md:gap-6">
          {steps.map((step) => (
            <article
              key={step.title}
              className="flex flex-col items-center text-center"
            >
              <div className="flex size-14 items-center justify-center rounded-lg bg-surface-elevated shadow-card">
                <step.Icon
                  className={cn("size-7", step.iconClassName)}
                  aria-hidden="true"
                  strokeWidth={1.7}
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-text-primary">
                {step.title}
              </h3>

              <p className="mt-2 max-w-xs text-sm leading-6 text-text-secondary">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </HomeContentRail>
    </section>
  );
}
