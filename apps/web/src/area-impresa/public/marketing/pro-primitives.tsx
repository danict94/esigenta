import type { ReactNode } from "react";

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
  const lineTone = tone === "light" ? "bg-eg-calce/40" : "bg-eg-ardesia-2";
  const textTone = tone === "light" ? "text-eg-calce/60" : "text-eg-ardesia";

  return (
    <p
      className={[
        "inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.12em]",
        textTone,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className={["h-px w-5", lineTone].join(" ")} aria-hidden="true" />
      <span>{children}</span>
      <span className={["h-px w-5", lineTone].join(" ")} aria-hidden="true" />
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
    <header className={["mx-auto mb-[54px] max-w-[620px] text-center", className].filter(Boolean).join(" ")}>
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
      ? "border-eg-salvia bg-eg-salvia"
      : state === "active"
        ? "border-eg-cotto bg-eg-calce"
        : "border-eg-hairline bg-eg-calce";
  const dabTone =
    state === "done"
      ? "bg-eg-calce"
      : state === "active"
        ? "bg-eg-cotto-dark"
        : "bg-eg-ardesia-2";

  return (
    <span
      className={[
        "relative z-[2] mx-auto mb-6 flex size-9 items-center justify-center rounded-full border transition-colors",
        markerTone,
      ].join(" ")}
      aria-hidden="true"
    >
      <span className="relative block h-3.5 w-3.5">
        <span className={["absolute left-0 top-0 h-2 w-[3px] rounded-full", dabTone].join(" ")} />
        <span className={["absolute left-[5.5px] top-[3px] h-2 w-[3px] rounded-full", dabTone].join(" ")} />
        <span className={["absolute left-[11px] top-0 h-2 w-[3px] rounded-full", dabTone].join(" ")} />
      </span>
    </span>
  );
}
