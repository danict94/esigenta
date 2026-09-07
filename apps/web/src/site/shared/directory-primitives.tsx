import Link from "next/link";
import React, { type ReactNode } from "react";

import { cn } from "@esigenta/ui";

type HeadingLevel = 2 | 3 | 4;

export function DirectoryGroupHeader({
  title,
  count,
  id,
  headingLevel = 3,
  className,
}: {
  readonly title: ReactNode;
  readonly count?: ReactNode;
  readonly id?: string;
  readonly headingLevel?: HeadingLevel;
  readonly className?: string;
}) {
  const Heading = `h${headingLevel}` as const;

  return (
    <div
      className={cn(
        "flex items-end gap-3 border-b border-eg-border pb-2.5",
        className,
      )}
    >
      <Heading
        id={id}
        className="min-w-0 flex-1 font-(family-name:--eg-font-mono) text-[11.5px] font-medium uppercase leading-tight tracking-widest text-eg-brand-strong"
      >
        {title}
      </Heading>
      {count ? (
        <span className="shrink-0 text-[11.5px] text-eg-text-muted">
          {count}
        </span>
      ) : null}
    </div>
  );
}

export function DirectoryItemTitle({
  children,
  headingLevel = 3,
  id,
  className,
}: {
  readonly children: ReactNode;
  readonly headingLevel?: HeadingLevel;
  readonly id?: string;
  readonly className?: string;
}) {
  const Heading = `h${headingLevel}` as const;

  return (
    <Heading
      id={id}
      className={cn(
        "font-(family-name:--eg-font-primary) text-[15px] font-semibold leading-[1.3] text-eg-ink",
        className,
      )}
    >
      {children}
    </Heading>
  );
}

export function DirectoryItemSummary({
  children,
  as = "p",
  className,
}: {
  readonly children: ReactNode;
  readonly as?: "p" | "span";
  readonly className?: string;
}) {
  const Element = as;

  return (
    <Element
      className={cn(
        "font-(family-name:--eg-font-primary) text-[12.5px] leading-[1.55] text-eg-text-muted",
        className,
      )}
    >
      {children}
    </Element>
  );
}

export function DirectoryAction({
  children,
  href,
  className,
}: {
  readonly children: ReactNode;
  readonly href: string;
  readonly className?: string;
}) {
  const classes = cn(
    "font-(family-name:--eg-font-primary) text-[12px] font-semibold uppercase text-eg-accent transition-colors duration-200 ease-(--eg-ease-brand) hover:text-eg-brand-hover group-hover:text-eg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-eg-accent",
    className,
  );

  return (
    <Link href={href} prefetch={false} className={classes}>
      {children}
    </Link>
  );
}
