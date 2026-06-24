const cantiereColorTokens = {
  ink: "#171511",
  inkSecondary: "#5B5648",
  paper: "#FAF8F4",
  paperTranslucent: "rgba(250, 248, 244, 0.72)",
  surface: "#F1EEE7",
  linen: "#ECE4D4",
  hairline: "#E4E0D6",
  accent: "#CC785C",
  accentHover: "#B05E3F",
  accentTint: "#F5E8DF",
  // Lighter step of the accent hue, for a "middle tier" detail (e.g. the
  // standard-tier medal star) that should read as toned-down, not full accent.
  accentSoft: "#DDA88E",
  // Distinct warm gold/bronze hue reserved for top-tier details, so
  // "premium" has its own material instead of "bigger accent". See
  // globals.css for the underlying CSS variables.
  bronze: "#9C7233",
  bronzeTint: "#DECFBA",
} as const;

const cantiereShadowTokens = {
  elevation: "shadow-cantiere-elevation",
  slab: "shadow-cantiere-slab",
  // Deeper lift for a single featured card among same-size siblings
  // (e.g. recommended pricing tier). See globals.css for the values.
  elevationLg: "shadow-cantiere-elevation-lg",
} as const;

const cantiereRadiusTokens = {
  sm: "rounded-[4px]",
  md: "rounded-[6px]",
  lg: "rounded-[8px]",
} as const;

export const tokens = {
  cantiere: {
    color: cantiereColorTokens,
    shadow: cantiereShadowTokens,
    radius: cantiereRadiusTokens,
  },
} as const;

export type Tokens = typeof tokens;

export type CantiereToken = keyof typeof tokens.cantiere;
export type CantiereColorToken = keyof typeof tokens.cantiere.color;
export type CantiereShadowToken = keyof typeof tokens.cantiere.shadow;
export type CantiereRadiusToken = keyof typeof tokens.cantiere.radius;
