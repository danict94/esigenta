import Link from "next/link";
import React from "react";

import {
  DirectoryAction,
  DirectoryItemSummary,
  DirectoryItemTitle,
} from "../shared/directory-primitives";
import type { ProfessionDetailInterventionViewModel } from "./resolve-profession-detail";

export type ProfessionInterventionItemProps =
  ProfessionDetailInterventionViewModel;

const SUMMARY_PREFIXES = [
  "Il percorso giusto per ",
  "Usa questo percorso per ",
  "Scegli questo percorso per ",
] as const;

export function compactProfessionInterventionSummary(summary: string): string {
  const trimmed = summary.trim();
  const prefix = SUMMARY_PREFIXES.find((candidate) =>
    trimmed.startsWith(candidate),
  );
  const withoutPrefix = prefix ? trimmed.slice(prefix.length) : trimmed;
  const withoutExample = withoutPrefix.replace(/, (?:ad esempio|come)\b.*\.$/iu, ".");

  return withoutExample.charAt(0).toLocaleUpperCase("it") + withoutExample.slice(1);
}

export function ProfessionInterventionItem({
  name,
  summary,
  requestHref,
  landingHref,
  costGuideHref,
}: ProfessionInterventionItemProps) {
  const compactSummary = compactProfessionInterventionSummary(summary);

  return (
    <li
      className="flex min-w-0 flex-col border-b border-eg-border py-4.5"
      data-profession-intervention-item=""
    >
      <DirectoryItemTitle>{name}</DirectoryItemTitle>

      <DirectoryItemSummary className="mt-1.5 flex-1">
        {compactSummary}
      </DirectoryItemSummary>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[12px] font-semibold">
        {landingHref ? (
          <DirectoryAction href={landingHref}>
            Scopri
          </DirectoryAction>
        ) : null}

        {costGuideHref ? (
          <DirectoryAction href={costGuideHref}>
            Guida ai costi
          </DirectoryAction>
        ) : null}

        <Link
          href={requestHref}
          prefetch={false}
          className="inline-flex min-h-8 items-center bg-eg-brand-soft px-2.5 py-1.5 text-eg-brand-strong transition-colors hover:bg-eg-brand hover:text-eg-on-brand"
        >
          Richiedi preventivi
        </Link>
      </div>
    </li>
  );
}
