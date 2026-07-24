import type { ReactNode } from "react";

import { cn } from "@esigenta/ui";

type ProEyebrowProps = {
  children: ReactNode;
  tone?: "default" | "light";
  className?: string;
};

export function ProEyebrow({
  children,
  tone = "default",
  className,
}: ProEyebrowProps) {
  const lineTone = tone === "light" ? "bg-eg-on-brand-border" : "bg-eg-border";
  const textTone = tone === "light" ? "text-eg-on-brand-muted" : "text-eg-text-muted";

  return (
    <p
      className={cn(
        "inline-flex items-center gap-2.5 font-(family-name:--eg-font-ui) text-xs uppercase tracking-[0.12em]",
        textTone,
        className,
      )}
    >
      <span className={cn("h-px w-5", lineTone)} aria-hidden="true" />
      <span>{children}</span>
      <span className={cn("h-px w-5", lineTone)} aria-hidden="true" />
    </p>
  );
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
    <header className={cn("mx-auto mb-[54px] max-w-[620px] text-center", className)}>
      <ProEyebrow>{eyebrow}</ProEyebrow>
      <h2 id={titleId} className="eg-h2 mt-4">
        {title}
      </h2>
    </header>
  );
}

type ProMarkerProps = {
  state?: "idle" | "active" | "done";
};

export function ProMarker({ state = "idle" }: ProMarkerProps) {
  const markerTone =
    state === "done"
      ? "border-eg-brand-strong bg-eg-brand-strong"
      : state === "active"
        ? "border-eg-brand bg-eg-surface"
        : "border-eg-border bg-eg-surface";
  const dabTone =
    state === "done"
      ? "bg-eg-on-brand"
      : state === "active"
        ? "bg-eg-brand-strong"
        : "bg-eg-text-muted";

  return (
    <span
      className={cn(
        "relative z-[2] mx-auto mb-6 flex size-9 items-center justify-center rounded-full border transition-colors",
        markerTone,
      )}
      aria-hidden="true"
    >
      <span className="relative block h-3.5 w-3.5">
        <span className={cn("absolute left-0 top-0 h-2 w-[3px] rounded-full", dabTone)} />
        <span className={cn("absolute left-[5.5px] top-[3px] h-2 w-[3px] rounded-full", dabTone)} />
        <span className={cn("absolute left-[11px] top-0 h-2 w-[3px] rounded-full", dabTone)} />
      </span>
    </span>
  );
}
