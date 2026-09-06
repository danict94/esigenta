import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  InterventionCard,
  type InterventionCardProps,
} from "./intervention-card";

const labels = {
  landing: "Scopri l’intervento",
  costGuide: "Guida ai costi",
  request: "Richiedi preventivi",
};

function renderCard(
  overrides: Partial<InterventionCardProps> = {},
): string {
  return renderToStaticMarkup(
    <InterventionCard
      name="Rifare il lavoro"
      summary="Summary editoriale esistente."
      requestHref="/richiesta/rifare-il-lavoro"
      landingHref={null}
      costGuideHref={null}
      ctaLabels={labels}
      {...overrides}
    />,
  );
}

function linksFrom(html: string): { href: string; label: string }[] {
  return Array.from(
    html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/g),
    (match) => ({
      href: match[1]!,
      label: match[2]!.replace(/<[^>]+>/g, ""),
    }),
  );
}

test("InterventionCard renders only the request action for a funnel-only item", () => {
  const html = renderCard();

  assert.deepEqual(linksFrom(html), [
    {
      href: "/richiesta/rifare-il-lavoro",
      label: "Richiedi preventivi",
    },
  ]);
  assert.match(html, /<h3[^>]*>Rifare il lavoro<\/h3>/);
  assert.match(html, /<p[^>]*>Summary editoriale esistente\.<\/p>/);
});

test("InterventionCard renders landing then request when no cost guide exists", () => {
  const html = renderCard({
    landingHref: "/interventi/rifare-il-lavoro",
  });

  assert.deepEqual(linksFrom(html), [
    {
      href: "/interventi/rifare-il-lavoro",
      label: "Scopri l’intervento",
    },
    {
      href: "/richiesta/rifare-il-lavoro",
      label: "Richiedi preventivi",
    },
  ]);
});

test("InterventionCard renders landing, cost guide and request when all destinations exist", () => {
  const html = renderCard({
    landingHref: "/interventi/rifare-il-lavoro",
    costGuideHref: "/costi/rifare-il-lavoro",
  });

  assert.deepEqual(linksFrom(html), [
    {
      href: "/interventi/rifare-il-lavoro",
      label: "Scopri l’intervento",
    },
    {
      href: "/costi/rifare-il-lavoro",
      label: "Guida ai costi",
    },
    {
      href: "/richiesta/rifare-il-lavoro",
      label: "Richiedi preventivi",
    },
  ]);
  assert.doesNotMatch(html, /aria-disabled/);
  assert.doesNotMatch(html, /href=""/);
});

test("InterventionCard preserves the existing services cost block and CTA hierarchy", () => {
  const html = renderCard({
    landingHref: "/interventi/rifare-il-lavoro",
    costGuideHref: "/costi/rifare-il-lavoro",
    costRange: "1.000–2.000 €",
    ctaLabels: {
      landing: "Approfondisci",
      costGuide: "guida ai costi",
      request: "Richiedi preventivi",
    },
  });

  assert.match(
    html,
    /border-dashed[^>]*><span[^>]*>1\.000–2\.000 €<\/span> — <a[^>]*href="\/costi\/rifare-il-lavoro"[^>]*>guida ai costi<\/a><\/p>/,
  );
  assert.deepEqual(linksFrom(html), [
    {
      href: "/costi/rifare-il-lavoro",
      label: "guida ai costi",
    },
    {
      href: "/interventi/rifare-il-lavoro",
      label: "Approfondisci",
    },
    {
      href: "/richiesta/rifare-il-lavoro",
      label: "Richiedi preventivi",
    },
  ]);
});
