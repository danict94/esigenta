import type { LucideIcon } from "lucide-react";

import { BadgeCheck, Gift, Lock } from "lucide-react";

import { tokens } from "@esigenta/ui";

import { HomeContentRail } from "../shell/home-content-rail";

type ProcessStep = {
  description: string;
  Icon: LucideIcon;
  title: string;
};

const processSteps: ProcessStep[] = [
  {
    title: "Professionisti verificati",
    description:
      "Controlliamo i dati dell'attività e la corrispondenza con la categoria prima che possano rispondere alla tua richiesta.",
    Icon: BadgeCheck,
  },
  {
    title: "I tuoi dati restano tuoi",
    description:
      "Il tuo contatto viene condiviso solo con i professionisti a cui scegli di rispondere, non con l'intero elenco.",
    Icon: Lock,
  },
  {
    title: "Gratuito, senza impegno",
    description:
      "Richiedere un preventivo non costa nulla: sono i professionisti a sostenere il costo per accedere alle richieste.",
    Icon: Gift,
  },
];

export function HowItWorks() {
  return (
    <section
      id="come-funziona-la-trasparenza"
      className={tokens.home.howItWorks.root}
    >
      <HomeContentRail>
        <div className={tokens.home.howItWorks.header}>
          <h2 className={tokens.home.howItWorks.title}>
            Come funziona, in modo trasparente
          </h2>

          <p className={tokens.home.howItWorks.subtitle}>
            Niente recensioni da costruire: solo regole chiare su verifica,
            dati e costi, prima che tu invii una richiesta.
          </p>
        </div>

        <ol className={tokens.home.howItWorks.list}>
          <span
            className={tokens.home.howItWorks.line}
            aria-hidden={true}
          />

          {processSteps.map((step, index) => (
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
