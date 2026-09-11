import assert from "node:assert/strict";
import test from "node:test";
import React, {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

import { getPublicProfessionDetail } from "@esigenta/taxonomy/public-professions";

import { ProfessionBusinessCta } from "./profession-business-cta";
import { ProfessionPageTemplate } from "./profession-page-template";
import { resolveProfessionDetailViewModel } from "./resolve-profession-detail";

Object.assign(globalThis, { React });

test("impresa edile renders the approved editorial page over canonical membership", () => {
  const canonical = getPublicProfessionDetail("impresa-edile");
  const page = resolveProfessionDetailViewModel("impresa-edile");

  assert.ok(canonical);
  assert.ok(page);
  assert.equal(page.groups.length, 6);
  assert.equal(
    page.groups.reduce(
      (total, group) => total + group.interventions.length,
      0,
    ),
    33,
  );
  assert.deepEqual(
    page.groups.map((group) => ({
      slug: group.slug,
      interventions: group.interventions.map(
        (intervention) => intervention.slug,
      ),
    })),
    canonical.projectGroups.map((group) => ({
      slug: group.slug,
      interventions: group.interventions.map(
        (intervention) => intervention.slug,
      ),
    })),
  );
  assert.equal(page.editorialContent?.pricing, undefined);

  const shell = ProfessionPageTemplate({ page }) as ReactElement<{
    children: ReactNode;
  }>;
  const shellChildren = Children.toArray(shell.props.children);
  const pageContainer = shellChildren[1];
  assert.ok(isValidElement<{ children: ReactNode }>(pageContainer));

  const pageSections = Children.toArray(pageContainer.props.children);
  const intro = pageSections[0];
  const pricing = pageSections[1];
  const editorialSections = pageSections[3];
  const businessCta = pageSections[4];

  assert.ok(
    isValidElement<{
      title: string;
      actions: ReactElement<{ children: ReactNode }>;
    }>(intro),
  );
  assert.equal(intro.props.title, "Impresa edile");

  const actionChildren = Children.toArray(intro.props.actions.props.children);
  const requestLink = actionChildren[0];
  const microcopy = actionChildren[1];
  assert.ok(isValidElement<{ href: string; children: string }>(requestLink));
  assert.equal(requestLink.props.href, "#interventi-professione");
  assert.equal(requestLink.props.children, "Richiedi preventivi");
  assert.ok(isValidElement<{ children: string }>(microcopy));
  assert.equal(
    microcopy.props.children,
    "Confronta imprese per il lavoro che devi realizzare",
  );

  assert.ok(isValidElement<{ pricing: unknown }>(pricing));
  assert.equal(pricing.props.pricing, null);
  assert.ok(
    isValidElement<{ sections: readonly { heading: string }[] }>(
      editorialSections,
    ),
  );
  assert.deepEqual(
    editorialSections.props.sections.map((section) => section.heading),
    [
      "Quando rivolgersi a un’impresa edile",
      "Cosa incide sul preventivo",
      "Come scegliere un’impresa edile",
    ],
  );
  assert.ok(isValidElement<{ professionName: string }>(businessCta));
  assert.equal(businessCta.props.professionName, "Impresa edile");

  const businessCtaContent = ProfessionBusinessCta({
    professionName: businessCta.props.professionName,
  }) as ReactElement<{ href: string; title: string }>;
  assert.equal(businessCtaContent.props.href, "/area-impresa/iscriviti");
  assert.equal(businessCtaContent.props.title, "Sei un’impresa edile?");
});
