import { cn } from "@esigenta/ui";

import { VerifiedGlyph, ZoneGlyph } from "./marketing-glyphs";

type RequestCardBadge = {
  label: string;
  tone?: "verified" | "neutral";
};

type RequestCardSeats = {
  taken: number;
  total: number;
};

export type RequestCardData = {
  category: string;
  city: string;
  zoneLabel?: string;
  badge?: RequestCardBadge;
  chips?: string[];
  description?: string;
  seats?: RequestCardSeats;
};

type RequestCardProps = RequestCardData & {
  compact?: boolean;
  className?: string;
};

function SeatDots({ taken, total }: RequestCardSeats) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex items-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }).map((_, index) => (
          <span
            key={index}
            className={cn(
              "size-2.5 rounded-full",
              index < taken ? "bg-eg-cotto" : "border border-eg-hairline",
            )}
          />
        ))}
      </span>

      <span className="text-[13px] text-eg-ardesia">
        {taken} di {total} imprese
      </span>
    </span>
  );
}

export function RequestCard({
  category,
  city,
  zoneLabel,
  badge,
  chips,
  description,
  seats,
  compact = false,
  className,
}: RequestCardProps) {
  return (
    <article className={cn("eg-panel bg-eg-calce", compact ? "p-4" : "p-5 md:p-6", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="eg-mono-label text-[11px]">Esempio richiesta</span>

        {badge ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[12px] font-medium",
              badge.tone === "verified"
                ? "border-eg-cotto text-eg-cotto-dark"
                : "border-eg-hairline text-eg-terra",
            )}
          >
            {badge.tone === "verified" ? <VerifiedGlyph className="size-3.5" /> : null}
            {badge.label}
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-4 font-medium leading-[1.25] tracking-[-0.01em] text-eg-terra",
          compact ? "text-[16px]" : "text-[20px]",
        )}
      >
        {category}
      </p>

      <p className="mt-2 flex items-center gap-2 text-[14px] text-eg-ardesia">
        <ZoneGlyph className="size-4 shrink-0 text-eg-ardesia" />
        <span>
          {city}
          {zoneLabel ? ` / ${zoneLabel}` : ""}
        </span>
      </p>

      {chips && chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="border border-eg-hairline px-2.5 py-1 text-[12.5px] text-eg-ardesia"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {description && !compact ? (
        <p className="mt-4 text-[13.5px] leading-[1.55] text-eg-ardesia">
          {description}
        </p>
      ) : null}

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-eg-hairline pt-4">
        <div className="flex flex-col gap-2">
          <span className="eg-mono-label text-[11px]">Sblocco</span>
          {seats ? (
            <SeatDots taken={seats.taken} total={seats.total} />
          ) : (
            <span className="text-[13px] text-eg-ardesia">
              Crediti visibili prima dello sblocco
            </span>
          )}
        </div>

        <span
          aria-hidden="true"
          className="inline-flex h-9 shrink-0 select-none items-center bg-eg-cotto px-4 text-[13px] font-medium text-eg-calce"
        >
          Sblocca
        </span>
      </div>
    </article>
  );
}
