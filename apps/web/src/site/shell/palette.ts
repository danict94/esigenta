// Cantiere Calmo — Esigenta visual identity.
// Canonical palette for the site shell (navbar, footer) and homepage sections.

export const cc = {
  ink: "#171511",
  inkSecondary: "#5B5648",
  paper: "#FAF8F4",
  paperTranslucent: "rgba(250, 248, 244, 0.72)",
  surface: "#F1EEE7",
  // Warm linen — deeper and warmer than `surface`. Now the hero ground.
  linen: "#ECE4D4",
  hairline: "#E4E0D6",
  // The accent: Claude's terracotta/clay. Warm Paper/Ink neutrals stay the
  // foundation; the accent is the one warm signal, used sparingly —
  // CTA fill, search affordance, focus states, links.
  accent: "#CC785C",
  accentHover: "#B05E3F",
  accentTint: "#F5E8DF",
} as const;

export const ccFont = { fontFamily: "var(--font-geist-sans)" } as const;

// Uniform grading applied to every real photo on the homepage so the
// catalog reads as one continuous shoot rather than five unrelated assets.
export const ccPhotoGrade =
  "[filter:saturate(0.94)_contrast(1.04)_brightness(1.01)]";

// Fluid type — replaces the old two-step (mobile value / lg value) jump
// with a continuous clamp so nothing "snaps" at exactly 1024px.
export const ccType = {
  heading: "text-[clamp(1.625rem,1.1rem+2.2vw,2.375rem)]",
} as const;

// Soft, low-opacity elevation — the one place this system allows shadow.
// Used for the search affordance, the nav once scrolled, and the rare
// content panel that needs to read as a distinct, raised object.
export const ccElevation =
  "0 1px 2px rgba(23,21,17,0.04), 0 12px 32px rgba(23,21,17,0.07)";

// Soft warm-ink shadow for the photographic slabs in the hero — heavier than
// ccElevation, but tuned for the light linen ground (warm ink, not black).
export const ccSlabShadow =
  "0 18px 40px -16px rgba(23,21,17,0.28), 0 6px 14px -8px rgba(23,21,17,0.18)";
