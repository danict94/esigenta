// Cantiere Calmo — Esigenta V2 visual identity.
// Scoped to the homepage only. Do not import outside site/home-v2/**.

export const cc = {
  ink: "#171511",
  inkSecondary: "#5B5648",
  paper: "#FAF8F4",
  paperTranslucent: "rgba(250, 248, 244, 0.72)",
  surface: "#F1EEE7",
  hairline: "#E4E0D6",
  // Refinement pass: evolved from the original Clay (terracotta) toward a
  // muted blue-violet. Warm Paper/Ink neutrals stay the foundation; the
  // accent is the one cool note, used exactly as sparingly as Clay was —
  // CTA fill, search affordance, focus states, process numerals.
  accent: "#4B49A8",
  accentHover: "#3A3886",
  accentTint: "#ECEAF7",
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

// The hero inverts to this near-black ink for the Exploded System — the one
// section of the homepage allowed to break from the paper/ink foundation.
export const ccVoid = {
  bg: "#13110D",
  surface: "#1F1C16",
  hairline: "rgba(250,248,244,0.14)",
  text: "#FAF8F4",
  textSecondary: "rgba(250,248,244,0.62)",
} as const;

// Hard shadow for the photographic slabs in the hero — deliberately heavier
// than ccElevation, which stays reserved for paper-surface panels.
export const ccSlabShadow =
  "0 30px 60px -12px rgba(0,0,0,0.55), 0 10px 20px -8px rgba(0,0,0,0.4)";
