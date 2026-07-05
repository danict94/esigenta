import type { Metadata } from "next";

import { redirect } from "next/navigation";

import {
  getPublicBusinessAreaPageData,
  reactivateCompanyAccount,
} from "@esigenta/domain";

import { getCurrentUser } from "../../../auth/server";
import { Grain } from "../../../site/home/grain";
import { PublicShell } from "../../../site/shell/public-shell";

import { ProAdvantages } from "./pro-advantages";
import { ProFinalCta } from "./pro-final-cta";
import { ProFlow } from "./pro-flow";
import { ProGuarantee } from "./pro-guarantee";
import { ProHeader } from "./pro-header";
import { ProHero } from "./pro-hero";
import { ProSelector } from "./pro-selector";

export const metadata: Metadata = {
  title: "esigenta per professionisti | Il lavoro giusto, gia organizzato",
  description:
    "Ricevi richieste reali, verificate e nella tua zona. Configura gratis il profilo professionista Esigenta e scegli quali contatti seguire.",
};

async function reactivateAccountAction() {
  "use server";

  const user = await getCurrentUser();

  if (!user) {
    return;
  }

  await reactivateCompanyAccount(user.id);

  redirect("/area-impresa/richieste");
}

export async function AreaImpresaMarketingPage() {
  const currentUser = await getCurrentUser();
  const { categories, hasDeactivatedCompany } =
    await getPublicBusinessAreaPageData({
      userId: currentUser?.id ?? null,
    });

  return (
    <PublicShell hero={<ProHeader />} showFooter={false}>
      <div className="eg-page eg-page-bg">
        <Grain />
        <div className="eg-thread" aria-hidden="true" />

        <ProHero />
        <ProSelector
          categories={categories}
          hasDeactivatedCompany={hasDeactivatedCompany}
          reactivateAction={reactivateAccountAction}
        />
        <ProAdvantages />
        <ProFlow />
        <ProGuarantee />
        <ProFinalCta />
      </div>
    </PublicShell>
  );
}
