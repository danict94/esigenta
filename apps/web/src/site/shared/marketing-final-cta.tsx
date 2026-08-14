import Link from "next/link";

type MarketingFinalCtaProps = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  secondaryAction?: {
    href: string;
    label: string;
  };
};

export function MarketingFinalCta({
  title,
  description,
  href,
  ctaLabel,
  secondaryAction,
}: MarketingFinalCtaProps) {
  return (
    <section className="eg-theme-ink eg-section-editorial">
      <div className="eg-container-narrow text-center">
        <h2 className="eg-h2">{title}</h2>

        <p className="eg-body mx-auto mt-4 max-w-[58ch] text-eg-on-brand-muted">
          {description}
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={href}
            prefetch={false}
            className="eg-button-primary eg-button-arrow w-full sm:w-auto"
          >
            {ctaLabel}
          </Link>

          {secondaryAction ? (
            <Link
              href={secondaryAction.href}
              prefetch={false}
              className="eg-button-ghost w-full sm:w-auto"
            >
              {secondaryAction.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
