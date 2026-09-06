import React from "react";

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
      className="border-y border-eg-border py-9 sm:py-10"
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

          {pricing.intro ? (
            <p className="eg-body-muted mt-4 max-w-[840px]">
              {pricing.intro}
            </p>
          ) : null}

          <div className="mt-6 grid min-w-0 grid-cols-1 items-end gap-x-10 gap-y-5 min-[861px]:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
            <dl className="min-w-0">
              {pricing.rows.map((row) => (
                <div key={`${row.label}:${row.value}`}>
                  <dt className="text-[13px] font-semibold leading-normal text-eg-ink">
                    {row.label}
                  </dt>
                  <dd className="mt-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <strong className="text-[clamp(34px,6vw,44px)] font-semibold leading-none tracking-[-0.03em] text-eg-brand-strong [font-variant-numeric:tabular-nums]">
                        {row.value}
                      </strong>
                      {row.unit ? (
                        <span className="text-[15px] font-semibold text-eg-text-muted">
                          {row.unit}
                        </span>
                      ) : null}
                    </div>

                    {pricing.context ? (
                      <p className="mt-2.5 font-(family-name:--eg-font-mono) text-[11px] font-semibold uppercase tracking-[0.06em] text-eg-text-muted">
                        {pricing.context}
                      </p>
                    ) : null}

                    {row.note ? (
                      <p className="mt-2.5 max-w-[520px] text-[12.5px] leading-[1.5] text-eg-text-muted">
                        {row.note}
                      </p>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            {pricing.factors && pricing.factors.length > 0 ? (
              <div className="min-w-0">
                <h3 className="text-[13px] font-semibold leading-normal text-eg-ink">
                  Cosa può incidere sul prezzo
                </h3>
                <ul
                  aria-label="Fattori che possono incidere sul prezzo"
                  className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] leading-normal text-eg-text-muted"
                >
                  {pricing.factors.map((factor, index) => (
                    <li key={factor} className="flex items-center gap-2">
                      {index > 0 ? (
                        <span aria-hidden="true" className="text-eg-border">
                          ·
                        </span>
                      ) : null}
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {pricing.disclaimer || pricing.lastReviewed ? (
            <div className="mt-5 flex flex-col gap-2 text-[12px] leading-[1.55] text-eg-text-muted sm:flex-row sm:items-start sm:justify-between sm:gap-8">
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
