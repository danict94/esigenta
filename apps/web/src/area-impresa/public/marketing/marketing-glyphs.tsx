// Esigenta — proprietary line glyphs for the professionals marketing page.
// Same hand as site/shell/icons.tsx: 24×24 grid, 1.5px stroke, round caps and
// joins, structural lines on currentColor (so they invert cleanly on the dark
// trust section), with the terracotta accent reserved for the one detail that
// carries the meaning. Not a third-party icon set — drawn for this product.

const ACCENT = "var(--eg-cotto)";

type GlyphProps = {
  className?: string;
};

function Svg({
  className,
  children,
}: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Verificata / moderata — a shield with the accent confirming the check.
export function VerifiedGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path
        d="M12 2.5 4.5 5.4V11c0 4.7 3.2 8.4 7.5 9.8 4.3-1.4 7.5-5.1 7.5-9.8V5.4L12 2.5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <path
        d="M8.6 11.9 11 14.3 15.6 9.3"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Massimo 3 imprese — three slots, one already taken (accent), two open.
export function LimitedSeatsGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <rect x="4" y="5" width="16" height="3.4" rx="1.7" fill={ACCENT} />
      <rect
        x="4"
        y="10.3"
        width="16"
        height="3.4"
        rx="1.7"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x="4"
        y="15.6"
        width="16"
        height="3.4"
        rx="1.7"
        stroke="currentColor"
        strokeWidth={1.5}
      />
    </Svg>
  );
}

// Assistenza — headset, with the accent on the mic boom.
export function SupportGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path
        d="M5 13v-1.5a7 7 0 0 1 14 0V13"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <rect
        x="3.3"
        y="12.4"
        width="3.8"
        height="6.4"
        rx="1.9"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <rect
        x="16.9"
        y="12.4"
        width="3.8"
        height="6.4"
        rx="1.9"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M19 18.8v.4a3 3 0 0 1-3 3h-2"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Rimborso / verifica contatto — a credit that comes back to you.
export function RefundGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path
        d="M6 12a6 6 0 1 0 1.8-4.3"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M3.4 6.8 7.9 8.1 6.6 12.6"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.2" fill={ACCENT} />
    </Svg>
  );
}

// Zona operativa — a pin with the accent marking your point.
export function ZoneGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <path
        d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.4" r="2.4" fill={ACCENT} />
    </Svg>
  );
}

// Richiesta ricevuta — a request panel with the accent arriving into it.
export function RequestGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <rect
        x="3.5"
        y="7"
        width="17"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M7 11.5h7M7 15h5"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M17.5 2.5v5M15.3 5.3l2.2 2.2 2.2-2.2"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Conversazione / sblocco — an open lock; the accent shackle just released.
export function UnlockGlyph({ className }: GlyphProps) {
  return (
    <Svg className={className}>
      <rect
        x="5"
        y="11"
        width="14"
        height="9.5"
        rx="2"
        stroke="currentColor"
        strokeWidth={1.5}
      />
      <path
        d="M8 11V8a4 4 0 0 1 7.7-1.6"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.5" fill="currentColor" />
      <path
        d="M12 16.4v2"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}
