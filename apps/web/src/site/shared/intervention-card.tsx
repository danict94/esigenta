import Link from "next/link";
import React from "react";

export type InterventionCardCtaLabels = {
  readonly landing: string;
  readonly costGuide: string;
  readonly request: string;
};

export type InterventionCardProps = {
  readonly name: string;
  readonly summary: string;
  readonly requestHref: string;
  readonly landingHref: string | null;
  readonly costGuideHref: string | null;
  readonly costRange?: string | null;
  readonly ctaLabels: InterventionCardCtaLabels;
};

/**
 * Presentational Intervention card. All content and destinations are resolved
 * by the consumer; this component only renders the available actions.
 */
export function InterventionCard({
  name,
  summary,
  requestHref,
  landingHref,
  costGuideHref,
  costRange = null,
  ctaLabels,
}: InterventionCardProps) {
  return (
    <li className="flex flex-col rounded-none border border-eg-border bg-eg-surface p-6.5 shadow-none transition-[transform,box-shadow] duration-200 ease-(--eg-ease-brand) hover:-translate-y-1 hover:shadow-eg-slab">
      <h3 className="text-[19px] font-semibold leading-[1.2] tracking-[-0.01em] text-eg-ink">
        {name}
      </h3>

      <p className="mt-2.5 flex-1 text-[14px] leading-[1.55] text-eg-text-muted">
        {summary}
      </p>

      {costRange ? (
        <p className="mt-4 border border-dashed border-eg-border bg-eg-page px-3.5 py-3 text-[13px] leading-normal text-eg-text-muted">
          <span className="font-medium text-eg-ink">{costRange}</span>
          {costGuideHref ? (
            <>
              {" — "}
              <Link
                href={costGuideHref}
                prefetch={false}
                className="font-semibold text-eg-brand-strong transition-colors hover:text-eg-brand-hover hover:underline"
              >
                {ctaLabels.costGuide}
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-eg-border pt-4">
        {landingHref ? (
          <Link
            href={landingHref}
            prefetch={false}
            className="eg-button-ghost min-h-10 px-3.5 text-xs"
          >
            {ctaLabels.landing}
          </Link>
        ) : null}

        {costGuideHref && !costRange ? (
          <Link
            href={costGuideHref}
            prefetch={false}
            className="eg-button-ghost min-h-10 px-3.5 text-xs"
          >
            {ctaLabels.costGuide}
          </Link>
        ) : null}

        <Link
          href={requestHref}
          prefetch={false}
          className="eg-button-primary eg-button-arrow min-h-10 px-3.5 text-xs"
        >
          {ctaLabels.request}
        </Link>
      </div>
    </li>
  );
}
