import type { ReactNode } from "react";

import type { CompanyActor } from "@esigenta/auth";
import {
  isCompanyMarketplaceEnabled,
} from "@esigenta/domain";

import { Container } from "@esigenta/ui";

import { requireAreaImpresaAccess } from "../../../auth/server";

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../platform/monitoring/area-monitoring";

import { ImpresaSidebar } from "./impresa-sidebar";
import { getAreaImpresaShellCountsCached } from "./shell-counts-cache";

type CompanyStatus = CompanyActor["company"]["status"];

function getCompanyStatusNotice(status: CompanyStatus) {
  if (status === "PENDING_REVIEW") {
    return "Il tuo profilo impresa è in revisione. Potrai acquistare crediti e usare il marketplace dopo l’approvazione.";
  }

  if (status === "SUSPENDED") {
    return "Il tuo profilo impresa è sospeso. Contatta l’assistenza per maggiori informazioni.";
  }

  if (status === "BLOCKED") {
    return "Il tuo profilo impresa è bloccato. Le funzioni marketplace non sono disponibili.";
  }

  return null;
}

export async function AreaImpresaPrivateLayout({
  children,
}: {
  children: ReactNode;
}) {
  const monitored = isAreaMonitoringEnabled();
  const shellStart = areaTimestamp();

  if (monitored) {
    areaLog("area.shell.start", {});
  }

  const actor = await requireAreaImpresaAccess();

  const countsStart = areaTimestamp();
  const counts = await getAreaImpresaShellCountsCached(actor);
  const countsDurationMs = Math.round(areaTimestamp() - countsStart);

  if (monitored) {
    areaLog("area.shell.end", {
      durationMs: Math.round(areaTimestamp() - shellStart),
      notificationCount: counts.unreadNotificationCount,
      unreadTotal: counts.unreadContactCount + counts.unreadSupportCount,
      shellCountsDurationMs: countsDurationMs,
      usedAuthorizedActorForUnread: true,
    });
  }

  const accountLabel = actor.user.name ?? actor.user.email ?? "Account";
  const companyStatus = actor.company.status;
  const marketplaceEnabled = isCompanyMarketplaceEnabled(companyStatus);
  const statusNotice = getCompanyStatusNotice(companyStatus);

  return (
    <div className="min-h-screen bg-cantiere-paper text-cantiere-ink">
      <ImpresaSidebar
        accountLabel={accountLabel}
        unreadNotificationCount={counts.unreadNotificationCount}
        unreadContactCount={counts.unreadContactCount}
        unreadSupportCount={counts.unreadSupportCount}
        marketplaceEnabled={marketplaceEnabled}
      />
      {statusNotice ? (
        <Container size="xl" className="pt-4">
          <div className="border border-cantiere-hairline bg-cantiere-linen px-4 py-3 text-sm font-medium leading-6 text-cantiere-ink">
            {statusNotice}
          </div>
        </Container>
      ) : null}
      {children}
    </div>
  );
}
