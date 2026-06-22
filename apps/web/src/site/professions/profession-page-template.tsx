import Link from "next/link";

import { Badge, Card, PageShell } from "@esigenta/ui";
import type { ProfessionPage } from "@esigenta/taxonomy";

import { getSeoInterventionLandingBySlug } from "../seo/pages/interventi";

export type ProfessionPageTemplateProps = {
  page: ProfessionPage;
};

function getInterventionHref(slug: string): string {
  const landing = getSeoInterventionLandingBySlug(slug);

  return landing ? `/interventi/${slug}` : `/richiesta/${slug}`;
}

export function ProfessionPageTemplate({ page }: ProfessionPageTemplateProps) {
  const { category, projectGroups } = page;

  return (
    <PageShell size="lg">
      <header className="border-b border-border-primary pb-7">
        <Badge variant="neutral">Professione</Badge>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text-primary">
          {category.name}
        </h1>

        {category.description ? (
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
            {category.description}
          </p>
        ) : null}
      </header>

      <div className="mt-8 space-y-8">
        {projectGroups.length === 0 ? (
          <Card className="p-8 text-center text-text-secondary">
            Nessuna area di lavoro disponibile per questa professione.
          </Card>
        ) : (
          projectGroups.map((projectGroup) => (
            <section key={projectGroup.id} className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {projectGroup.name}
                </h2>

                {projectGroup.description ? (
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">
                    {projectGroup.description}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {projectGroup.interventions.map((intervention) => (
                  <Link
                    key={intervention.id}
                    href={getInterventionHref(intervention.slug)}
                    className="rounded-2xl border border-border-primary bg-surface-primary p-4 transition-colors hover:border-border-focus"
                    prefetch={false}
                  >
                    <span className="block text-sm font-semibold text-text-primary">
                      {intervention.name}
                    </span>

                    {intervention.description ? (
                      <span className="mt-1 block text-sm leading-6 text-text-secondary">
                        {intervention.description}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </PageShell>
  );
}
