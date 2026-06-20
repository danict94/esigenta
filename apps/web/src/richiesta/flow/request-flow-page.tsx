import { Container, tokens } from "@esigenta/ui";

import { PublicShell } from "../../site/shell/public-shell";
import { RequestFlowShell } from "./components/request-flow-shell";

type RequestFlowPageProps = {
  interventionSlug: string;
  query?: string;
};

export function RequestFlowPage({
  interventionSlug,
  query,
}: RequestFlowPageProps) {
  return (
    <PublicShell navbarVariant="funnel" showFooter={false}>
      <section className={tokens.funnel.page}>
        <Container size="lg">
          <div className={tokens.funnel.rail}>
            <header className={tokens.funnel.intro}>
              <p className={tokens.funnel.introDescription}>
                Pochi passaggi per preparare una richiesta chiara e utile.
              </p>
            </header>

            <RequestFlowShell interventionSlug={interventionSlug} query={query} />
          </div>
        </Container>
      </section>
    </PublicShell>
  );
}
