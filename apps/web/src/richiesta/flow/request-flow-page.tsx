import { Container } from "@esigenta/ui";

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
      <section className={"pb-20 pt-(--fp-nav-clear) md:pb-28 lg:pb-32"}>
        <Container size="lg">
          <div className={"mx-auto w-full max-w-[1120px]"}>
            <header className={"space-y-5"}>
              <p className="text-[17px] leading-[1.5] text-cantiere-ink-secondary">
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
