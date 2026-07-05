const egColorTokens = {
  calce: "#F8F4ED",
  calce2: "#F1EBDF",
  calceTranslucent: "rgba(248, 244, 237, 0.72)",
  terra: "#2B2520",
  cotto: "#BF6F4A",
  cottoDark: "#A35A39",
  cottoTint: "rgba(191, 111, 74, 0.12)",
  salvia: "#7E8C6F",
  verdeConferma: "#36B26B",
  miele: "#D9A441",
  mieleTint: "rgba(217, 164, 65, 0.24)",
  ardesia: "rgba(43, 37, 32, 0.62)",
  ardesia2: "rgba(43, 37, 32, 0.38)",
  hairline: "rgba(43, 37, 32, 0.14)",
} as const;

const egShadowTokens = {
  elevation: "shadow-eg-elevation",
  slab: "shadow-eg-slab",
  elevationLg: "shadow-eg-elevation-lg",
} as const;

const egRadiusTokens = {
  sm: "rounded-eg-sm",
  md: "rounded-eg-md",
  lg: "rounded-eg-lg",
} as const;

const egTextTokens = {
  display: "text-eg-display",
  heading: "text-eg-heading",
  lede: "text-eg-lede",
} as const;

export const tokens = {
  eg: {
    color: egColorTokens,
    shadow: egShadowTokens,
    radius: egRadiusTokens,
    text: egTextTokens,
  },
} as const;

export type Tokens = typeof tokens;

export type EgToken = keyof typeof tokens.eg;
export type EgColorToken = keyof typeof tokens.eg.color;
export type EgShadowToken = keyof typeof tokens.eg.shadow;
export type EgRadiusToken = keyof typeof tokens.eg.radius;
export type EgTextToken = keyof typeof tokens.eg.text;
export type EsigentaColorToken = EgColorToken;
