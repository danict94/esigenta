import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  DirectoryAction,
  DirectoryGroupHeader,
  DirectoryItemSummary,
  DirectoryItemTitle,
} from "./directory-primitives";
import { InternalPageFinalCta } from "./internal-page-final-cta";

test("le primitive directory applicano un solo linguaggio tipografico", () => {
  const html = renderToStaticMarkup(
    <>
      <DirectoryGroupHeader
        headingLevel={2}
        title="Ristrutturazioni"
        count="2 guide"
      />
      <DirectoryItemTitle>Cartongesso</DirectoryItemTitle>
      <DirectoryItemSummary>Descrizione sintetica.</DirectoryItemSummary>
      <DirectoryAction href="/servizi/cartongesso">Apri</DirectoryAction>
    </>,
  );

  assert.match(html, /text-\[11\.5px\].*uppercase/);
  assert.match(html, /text-\[15px\].*font-semibold/);
  assert.match(html, /text-\[12\.5px\].*text-eg-text-muted/);
  assert.match(html, /text-\[12px\].*uppercase/);
  assert.match(html, /href="\/servizi\/cartongesso"/);
  assert.match(html, /text-eg-accent/);
  assert.match(html, /border-b border-eg-border/);
  assert.doesNotMatch(html, /→|↗|lucide-arrow/i);
});

test("la CTA finale condivisa usa superficie header e azione lime senza frecce", () => {
  const html = renderToStaticMarkup(
    <InternalPageFinalCta
      title="Titolo CTA"
      description="Descrizione CTA."
      href="/"
      ctaLabel="Azione CTA"
    />,
  );

  assert.match(html, /bg-eg-header/);
  assert.match(html, /bg-eg-header-action/);
  assert.match(html, /href="\/"/);
  assert.doesNotMatch(html, /→|↗|lucide-arrow/i);
});
