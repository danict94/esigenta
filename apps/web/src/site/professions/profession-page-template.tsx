import Image from "next/image";
import Link from "next/link";

import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import { InternalPageIntro } from "../shared/internal-page-intro";
import { ProfessionBusinessCta } from "./profession-business-cta";
import { ProfessionEditorialSections } from "./profession-editorial-sections";
import { ProfessionHeroCopy } from "./profession-hero-copy";
import { ProfessionInterventionItem } from "./profession-intervention-item";
import { ProfessionPricingSection } from "./profession-pricing-section";
import type { ProfessionDetailViewModel } from "./resolve-profession-detail";

export type ProfessionPageTemplateProps = {
  page: ProfessionDetailViewModel;
};

export function ProfessionPageTemplate({ page }: ProfessionPageTemplateProps) {
  const { category, groups } = page;
  const editorialContent = page.editorialContent;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Professionisti", path: "/professionisti" },
    {
      name: category.name,
      path: buildCanonicalPath({ family: "profession", slug: category.slug }),
    },
  ]);

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <div className="eg-page eg-page-bg">
        <InternalPageIntro
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Professionisti", href: "/professionisti" },
            { label: category.name },
          ]}
          title={category.name}
          afterTitle={
            editorialContent?.intro ? (
              <ProfessionHeroCopy intro={editorialContent.intro} />
            ) : undefined
          }
          description={editorialContent?.intro ? undefined : category.description}
          compact
          actions={
            <>
              <Link
                href="#interventi-professione"
                className="eg-button-primary min-h-10 px-4 text-[13px]"
              >
                Richiedi preventivi
              </Link>
              <span className="text-[12px] font-medium text-eg-text-muted">
                {editorialContent?.requestMicrocopy ??
                  "Confronta soluzioni per il lavoro che ti serve"}
              </span>
            </>
          }
          aside={
            editorialContent?.hero ? (
              <div className="relative h-[200px] w-full overflow-hidden sm:h-[240px] lg:h-[280px]">
                <Image
                  src={editorialContent.hero.src}
                  alt={editorialContent.hero.alt}
                  fill
                  preload
                  sizes="(min-width: 1024px) 400px, calc(100vw - 44px)"
                  className="object-cover"
                />
              </div>
            ) : undefined
          }
        />

        <ProfessionPricingSection
          pricing={page.editorialContent?.pricing ?? null}
        />

        <section id="interventi-professione" className="scroll-mt-24 py-9 sm:py-11">
          <div className="eg-container">
            {groups.length === 0 ? (
              <p className="eg-body-muted max-w-[46ch]">
                Nessuna area di lavoro disponibile per questa professione.
              </p>
            ) : (
              <div className="grid gap-11 sm:gap-13">
                {groups.map((group) => (
                  <section
                    key={group.slug}
                    aria-labelledby={`profession-group-${group.slug}`}
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h2
                        id={`profession-group-${group.slug}`}
                        className="min-w-0 font-(family-name:--eg-font-primary) text-[22px] font-semibold leading-[1.2] tracking-[-0.01em] text-eg-ink sm:text-[25px]"
                      >
                        <Link
                          href={group.href}
                          prefetch={false}
                          className="transition-colors hover:text-eg-brand-strong"
                        >
                          {group.name}
                        </Link>
                      </h2>
                      <span className="shrink-0 text-[12px] text-eg-text-muted">
                        {group.interventions.length}{" "}
                        {group.interventions.length === 1
                          ? "intervento"
                          : "interventi"}
                      </span>
                    </div>

                    <ul className="mt-5 grid grid-cols-1 gap-x-10 gap-y-8 min-[761px]:grid-cols-2">
                      {group.interventions.map((intervention) => (
                        <ProfessionInterventionItem
                          key={intervention.slug}
                          {...intervention}
                        />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </section>

        <ProfessionEditorialSections
          sections={editorialContent?.closingSections ?? []}
        />

        <ProfessionBusinessCta professionName={category.name} />
      </div>
    </PublicShell>
  );
}
