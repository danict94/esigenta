import type { LucideIcon } from "lucide-react";

import { Scale, ShieldCheck, UsersRound } from "lucide-react";

import { tokens } from "@fixpro/ui";

import { HomeContentRail } from "../layout/home-content-rail";

type SafetyStep = {
  description: string;
  Icon: LucideIcon;
  title: string;
};

const safetySteps: SafetyStep[] = [
  {
    title: "Ricevi più proposte",
    description:
      "Pubblica una sola richiesta e ricevi l’interesse di più professionisti",
    Icon: UsersRound,
  },
  {
    title: "Confronta prima di decidere",
    description:
      "Valuta prezzi, disponibilità ed esperienza in un unico posto.",
    Icon: Scale,
  },
  {
    title: "Scegli con fiducia",
    description:
      "Decidi quando trovi la soluzione più adatta al tuo progetto.",
    Icon: ShieldCheck,
  },
];

export function HowItWorks() {
  return (
    <section
      id="scegli-con-piu-sicurezza"
      className={tokens.home.howItWorks.root}
    >
      <HomeContentRail>
        <div className={tokens.home.howItWorks.header}>
          <h2 className={tokens.home.howItWorks.title}>
            Scegli con più sicurezza
          </h2>

          <p className={tokens.home.howItWorks.subtitle}>
            Confrontare più professionisti ti aiuta a scegliere la soluzione più
            adatta al tuo progetto.
          </p>
        </div>

        <ol className={tokens.home.howItWorks.list}>
          <span
            className={tokens.home.howItWorks.line}
            aria-hidden={true}
          />

          {safetySteps.map((step, index) => (
            <li
              key={step.title}
              className={tokens.home.howItWorks.item}
            >
              <span className={tokens.home.howItWorks.iconFrame}>
                <step.Icon
                  className={tokens.home.howItWorks.icon}
                  aria-hidden={true}
                  strokeWidth={1.7}
                />
              </span>

              <div className={tokens.home.howItWorks.body}>
                <p className={tokens.home.howItWorks.number}>
                  {String(index + 1).padStart(2, "0")}
                </p>

                <h3 className={tokens.home.howItWorks.stepTitle}>
                  {step.title}
                </h3>

                <p className={tokens.home.howItWorks.description}>
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </HomeContentRail>
    </section>
  );
}
