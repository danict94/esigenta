import type { ReactNode } from "react";

import type { CompanyActor } from "@esigenta/auth";
import {
  deriveCompanyRequestAccess,
  isCompanyMarketplaceEnabled,
} from "@esigenta/domain";

import { Container } from "@esigenta/ui";

import { requireAreaImpresaAccess } from "../../../auth/server";

import {
  areaLog,
  areaTimestamp,
  isAreaMonitoringEnabled,
} from "../../../platform/monitoring/area-monitoring";

import { ImpresaHeader } from "./impresa-header";
import { getAreaImpresaShellCountsCached } from "./shell-counts-cache";
import { getCompanyCreditSummaryCached } from "./credit-summary-cache";

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
  const [counts, creditSummary] = await Promise.all([
    getAreaImpresaShellCountsCached(actor),
    getCompanyCreditSummaryCached(actor.company.id),
  ]);
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
  const requestAccess = deriveCompanyRequestAccess(actor.company);
  const statusNotice = getCompanyStatusNotice(companyStatus);

  return (
    <div className="min-h-screen bg-white text-eg-ink">
      <ImpresaHeader
        accountLabel={accountLabel}
        unreadNotificationCount={counts.unreadNotificationCount}
        unreadContactCount={counts.unreadContactCount}
        unreadSupportCount={counts.unreadSupportCount}
        marketplaceEnabled={marketplaceEnabled}
        requestPreviewEnabled={
          requestAccess.mode === "preview_locked"
        }
        creditBalance={creditSummary.balance}
      />
      {statusNotice ? (
        <Container size="xl" className="pt-4">
          <div className="border border-eg-warning-border bg-eg-warning-soft px-4 py-3 text-sm font-medium leading-6 text-eg-warning">
            {statusNotice}
          </div>
        </Container>
      ) : null}
      {children}
    </div>
  );
}
