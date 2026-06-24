import { cn } from "@esigenta/ui";

import { VerifiedGlyph, ZoneGlyph } from "./marketing-glyphs";

// Static, clearly-labelled sample of an incoming request — never wired to real
// data. It exists to make tangible what a professional actually receives: zone,
// category, verification, available seats and the unlock action. The "Esempio
// di richiesta" eyebrow keeps it honest: realistic, not live.

export type RequestCardBadge = {
  label: string;
  tone?: "verified" | "neutral";
};

export type RequestCardSeats = {
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
              index < taken
                ? "bg-cantiere-accent"
                : "border border-cantiere-hairline",
            )}
          />
        ))}
      </span>

      <span className="text-[13px] text-cantiere-ink-secondary">
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
    <article
      className={cn(
        "rounded-[8px] border border-cantiere-hairline bg-cantiere-paper shadow-cantiere-slab",
        compact ? "p-4" : "p-5 md:p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] uppercase tracking-[0.14em] text-cantiere-ink-secondary">
          Esempio di richiesta
        </span>

        {badge ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[6px] border px-2.5 py-1 text-[12px] font-medium",
              badge.tone === "verified"
                ? "border-cantiere-accent text-cantiere-accent"
                : "border-cantiere-hairline bg-cantiere-linen text-cantiere-ink",
            )}
          >
            {badge.tone === "verified" ? (
              <VerifiedGlyph className="size-3.5" />
            ) : null}
            {badge.label}
          </span>
        ) : null}
      </div>

      <p
        className={cn(
          "mt-4 font-medium leading-[1.3] text-cantiere-ink",
          compact ? "text-[16px]" : "text-[18px]",
        )}
      >
        {category}
      </p>

      <p className="mt-2 flex items-center gap-2 text-[14px] text-cantiere-ink-secondary">
        <ZoneGlyph className="size-4 shrink-0 text-cantiere-ink-secondary" />
        <span>
          {city}
          {zoneLabel ? ` · ${zoneLabel}` : ""}
        </span>
      </p>

      {chips && chips.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-[6px] border border-cantiere-hairline px-2.5 py-1 text-[12.5px] text-cantiere-ink-secondary"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}

      {description && !compact ? (
        <p className="mt-4 text-[13.5px] leading-[1.5] text-cantiere-ink-secondary">
          {description}
        </p>
      ) : null}

      <div className="mt-5 flex items-end justify-between gap-4 border-t border-cantiere-hairline pt-4">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-cantiere-ink-secondary">
            Sblocco
          </span>

          {seats ? (
            <SeatDots taken={seats.taken} total={seats.total} />
          ) : (
            <span className="text-[13px] text-cantiere-ink-secondary">
              Crediti visibili prima dello sblocco
            </span>
          )}
        </div>

        <span
          aria-hidden="true"
          className="inline-flex h-9 shrink-0 select-none items-center rounded-[8px] bg-cantiere-accent px-4 text-[14px] font-medium text-cantiere-paper"
        >
          Sblocca
        </span>
      </div>
    </article>
  );
}
