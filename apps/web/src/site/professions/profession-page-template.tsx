import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buildCanonicalPath } from "../seo/engine/canonical";
import {
  buildBreadcrumbJsonLd,
  serializeJsonLd,
} from "../seo/engine/schema-builder";
import { PublicShell } from "../shell/public-shell";
import { FrameMarks } from "../shared/frame-marks";
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
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <span className="text-[12px] font-medium text-eg-text-muted">
                Confronta soluzioni per il lavoro che ti serve
              </span>
            </>
          }
          aside={
            editorialContent?.hero ? (
              <div className="group relative h-[170px] w-full overflow-hidden sm:h-[200px] lg:h-[230px]">
                <FrameMarks />
                <Image
                  src={editorialContent.hero.src}
                  alt={editorialContent.hero.alt}
                  fill
                  priority
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
              <div className="grid gap-10 sm:gap-12">
                {groups.map((group) => (
                  <section key={group.slug} aria-labelledby={`profession-group-${group.slug}`}>
                    <div className="flex items-end justify-between gap-5">
                      <h2 id={`profession-group-${group.slug}`} className="eg-h2">
                        <Link
                          href={group.href}
                          prefetch={false}
                          className="transition-colors hover:text-eg-brand-strong"
                        >
                          {group.name}
                        </Link>
                      </h2>

                      <p className="shrink-0 text-[12px] text-eg-text-muted max-[560px]:hidden">
                        {group.interventions.length}{" "}
                        {group.interventions.length === 1
                          ? "intervento"
                          : "interventi"}
                      </p>
                    </div>

                    <ul className="mt-4 grid grid-cols-1 border-t-[0.5px] border-eg-border/60 min-[761px]:grid-cols-2 min-[761px]:gap-x-10">
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
