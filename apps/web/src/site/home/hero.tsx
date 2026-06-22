import { BadgeCheck, Gift, Lock } from "lucide-react";

import { Container, tokens } from "@esigenta/ui";

import { Navbar } from "../shell/navbar";

import { FunnelEntry } from "./funnel-entry";

const trustRowItems = [
  { Icon: Gift, text: "Richiesta gratuita e senza impegno" },
  { Icon: Lock, text: "I dati arrivano solo ai professionisti che scegli" },
  { Icon: BadgeCheck, text: "Professionisti verificati prima di risponderti" },
] as const;

/**
 * Hero (Phase 20.9E) è responsabile solo di layout/titolo/contenitore
 * grafico. La search — Category -> Service Group -> Service -> Intervention
 * -> Funnel — vive esclusivamente in FunnelEntry, unica implementazione
 * runtime: prima esisteva anche qui una seconda implementazione (legacy,
 * CATEGORY-unaware) che ha causato la regressione percepita in Phase 20.9D.
 */
export function Hero() {
  return (
    <>
      <Navbar />

      <section id="richiedi-preventivo" className={tokens.home.hero.root}>
        <Container size="lg" gutter="md" className={tokens.home.hero.container}>
          <h1 className={tokens.home.hero.title}>
            Trova le migliori offerte
            <br />
            da{" "}
            <span className={tokens.home.hero.titleAccent}>
              professionisti
            </span>{" "}
            nella tua zona
          </h1>

          <p className={tokens.home.hero.question}>
            Di quale intervento hai bisogno?
          </p>

          <div className={tokens.home.hero.searchWrap}>
            <FunnelEntry searchVariant="hero" />
          </div>

          <ul className={tokens.home.hero.trustRow}>
            {trustRowItems.map(({ Icon, text }) => (
              <li key={text} className={tokens.home.hero.trustItem}>
                <Icon className={tokens.home.hero.trustIcon} aria-hidden={true} />
                <span className={tokens.home.hero.trustText}>{text}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
