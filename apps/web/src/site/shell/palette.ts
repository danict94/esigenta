// Cantiere Calmo — Esigenta visual identity.
// Canonical palette for the site shell (navbar, footer) and homepage sections.

export const cc = {
  ink: "#18181B",
  inkSecondary: "#57575F",
  paper: "#F1F1F3",
  paperTranslucent: "rgba(241, 241, 243, 0.72)",
  surface: "#E7E7EB",
  // Subtle neutral fill for hover/selected states — between `paper` and `surface`.
  linen: "#ECECEF",
  hairline: "#E0E0E5",
  // Modern light-gray neutrals are the foundation; terracotta is the single
  // warm accent, used sparingly — CTA fill, search affordance, focus, links.
  accent: "#CC785C",
  accentHover: "#B05E3F",
  accentTint: "#F5E8DF",
} as const;

export const ccFont = { fontFamily: "var(--font-geist-sans)" } as const;

// Uniform grading applied to every real photo on the homepage so the
// catalog reads as one continuous shoot rather than five unrelated assets.
export const ccPhotoGrade =
  "[filter:saturate(0.94)_contrast(1.04)_brightness(1.01)]";

// Fluid display type now lives in the design system as theme tokens —
// `text-cantiere-display` (hero/step) and `text-cantiere-heading` (section
// headings). See `packages/ui/src/styles/globals.css`. The old `ccType`
// className object was removed so there is one source of truth for type size.

// Soft, low-opacity elevation — the one place this system allows shadow.
// Used for the search affordance, the nav once scrolled, and the rare
// content panel that needs to read as a distinct, raised object.
export const ccElevation =
  "0 1px 2px rgba(23,21,17,0.04), 0 12px 32px rgba(23,21,17,0.07)";

// Soft warm-ink shadow for the photographic slabs in the hero — heavier than
// ccElevation, but tuned for the light linen ground (warm ink, not black).
export const ccSlabShadow =
  "0 18px 40px -16px rgba(23,21,17,0.28), 0 6px 14px -8px rgba(23,21,17,0.18)";
