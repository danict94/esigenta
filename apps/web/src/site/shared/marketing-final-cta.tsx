import Link from "next/link";

import { cn } from "@esigenta/ui";

import { professionalCtaColorClassName } from "./cta-variants";

type MarketingFinalCtaProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  secondaryAction?: {
    href: string;
    label: string;
  };
  align?: "center" | "left";
  variant?: "default" | "cost";
};

export function MarketingFinalCta({
  title,
  description,
  href,
  ctaLabel,
  secondaryAction,
  align = "center",
  variant = "default",
}: MarketingFinalCtaProps) {
  const isCostVariant = variant === "cost";
  const isLeftAligned = isCostVariant || align === "left";

  return (
    <section className="eg-theme-ink eg-section-editorial">
      <div className={isLeftAligned ? "eg-container" : "eg-container-narrow text-center"}>
        <h2 className="eg-h2">{title}</h2>

        <p className={isLeftAligned ? "eg-body mt-4 max-w-[58ch] text-eg-on-brand-muted" : "eg-body mx-auto mt-4 max-w-[58ch] text-eg-on-brand-muted"}>
          {description}
        </p>

        <div className={isLeftAligned ? "mt-7 flex flex-col items-start gap-4 sm:flex-row" : "mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"}>
          <Link
            href={href}
            prefetch={false}
            className={cn(
              "w-full sm:w-auto",
              isCostVariant
                ? `eg-button-primary eg-button-arrow ${professionalCtaColorClassName}`
                : "eg-button-primary eg-button-arrow",
            )}
          >
            {ctaLabel}
          </Link>

          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              prefetch={false}
              className={cn(
                "w-full sm:w-auto",
                isCostVariant ? "eg-button-primary eg-button-arrow" : "eg-button-ghost",
              )}
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
