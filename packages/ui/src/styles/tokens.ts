export const tokens = {
  containers: {
    xs: "max-w-2xl",
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    xxl: "max-w-screen-2xl",
    full: "max-w-none",
  },

  radius: {
    none: "",
    sm: "rounded-md",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    "3xl": "rounded-[2.5rem]",
    full: "rounded-full",
  },

  spacing: {
    sectionXs: "py-8",
    sectionSm: "py-12",
    sectionMd: "py-16",
    sectionLg: "py-24",
    sectionXl: "py-32",

    pageShell: "py-10 md:py-12",
    containerX: "px-4 md:px-6 lg:px-8",
  },

  typography: {
    hero: "text-3xl md:text-5xl font-bold leading-tight tracking-tight",
    heroSecondary: "text-[0.92em]",

    title: "text-3xl md:text-5xl font-semibold tracking-tight",

    subtitle: "text-xl md:text-2xl text-text-secondary",

    body: "text-base leading-7",

    caption: "text-sm text-text-muted",
  },

  surfaces: {
    hero: "fp-hero-surface",
  },

  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    surface: "shadow-surface",
  },
} as const

export type ContainerToken = keyof typeof tokens.containers
export type RadiusToken = keyof typeof tokens.radius
export type SpacingToken = keyof typeof tokens.spacing
export type TypographyToken = keyof typeof tokens.typography
export type SurfaceToken = keyof typeof tokens.surfaces
export type ShadowToken = keyof typeof tokens.shadows