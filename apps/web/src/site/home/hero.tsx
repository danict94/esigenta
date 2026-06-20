import { Container, tokens } from "@esigenta/ui";

import { Navbar } from "../shell/navbar";

import { FunnelEntry } from "./funnel-entry";

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
        </Container>
      </section>
    </>
  );
}
