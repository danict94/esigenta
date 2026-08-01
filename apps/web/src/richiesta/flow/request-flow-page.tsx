import { PublicShell } from "../../site/shell/public-shell";
import { RequestFlowShell } from "./components/request-flow-shell";

import type { JsonRuntimeFunnelPayload } from "./runtime-payload";

type RequestFlowPageProps = {
  interventionSlug: string;
  initialRuntime: JsonRuntimeFunnelPayload;
};

export function RequestFlowPage({
  interventionSlug,
  initialRuntime,
}: RequestFlowPageProps) {
  return (
    <PublicShell navbarVariant="funnel" showFooter={false}>
      <div className="eg-page eg-page-bg">
        <section className="eg-section-large pt-[calc(var(--eg-nav-clear)+44px)]">
          <div className="eg-container">
            <div className="mx-auto w-full max-w-[980px]">
              <header className="max-w-[620px]">
                <p className="eg-eyebrow">Richiesta guidata</p>
                <p className="eg-body-muted mt-4 text-[17px] leading-8">
                  Pochi passaggi per preparare una richiesta chiara e utile.
                </p>
              </header>

              <RequestFlowShell
                interventionSlug={interventionSlug}
                initialRuntime={initialRuntime}
              />
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
