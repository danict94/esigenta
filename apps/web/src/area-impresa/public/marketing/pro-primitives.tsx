import type { ReactNode } from "react";

import { cn } from "@esigenta/ui";

import { blueprintEyebrowClassName, blueprintTitleClassName } from "../../../site/shared/section-header";

type ProEyebrowProps = {
  children: ReactNode;
  tone?: "default" | "light";
  className?: string;
};

// Su sfondo cianotipo pieno (Hero) il brand-blue di blueprintEyebrowClassName
// non ha abbastanza contrasto: tone="light" replica l'azzurro chiaro gia'
// usato per lo stesso caso in Servizi (hero scura). Su ink (Guarantee) e su
// superfici chiare il brand-blue di default funziona gia' bene, invariato.
export function ProEyebrow({ children, tone = "default", className }: ProEyebrowProps) {
  if (tone === "light") {
    return (
      <p
        className={cn(
          "flex items-center gap-2.5 font-(family-name:--eg-font-brand) text-xs uppercase tracking-[0.14em] text-eg-brand-on-dark before:inline-block before:h-px before:w-5.5 before:bg-eg-brand-on-dark before:content-['']",
          className,
        )}
      >
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
      <h2 id={titleId} className={cn(blueprintTitleClassName, "mt-3.5")}>
        {title}
      </h2>
    </header>
  );
}
