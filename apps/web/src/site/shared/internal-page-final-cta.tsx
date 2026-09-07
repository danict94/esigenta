import Link from "next/link";
import React from "react";

export function InternalPageFinalCta({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
}: {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly ctaLabel: string;
}) {
  return (
    <section className="border-y border-eg-header-border bg-eg-header py-7 text-eg-header-text">
      <div className="eg-container flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center sm:gap-8">
        <div className="max-w-[730px]">
          {eyebrow ? (
            <p className="mb-2 font-(family-name:--eg-font-mono) text-[11.5px] font-medium uppercase tracking-widest text-eg-brand-on-dark">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-[clamp(23px,3vw,28px)] font-semibold leading-tight tracking-[-0.01em]">
            {title}
          </h2>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-eg-header-text/75 sm:text-[14px]">
            {description}
          </p>
        </div>

        <Link
          href={href}
          prefetch={false}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-eg-md bg-eg-header-action px-5 py-3 text-[14px] font-semibold text-eg-header transition-[filter] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-eg-header-action"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
