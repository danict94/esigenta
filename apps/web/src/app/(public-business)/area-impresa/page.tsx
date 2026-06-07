import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CheckCircle2 } from "lucide-react";

import {
  prisma,
  reactivateCompanyAccount,
} from "@fixpro/db";
import {
  getCurrentUserFromHeaders,
} from "@fixpro/db/auth";

import {
  Badge,
  Button,
  Card,
  CardContent,
  HeroSurface,
  cn,
  tokens,
} from "@fixpro/ui";

import { PublicShell } from "../../../components/layout/public-shell";

import { CompanyLeadForm } from "./_components/company-lead-form";
import { BusinessHowItWorks } from "./_components/business-how-it-works";

export const metadata: Metadata = {
  title: "esigenta Imprese | Richieste selezionate per professionisti",
  description:
    "Iscrizione gratuita, pacchetti crediti, richieste con posti limitati e area impresa per gestire nuove opportunità di lavoro.",
};

async function getProfessionalCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      slug: true,
      name: true,
    },
  });
}

const heroPoints = [
  "Iscrizione gratuita",
  "Pacchetti crediti senza abbonamento obbligatorio",
  "Massimo 3 imprese per richiesta",
] as const;

async function reactivateAccountAction() {
  "use server";

  const user = await getCurrentUserFromHeaders(await headers());

  if (!user) {
    return;
  }

  await reactivateCompanyAccount(user.id);

  redirect("/area-impresa/richieste");
}

export default async function AreaImpresaLandingPage() {
  const categories = await getProfessionalCategories();

  const currentUser = await getCurrentUserFromHeaders(await headers());

  const hasDeactivatedCompany = currentUser
    ? await prisma.companyMembership.findFirst({
        where: {
          userId: currentUser.id,
          company: {
            is: {
              isActive: false,
            },
          },
        },
      })
    : null;

  return (
    <PublicShell>
      <div className="pb-8 md:pb-10">
        <HeroSurface>
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_520px] xl:items-center">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 text-center xl:mx-0 xl:pl-12 xl:text-left">
              <div className="flex flex-col gap-5">
                <p className="text-sm font-semibold text-brand-primary">
                  esigenta Imprese
                </p>

                <h1
                  className={cn(
                    "max-w-3xl text-text-on-hero-primary",
                    tokens.typography.hero,
                  )}
                >
                  Trova lavori nella tua zona
                </h1>

                <p className="mx-auto max-w-xl text-base leading-7 text-text-on-hero-secondary md:text-lg md:leading-8 xl:mx-0">
                  Tu porti la competenza. esigenta ti collega a richieste reali
                  nella tua zona, con costi in crediti visibili e opportunità
                  limitate a poche imprese.
                </p>
              </div>

              <div className="mx-auto grid w-full max-w-xl gap-3 text-left xl:mx-0">
                {heroPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 text-sm text-text-on-hero-secondary md:text-base"
                  >
                    <CheckCircle2
                      className="size-5 shrink-0 text-brand-primary"
                      aria-hidden="true"
                    />

                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm text-text-on-hero-secondary">
                Hai già un profilo?{" "}
                <Link
                  href="/area-impresa/accedi"
                  className="font-semibold text-brand-primary transition-colors hover:text-brand-primary-hover"
                >
                  Accedi all’area impresa
                </Link>
              </p>
            </div>

            {hasDeactivatedCompany ? (
              <Card className="mx-auto w-full max-w-xl bg-surface-elevated shadow-surface">
                <CardContent className="flex flex-col gap-5 p-6 md:p-8 xl:p-10">
                  <Badge variant="warning">Account disattivato</Badge>

                  <div className="space-y-3">
                    <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
                      Riattiva il tuo profilo impresa
                    </h2>

                    <p className="text-sm leading-6 text-text-secondary">
                      Abbiamo trovato un account impresa associato a questa
                      sessione. Puoi riattivarlo mantenendo storico, richieste e
                      configurazione.
                    </p>
                  </div>

                  <form action={reactivateAccountAction}>
                    <Button type="submit">Riattiva account</Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <CompanyLeadForm categories={categories} />
            )}
          </div>
        </HeroSurface>

        <BusinessHowItWorks />
      </div>
    </PublicShell>
  );
}
