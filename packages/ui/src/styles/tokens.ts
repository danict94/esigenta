/*
 * Ownership contract:
 * - `globals.css` owns physical values exposed through CSS variables.
 * - primitive tokens own reusable utility-scale decisions.
 * - layout and structural surface recipes own geometry, never page content.
 * - component recipes remain opt-in until their component migration step.
 */

const radiusTokens = {
  none: "",
  sm: "rounded-md",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-[2.5rem]",
  full: "rounded-full",
} as const;

const semanticSurfaceTokens = {
  primary: "bg-surface-primary",
  secondary: "bg-surface-secondary",
  tertiary: "bg-surface-tertiary",
  footer: "bg-surface-footer",
  elevated: "bg-surface-elevated",
  marketingSoft: "bg-surface-marketing-soft",
  soft: "bg-surface-soft",
  dark: "bg-surface-dark",
} as const;

const marketingSurfaceFrameTokens = {
  inset: "mx-2 md:mx-3 lg:mx-4",
  shape: "rounded-[var(--fp-radius-marketing-surface)] shadow-none",
} as const;

const structuralSurfaceTokens = {
  hero: `bg-[var(--fp-hero-surface-background)] text-text-on-hero-primary ${marketingSurfaceFrameTokens.shape}`,
  editorial: `${semanticSurfaceTokens.marketingSoft} ${marketingSurfaceFrameTokens.shape}`,
  footer: `${semanticSurfaceTokens.footer} text-text-on-hero-primary ${marketingSurfaceFrameTokens.shape}`,
} as const;

const legacyCssSurfaceTokens = {
  hero: "fp-hero-surface",
} as const;

const containerWidthTokens = {
  xs: "max-w-2xl",
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  xxl: "max-w-screen-2xl",
  full: "max-w-none",
} as const

const sizingTokens = {
  viewport: {
    full: "min-h-screen",
  },
  controlHeight: {
    sm: "h-10",
    md: "h-12",
    lg: "h-14",
    xl: "h-16",
  },
  badge: {
    sm: "min-h-7",
    md: "min-h-8",
  },
  checkbox: {
    md: "h-4 w-4",
  },
  textarea: {
    md: "min-h-24",
  },
} as const;

const densityTokens = {
  interactive: {
    sm: "px-4",
    md: "px-5",
    lg: "px-6",
    xl: "px-8",
  },
  field: {
    md: "px-4",
    lg: "px-5",
    multiline: "px-4 py-3",
  },
  badge: {
    sm: "px-2.5",
    md: "px-3",
  },
  panel: {
    default: "p-6",
  },
  stack: {
    tight: "space-y-1.5",
  },
} as const;

const layoutTokens = {
  container: {
    base: "mx-auto w-full",
    defaultSize: "lg",
    defaultGutter: "md",
    widths: containerWidthTokens,
    gutters: {
      none: "",
      sm: "px-2 md:px-3 lg:px-4",
      md: "px-4 md:px-5 lg:px-6",
    },
  },
  pageShell: {
    base: sizingTokens.viewport.full,
    padding: "py-8 md:py-10",
    contentContainer: {
      defaultSize: "lg",
      gutter: "md",
    },
  },
  heroSurface: {
    inset: marketingSurfaceFrameTokens.inset,
    frame:
      "relative overflow-visible px-5 py-6 md:px-8 md:py-8 xl:px-10 xl:py-10",
    contentContainer: {
      defaultSize: "lg",
      gutter: "none",
    },
  },
  marketing: {
    heroGutter: "px-6 sm:px-10 md:px-16 lg:px-20 xl:px-24",
    sectionInner: "mx-auto w-full max-w-7xl",
  },
  marketingSurface: {
    inset: marketingSurfaceFrameTokens.inset,
  },
} as const;

const cardTokens = {
  base: `${radiusTokens.lg} border border-border-primary ${semanticSurfaceTokens.elevated} shadow-card`,
  header: `${densityTokens.stack.tight} ${densityTokens.panel.default}`,
  content: `${densityTokens.panel.default} pt-0`,
  footer: `flex items-center ${densityTokens.panel.default} pt-0`,
  title: "text-lg font-semibold leading-none tracking-tight text-text-primary",
  description: "text-sm text-text-secondary",
} as const;

const interactiveTokens = {
  base: "inline-flex items-center justify-center font-medium transition-colors",
  radius: radiusTokens.md,
  states: {
    disabled: "disabled:pointer-events-none disabled:opacity-60",
  },
  variants: {
    primary:
      "border border-action-primary bg-action-primary text-action-on-primary hover:border-action-primary-hover hover:bg-action-primary-hover",
    secondary:
      "border border-border-primary bg-surface-primary text-text-primary hover:border-border-focus",
    brand:
      "border border-brand-primary bg-brand-primary text-brand-on-primary hover:border-brand-primary-hover hover:bg-brand-primary-hover",
    brandOutline:
      "border border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-brand-on-primary",
    ghost:
      "border border-transparent bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text-primary",
  },
  sizes: {
    sm: `${sizingTokens.controlHeight.sm} ${densityTokens.interactive.sm} text-sm`,
    md: `${sizingTokens.controlHeight.md} ${densityTokens.interactive.md} text-sm`,
    lg: `${sizingTokens.controlHeight.lg} ${densityTokens.interactive.lg} text-base`,
    xl: `${sizingTokens.controlHeight.xl} ${densityTokens.interactive.xl} text-base`,
  },
} as const;

const formControlTokens = {
  base: `w-full border border-border-primary ${semanticSurfaceTokens.primary} text-text-primary outline-none transition-colors`,
  states: {
    placeholder: "placeholder:text-text-muted",
    focus: "focus:border-border-focus",
    disabled: "disabled:cursor-not-allowed disabled:opacity-60",
  },
  inputSizes: {
    md: `${sizingTokens.controlHeight.md} ${densityTokens.field.md} text-sm`,
    lg: `${sizingTokens.controlHeight.xl} ${densityTokens.field.lg} text-base`,
  },
  textarea: `${sizingTokens.textarea.md} resize-none ${densityTokens.field.multiline} text-sm`,
  select: `${sizingTokens.controlHeight.md} ${densityTokens.field.md} text-sm`,
  checkbox: `${sizingTokens.checkbox.md} accent-brand-primary`,
} as const;

const homeTokens = {
  railFrame: "max-w-[var(--fp-home-rail-max-width)]",
  rail: "lg:px-[var(--fp-home-content-inset-x)]",
  section: "py-12 md:py-[calc(var(--fp-home-section-y)+0.5rem)]",
  softSection: `${semanticSurfaceTokens.soft} py-[var(--fp-home-section-y-compact)] md:py-[var(--fp-home-section-y)]`,
  compactSoftSection:
    `${semanticSurfaceTokens.soft} py-9 md:py-11`,
  sectionGap: "mt-[var(--fp-home-section-gap)]",
  sectionLabel: "text-sm font-medium text-action-primary",
  sectionTitle:
    "text-3xl font-semibold leading-tight tracking-[-0.045em] text-text-primary md:text-4xl",
  sectionTitleCompact:
    "text-2xl font-semibold leading-tight tracking-[-0.04em] text-text-primary md:text-3xl",
  sectionDescription:
    "max-w-2xl text-sm leading-6 text-text-secondary md:text-base",
  nav: {
    heroLogo:
      "pointer-events-auto absolute left-6 top-4 text-lg font-medium sm:left-8 md:left-12 md:text-xl lg:left-[var(--fp-home-content-inset-x)] lg:top-[3.2%]",
    heroMenu:
      "pointer-events-auto absolute right-[var(--fp-home-content-inset-x)] top-[3.2%] hidden items-center gap-5 text-sm lg:flex lg:gap-7",
    defaultContainer: "h-14 md:h-16 lg:px-[var(--fp-home-content-inset-x)]",
  },
  hero: {
    frame:
      "relative mx-auto w-full max-w-[var(--fp-home-hero-max-width)] lg:h-[var(--fp-home-hero-height)]",
    lightPanel:
      `relative z-20 ${semanticSurfaceTokens.soft} rounded-[var(--fp-home-hero-radius)] pb-9 pt-20 shadow-surface md:pb-12 md:pt-24 lg:absolute lg:left-0 lg:top-0 lg:h-[var(--fp-home-hero-light-height)] lg:w-[var(--fp-home-hero-light-width)] lg:p-0`,
    titleBlock:
      "px-6 sm:px-8 md:px-12 lg:absolute lg:left-[var(--fp-home-hero-title-x)] lg:top-[var(--fp-home-hero-title-y)] lg:w-[76%] lg:p-0",
    title:
      "max-w-md text-[2.15rem] font-medium leading-[1.08] tracking-[-0.05em] text-text-primary md:text-[2.65rem] lg:text-[38px] xl:text-[38px]",
    searchBlock:
      "mt-8 px-6 sm:px-8 md:px-12 lg:absolute lg:left-[var(--fp-home-hero-search-x)] lg:top-[var(--fp-home-hero-search-y)] lg:mt-0 lg:w-[82%] lg:p-0",
    question:
      "text-2xl font-medium leading-tight tracking-[-0.045em] text-text-primary md:text-3xl lg:text-[38px]",
    heroSearch: "mt-4 w-full max-w-md md:mt-5 lg:mt-5 lg:max-w-none",
    darkPanel:
      `relative min-h-[22rem] ${semanticSurfaceTokens.dark} rounded-[var(--fp-home-hero-radius)] px-6 pt-6 sm:min-h-[26rem] md:min-h-[30rem] lg:absolute lg:bottom-[var(--fp-home-hero-dark-bottom)] lg:left-[var(--fp-home-hero-dark-left)] lg:right-0 lg:top-[var(--fp-home-hero-dark-top)] lg:z-10 lg:min-h-0 lg:p-0`,
    image:
      "absolute inset-x-0 bottom-0 top-8 mx-auto max-w-xl lg:bottom-0 lg:left-[var(--fp-home-hero-image-x)] lg:right-0 lg:top-[var(--fp-home-hero-image-y)] lg:max-w-none",
    searchCard: "lg:p-2",
    searchInner: "lg:h-[var(--fp-home-search-inner-height)]",
    searchInput: "lg:pl-8 lg:text-xl",
    searchButton:
      "lg:h-[var(--fp-home-search-button-size)] lg:w-[var(--fp-home-search-button-size)]",
    searchIcon: "lg:size-8",
  },
} as const;

export const tokens = {
  // Backward-compatible alias; layout.container.widths owns width selection.
  containers: containerWidthTokens,

  radius: radiusTokens,

  spacing: {
    sectionXs: "py-6 md:py-8",
    sectionSm: "py-10 md:py-12",
    sectionMd: "py-12 md:py-14",
    sectionLg: "py-16 md:py-20",
    sectionXl: "py-20 md:py-24",

    pageShell: layoutTokens.pageShell.padding,
    containerX: layoutTokens.container.gutters.md,
  },

  typography: {
    hero: "text-[2.15rem] md:text-[2.2rem] lg:text-[3.25rem] xl:text-[3.55rem] font-medium leading-[1.08] tracking-[-0.05em]",
    heroSecondary: "text-[1em]",

    title: "text-3xl md:text-5xl font-semibold tracking-tight",

    subtitle: "text-xl md:text-2xl text-text-secondary",

    body: "text-base leading-7",

    caption: "text-sm text-text-muted",
  },

  /*
   * Backward-compatible namespace. `hero` remains a CSS-driven composite
   * recipe for existing consumers; new layout code uses `structuralSurfaces`.
   */
  surfaces: {
    hero: legacyCssSurfaceTokens.hero,
    ...semanticSurfaceTokens,
  },

  // Role-only fills: no spacing, radius or elevation ownership.
  semanticSurfaces: semanticSurfaceTokens,

  // Merge-safe composed shells: fill and shape, never content layout.
  structuralSurfaces: structuralSurfaceTokens,

  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    card: "shadow-card",
    surface: "shadow-surface",
  },

  sizing: sizingTokens,
  layout: layoutTokens,
  home: homeTokens,
  card: cardTokens,
  interactive: interactiveTokens,
  density: densityTokens,
  formControls: formControlTokens,
} as const;

export type Tokens = typeof tokens;

export type ContainerToken = keyof typeof tokens.containers;
export type RadiusToken = keyof typeof tokens.radius;
export type SpacingToken = keyof typeof tokens.spacing;
export type TypographyToken = keyof typeof tokens.typography;
export type SurfaceToken = keyof typeof tokens.surfaces;
export type SemanticSurfaceToken = keyof typeof tokens.semanticSurfaces;
export type StructuralSurfaceToken = keyof typeof tokens.structuralSurfaces;
export type ShadowToken = keyof typeof tokens.shadows;

export type SizingToken = keyof typeof tokens.sizing;
export type ViewportSizeToken = keyof typeof tokens.sizing.viewport;
export type ControlHeightToken = keyof typeof tokens.sizing.controlHeight;
export type BadgeSizeToken = keyof typeof tokens.sizing.badge;
export type CheckboxSizeToken = keyof typeof tokens.sizing.checkbox;
export type TextareaSizeToken = keyof typeof tokens.sizing.textarea;

export type LayoutToken = keyof typeof tokens.layout;
export type LayoutGutterToken = keyof typeof tokens.layout.container.gutters;
export type HomeToken = keyof typeof tokens.home;

export type CardToken = keyof typeof tokens.card;

export type InteractiveToken = keyof typeof tokens.interactive;
export type InteractiveStateToken = keyof typeof tokens.interactive.states;
export type InteractiveVariantToken = keyof typeof tokens.interactive.variants;
export type InteractiveSizeToken = keyof typeof tokens.interactive.sizes;

export type DensityToken = keyof typeof tokens.density;
export type InteractiveDensityToken = keyof typeof tokens.density.interactive;
export type FieldDensityToken = keyof typeof tokens.density.field;
export type BadgeDensityToken = keyof typeof tokens.density.badge;
export type PanelDensityToken = keyof typeof tokens.density.panel;
export type StackDensityToken = keyof typeof tokens.density.stack;

export type FormControlToken = keyof typeof tokens.formControls;
export type FormControlStateToken = keyof typeof tokens.formControls.states;
export type FormControlSizeToken = keyof typeof tokens.formControls.inputSizes;
