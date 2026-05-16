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
    sm: "rounded-md",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-lg",
    full: "rounded-lg",
  },

  spacing: {
    sectionXs: "py-8",
    sectionSm: "py-12",
    sectionMd: "py-16",
    sectionLg: "py-24",
    sectionXl: "py-32",

    containerX: "px-4 md:px-6 lg:px-8",
  },

  typography: {
    hero: "text-3xl md:text-5xl font-bold leading-tight tracking-tight",

    title: "text-3xl md:text-5xl font-semibold tracking-tight",

    subtitle: "text-xl md:text-2xl text-text-secondary",

    body: "text-base leading-7",

    caption: "text-sm text-text-muted",
  },

  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    surface: "shadow-surface",
  },
} as const
