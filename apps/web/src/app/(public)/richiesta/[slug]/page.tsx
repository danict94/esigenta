import { Container, tokens } from "@fixpro/ui";

import { RuntimeFunnelRoute } from "../../../../components/funnel/runtime-funnel-route";
import { PublicShell } from "../../../../components/layout/public-shell";

type RequestFunnelPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function RequestFunnelPage({
  params,
  searchParams,
}: RequestFunnelPageProps) {
  const { slug } = await params;
  const { q } = await searchParams;

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

            <RuntimeFunnelRoute interventionSlug={slug} query={q} />
          </div>
        </Container>
      </section>
    </PublicShell>
  );
}
