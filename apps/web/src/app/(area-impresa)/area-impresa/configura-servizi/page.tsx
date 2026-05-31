import Link from "next/link";

import { Badge, Card, PageShell } from "@fixpro/ui";
import { prisma } from "@fixpro/db";

import { requireDefaultCompanyMembership } from "../../../../auth/server";

import { saveCompanyServicesAction } from "./actions";
import {
  CategoryServicesSelector,
  type CategoryOption,
} from "./category-services-selector";

export const dynamic = "force-dynamic";

type ConfiguraServiziPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  missing_categories: "Seleziona almeno una categoria prima di continuare.",
  too_many_categories: "Puoi selezionare al massimo 6 categorie operative.",
  invalid_services:
    "Alcuni servizi non sono collegati alle categorie selezionate.",
  company_not_found:
    "Non troviamo il profilo impresa collegato a questo account.",
};

export default async function ConfiguraServiziPage({
  searchParams,
}: ConfiguraServiziPageProps) {
  const [{ error }, membership] = await Promise.all([
    searchParams,
    requireDefaultCompanyMembership(),
  ]);

  const [company, categories] = await Promise.all([
    prisma.company.findUnique({
      where: {
        id: membership.companyId,
      },
      select: {
        id: true,
        name: true,
        onboardingCategorySlug: true,
        categories: {
          select: {
            categoryId: true,
          },
        },
        services: {
          select: {
            serviceId: true,
          },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        slug: true,
        name: true,
        sector: {
          select: {
            name: true,
          },
        },
        services: {
          orderBy: {
            service: {
              name: "asc",
            },
          },
          select: {
            service: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    }),
  ]);

  if (!company) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Profilo non disponibile</Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Non troviamo il tuo profilo impresa
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            L&apos;account risulta autenticato, ma non è collegato a un profilo
            impresa valido.
          </p>
        </Card>
      </PageShell>
    );
  }

  if (categories.length === 0) {
    return (
      <PageShell size="lg">
        <Card className="p-8">
          <Badge variant="warning">Categorie non disponibili</Badge>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-text-primary">
            Configurazione servizi non disponibile
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
            Non ci sono categorie operative configurabili. Puoi comunque
            entrare nell&apos;area impresa.
          </p>

          <Link
            href="/area-impresa/richieste"
            className="mt-6 inline-flex text-sm font-medium text-brand-primary"
          >
            Vai alle richieste
          </Link>
        </Card>
      </PageShell>
    );
  }

  const categoryOptions: CategoryOption[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    sectorName: category.sector?.name ?? null,
    services: category.services.map(({ service }) => ({
      id: service.id,
      name: service.name,
      description: service.description ?? null,
    })),
  }));

  const savedCategoryIds = company.categories.map(
    (category) => category.categoryId,
  );
  const onboardingCategoryId =
    categories.find(
      (category) => category.slug === company.onboardingCategorySlug,
    )?.id ?? null;
  const initialCategoryIds =
    savedCategoryIds.length > 0
      ? savedCategoryIds
      : onboardingCategoryId
        ? [onboardingCategoryId]
        : [];
  const selectedServiceIds = company.services.map(
    (service) => service.serviceId,
  );
  const errorMessage = error ? errorMessages[error] : null;

  return (
    <PageShell size="lg">
      <div className="max-w-4xl">
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary">
          Configura categorie e servizi
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary">
          Le categorie determinano quali richieste puoi vedere. I servizi sono
          opzionali: aiutano FixPro a mostrarti prima le richieste più
          pertinenti.
        </p>

        <Card className="mt-8 p-6">
          <div className="flex flex-col gap-3 border-b border-border-primary pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">
                Profilo impresa
              </p>

              <h2 className="mt-1 text-xl font-semibold text-text-primary">
                {company.name}
              </h2>
            </div>

            {onboardingCategoryId ? (
              <Badge variant="success">Categoria suggerita</Badge>
            ) : null}
          </div>

          {errorMessage ? (
            <div className="mt-5 border border-border-focus bg-surface-secondary px-4 py-3 text-sm text-text-primary">
              {errorMessage}
            </div>
          ) : null}

          <CategoryServicesSelector
            categories={categoryOptions}
            initialCategoryIds={initialCategoryIds}
            initialServiceIds={selectedServiceIds}
            action={saveCompanyServicesAction}
          />
        </Card>
      </div>
    </PageShell>
  );
}
