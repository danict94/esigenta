import React from "react";
import { BadgeEuro } from "lucide-react";

import type { ProfessionEditorialPricing } from "./profession-editorial-content";

export type ProfessionPricingSectionProps = {
  readonly pricing: ProfessionEditorialPricing | null;
};

export function ProfessionPricingSection({
  pricing,
}: ProfessionPricingSectionProps) {
  if (!pricing || pricing.rows.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="profession-pricing-title"
      className="border-y-[0.5px] border-eg-border/60 py-5 sm:py-6"
      data-profession-pricing=""
    >
      <div className="eg-container">
        <div>
          <p className="eg-eyebrow text-eg-brand-strong">
            Tariffe indicative
          </p>
          <h2 id="profession-pricing-title" className="eg-h2 mt-2">
            {pricing.heading}
          </h2>

          <div className="mt-4 grid min-w-0 grid-cols-1 items-end gap-x-10 gap-y-4 min-[861px]:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.15fr)]">
            <dl className="min-w-0">
              {pricing.rows.map((row, index) => (
                <div key={`${row.label}:${row.value}`}>
                  <dt className="text-[13px] font-semibold leading-normal text-eg-ink">
                    {row.label}
                  </dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      {index === 0 ? (
                        <BadgeEuro aria-hidden="true" className="size-5 shrink-0 text-eg-brand-strong" strokeWidth={1.8} />
                      ) : null}
                      <strong className="text-[clamp(32px,5vw,38px)] font-semibold leading-none tracking-[-0.03em] text-eg-brand-strong [font-variant-numeric:tabular-nums]">
                        {row.value}
                      </strong>
                      {row.unit ? (
                        <span className="text-[15px] font-semibold text-eg-text-muted">
                          {row.unit}
                        </span>
                      ) : null}
                    </div>

                    {pricing.context ? (
                      <p className="mt-1.5 text-[12px] font-semibold text-eg-text-muted">
                        {pricing.context}
                      </p>
                    ) : null}

                    {row.note ? (
                      <p className="mt-1.5 text-[12px] leading-[1.5] text-eg-text-muted">
                        {row.note}
                      </p>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            {pricing.intro || (pricing.factors && pricing.factors.length > 0) ? (
              <div className="min-w-0">
                {pricing.intro ? (
                  <p className="text-[12.5px] leading-[1.55] text-eg-text-muted">
                    {pricing.intro}
                  </p>
                ) : null}

                {pricing.factors && pricing.factors.length > 0 ? (
                  <p className={`${pricing.intro ? "mt-1.5" : ""} text-[12.5px] leading-[1.6] text-eg-text-muted`}>
                    <strong className="font-semibold text-eg-ink">Può incidere:</strong>{" "}
                    {pricing.factors.map((factor, index) => (
                      <React.Fragment key={factor}>
                        {index > 0 ? " · " : null}
                        {factor.toLocaleLowerCase("it")}
                      </React.Fragment>
                    ))}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {pricing.disclaimer || pricing.lastReviewed ? (
            <div className="mt-3 flex flex-col gap-1.5 text-[11px] leading-[1.5] text-eg-text-muted sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              {pricing.disclaimer ? (
                <p className="max-w-[820px]">{pricing.disclaimer}</p>
              ) : null}
              {pricing.lastReviewed ? (
                <p className="shrink-0">Aggiornato: {pricing.lastReviewed}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
