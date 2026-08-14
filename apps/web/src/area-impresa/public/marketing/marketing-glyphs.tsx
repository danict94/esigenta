// Glyph proprietario condiviso dal flusso pubblico per professionisti.

const ACCENT = "var(--color-eg-brand-strong)";

type GlyphProps = {
  className?: string;
};

// Zona operativa: struttura neutra, punto in colore Brand.
export function ZoneGlyph({ className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 21s6.5-5.6 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.4 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10.4" r="2.4" fill={ACCENT} />
    </svg>
  );
}
