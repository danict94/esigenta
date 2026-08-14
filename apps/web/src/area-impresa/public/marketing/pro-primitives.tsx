import type { ReactNode } from "react";

import { cn } from "@esigenta/ui";

import {
  blueprintEyebrowClassName,
  blueprintEyebrowOnDarkClassName,
  blueprintTitleClassName,
} from "../../../site/shared/section-header";

type ProEyebrowProps = {
  children: ReactNode;
  tone?: "default" | "light";
  className?: string;
};

// Su sfondo cianotipo pieno (Hero) usa la variante chiara condivisa.
export function ProEyebrow({ children, tone = "default", className }: ProEyebrowProps) {
  if (tone === "light") {
    return (
      <p className={cn(blueprintEyebrowOnDarkClassName, className)}>
        {children}
      </p>
    );
  }

  return <p className={cn(blueprintEyebrowClassName, className)}>{children}</p>;
}

type ProSectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  className?: string;
  titleId?: string;
};

export function ProSectionHeader({
  eyebrow,
  title,
  className,
  titleId,
}: ProSectionHeaderProps) {
  return (
    <header className={cn("mb-12 max-w-155", className)}>
      <ProEyebrow>{eyebrow}</ProEyebrow>
      <h2 id={titleId} className={cn("eg-h2 mt-3.5", blueprintTitleClassName)}>
        {title}
      </h2>
    </header>
  );
}
