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
  base: "bg-surface-base",
  primary: "bg-surface-primary",
  muted: "bg-surface-muted",
  subtle: "bg-surface-subtle",
  secondary: "bg-surface-secondary",
  tertiary: "bg-surface-tertiary",
  footer: "bg-surface-footer",
  elevated: "bg-surface-elevated",
  marketingSoft: "bg-surface-marketing-soft",
  soft: "bg-surface-soft",
  dark: "bg-surface-dark",
} as const;

const neutralColorTokens = {
  black: {
    background: "bg-neutral-black",
    text: "text-neutral-black",
  },
  anthracite: {
    background: "bg-neutral-anthracite",
    text: "text-neutral-anthracite",
  },
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
  xs: "max-w-[var(--fp-container-max-width)]",
  sm: "max-w-[var(--fp-container-max-width)]",
  md: "max-w-[var(--fp-container-max-width)]",
  lg: "max-w-[var(--fp-container-max-width)]",
  xl: "max-w-[var(--fp-container-max-width)]",
  xxl: "max-w-[var(--fp-container-max-width)]",
  full: "max-w-[var(--fp-container-max-width)]",
} as const

const containerGutterToken =
  "px-[var(--fp-container-padding-inline-mobile)] md:px-[var(--fp-container-padding-inline)]"

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
      none: containerGutterToken,
      sm: containerGutterToken,
      md: containerGutterToken,
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
    heroGutter: containerGutterToken,
    sectionInner: `mx-auto w-full ${containerWidthTokens.lg} ${containerGutterToken}`,
  },
  marketingSurface: {
    inset: marketingSurfaceFrameTokens.inset,
  },
  messaging: {
    bubble: "max-w-[min(34rem,85%)]",
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

const badgeTokens = {
  base: "inline-flex items-center border font-medium",
  variants: {
    neutral:
      "border-border-primary bg-surface-primary text-text-secondary",
    success:
      "border-brand-primary bg-surface-primary text-brand-primary",
    warning:
      "border-border-secondary bg-surface-secondary text-text-primary",
    danger:
      "border-border-focus bg-surface-primary text-text-primary",
  },
  sizes: {
    sm: `${sizingTokens.badge.sm} ${densityTokens.badge.sm} text-xs`,
    md: `${sizingTokens.badge.md} ${densityTokens.badge.md} text-xs`,
  },
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
    warm:
      "border border-accent-warm bg-accent-warm text-accent-on-warm hover:border-accent-warm-hover hover:bg-accent-warm-hover",
    brandOutline:
      "border border-brand-primary bg-transparent text-brand-primary hover:bg-brand-primary hover:text-brand-on-primary",
    dark:
      "border border-surface-dark bg-surface-dark text-text-inverse hover:border-surface-dark hover:bg-surface-dark",
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

// Shared display/subtitle scale for homepage section headings — keeps
// hero / howItWorks / professionalCta / projectIdeas on one type system
// instead of each section carrying its own bespoke clamp values.
const homeTypeScale = {
  title:
    "text-[2.25rem] font-semibold leading-[1.12] tracking-[-0.045em] text-text-primary md:text-[2.75rem] lg:text-[3.25rem]",
  subtitle:
    "mt-6 max-w-[40rem] text-[1.25rem] font-normal leading-[1.4] tracking-[-0.02em] text-text-primary md:mt-7 md:text-[1.5rem]",
} as const;

const homeTokens = {
  railFrame: "",
  rail: "",
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
    root:
      "relative z-50 bg-surface-elevated text-text-primary",
    embeddedRoot: "bg-transparent text-text-on-hero-primary",
    container:
      "flex h-16 items-center justify-between md:h-[4.5rem]",
    embeddedContainer: "h-14 md:h-16 lg:h-20",
    logo:
      "inline-flex items-center gap-2.5 font-[family-name:var(--fp-font-nav)] text-[1.375rem] font-semibold leading-none tracking-[-0.06em] text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-4 focus-visible:ring-offset-surface-elevated md:text-2xl",
    logoInverse: "text-text-on-hero-primary focus-visible:ring-offset-surface-dark",
    logoMark:
      "flex size-6 shrink-0 items-center justify-center rounded-md bg-accent-warm text-[0.875rem] font-semibold leading-none tracking-[-0.06em] text-accent-on-warm",
    logoMarkInverse: "bg-accent-warm text-accent-on-warm",
    logoText: "inline-flex items-baseline",
    desktopMenu:
      "hidden items-center gap-10 md:flex lg:gap-12 xl:gap-14",
    desktopMenuEmbedded: "gap-6 lg:gap-9",
    link:
      "font-[family-name:var(--fp-font-nav)] text-[0.9375rem] font-medium leading-none tracking-[-0.06em] text-text-primary transition-colors hover:text-accent-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-4 focus-visible:ring-offset-surface-elevated lg:text-",
    linkEmbedded:
      "text-text-on-hero-secondary hover:text-text-on-hero-primary focus-visible:ring-offset-surface-dark lg:text-sm",
    accentLink: "font-semibold text-text-primary",
    accentLinkEmbedded: "text-text-on-hero-primary",
    mobileToggle:
      "h-10 w-10 rounded-md px-0 text-text-primary hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated md:hidden",
    mobileToggleEmbedded:
      "text-text-on-hero-primary hover:bg-transparent hover:text-text-on-hero-primary focus-visible:ring-offset-surface-dark",
    mobilePanel:
      "border-t border-border-primary bg-surface-elevated md:hidden",
    mobilePanelEmbedded: "border-border-on-hero bg-surface-dark",
    mobileMenu:
      "flex flex-col gap-1 py-4",
    mobileLink:
      "font-[family-name:var(--fp-font-nav)] px-2 py-3 text-base font-medium tracking-[-0.06em] text-text-primary transition-colors hover:text-accent-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-surface-elevated",
    mobileLinkEmbedded:
      "text-text-on-hero-primary focus-visible:ring-offset-surface-dark",
    mobileAccentLink: "font-semibold text-accent-warm",
    heroLogo:
      "pointer-events-auto absolute left-6 top-4 text-lg font-medium sm:left-8 md:left-12 md:text-xl lg:left-[var(--fp-home-content-inset-x)] lg:top-[3.2%]",
    heroMenu:
      "pointer-events-auto absolute right-[var(--fp-home-content-inset-x)] top-[3.2%] hidden items-center gap-5 text-sm lg:flex lg:gap-7",
    heroLink:
      "text-sm font-medium text-text-secondary hover:text-text-primary",
    heroAccentLink: "text-text-primary",
    defaultContainer: "h-14 md:h-16 lg:px-[var(--fp-home-content-inset-x)]",
  },
  hero: {
    root: `${semanticSurfaceTokens.muted} text-text-primary`,
    container:
      "flex min-h-[var(--fp-home-hero-min-height)] flex-col items-center justify-center py-14 text-center md:min-h-[30rem] md:py-16 lg:min-h-[32.5rem] lg:py-[4.25rem]",
    title:
      `max-w-[var(--fp-home-hero-title-max-width)] ${homeTypeScale.title}`,
    titleAccent: "text-accent-warm",
    question:
      "mt-9 text-[1.35rem] font-medium leading-tight tracking-[-0.02em] text-text-primary md:mt-10 md:text-[1.65rem]",
    trustRow:
      "mt-6 flex w-full max-w-[var(--fp-home-hero-search-width)] flex-col items-center gap-3 text-sm text-text-secondary sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 sm:gap-y-2 md:mt-7",
    trustItem: "inline-flex items-center gap-2",
    trustIcon: "size-4 shrink-0 text-text-muted",
    trustText: "leading-tight",
    searchWrap:
      "relative mt-5 w-full max-w-[var(--fp-home-hero-search-width)] md:mt-6",
    searchForm:
      "flex h-14 w-full items-center gap-3 rounded-full border border-border-soft bg-surface-elevated py-1.5 pl-5 pr-1.5 focus-within:ring-2 focus-within:ring-accent-warm focus-within:ring-offset-2 focus-within:ring-offset-surface-muted md:h-16 md:pl-6 md:pr-2",
    searchInput:
      "h-full min-w-0 flex-1 border-0 bg-transparent px-0 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-transparent md:text-base",
    searchSubmit:
      "h-11 w-11 shrink-0 rounded-full px-0 md:h-12 md:w-12",
    searchSubmitIcon: "size-5 md:size-6",
    suggestions:
      "absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border-soft bg-surface-elevated text-left shadow-card",
    suggestionsList: "max-h-64 overflow-y-auto",
    suggestionsLabel:
      "px-4 py-2 text-xs font-medium uppercase tracking-widest text-text-muted",
    suggestionsState: "px-4 py-3 text-sm text-text-secondary",
    suggestionAction:
      "h-auto w-full flex-col items-start justify-start gap-1 rounded-none px-4 py-3 text-left hover:bg-surface-muted",
    suggestionTitle: "text-sm text-text-primary",
    suggestionDescription: "text-xs text-text-muted",
    searchError:
      "absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border-soft bg-surface-elevated px-4 py-3 text-left text-sm text-text-primary shadow-card",
    searchCard:
      "rounded-full border-border-soft bg-surface-elevated p-1.5 shadow-none md:p-2",
    searchInner: "h-11 md:h-12",
    searchButton: "h-10 w-10 rounded-full px-0 md:h-11 md:w-11",
    searchIcon: "size-5",
  },
  howItWorks: {
    root:
      `${semanticSurfaceTokens.muted} py-16 font-[family-name:var(--fp-font-nav)] tracking-[-0.06em] text-text-primary [word-spacing:0.08em] md:py-20 lg:py-24`,
    header: "max-w-3xl",
    title: homeTypeScale.title,
    subtitle: homeTypeScale.subtitle,
    list:
      "relative mt-12 grid gap-10 md:mt-14 md:gap-11 lg:mt-16 lg:grid-cols-3 lg:gap-8",
    line:
      "absolute bottom-2 left-8 top-0 w-px bg-border-soft lg:bottom-auto lg:left-0 lg:right-0 lg:top-10 lg:h-1 lg:w-full lg:bg-decorative-purple",
    item:
      "relative grid grid-cols-[4rem_minmax(0,1fr)] gap-5 lg:grid-cols-1 lg:gap-0",
    iconFrame:
      "relative z-10 flex size-16 items-center justify-center rounded-full border border-border-soft bg-surface-base text-text-primary lg:mx-auto lg:size-20",
    icon: "size-8 lg:size-11",
    body: "pt-0.5 lg:mt-11 lg:pt-0 lg:text-center",
    number:
      "text-lg font-normal leading-none tracking-[-0.06em] text-accent-warm md:text-xl",
    stepTitle:
      "mt-3 text-[1.375rem] font-semibold leading-[1.18] tracking-[-0.06em] text-text-primary md:text-2xl lg:text-[1.5rem]",
    description:
      "mt-3 max-w-xs text-[1.0625rem] font-normal leading-[1.42] tracking-[-0.025em] text-text-primary md:text-lg lg:mx-auto",
  },
  professionalCta: {
    root:
      `${semanticSurfaceTokens.base} overflow-hidden py-16 font-[family-name:var(--fp-font-nav)] tracking-[-0.06em] text-text-primary [word-spacing:0.08em] md:py-20 lg:pb-24 lg:pt-20`,
    layout:
      "grid items-center gap-12 md:gap-14 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:gap-20",
    visual:
      "relative mx-auto flex min-h-[23rem] w-full max-w-[20rem] items-center justify-center md:min-h-[34rem] md:max-w-[25rem] lg:min-h-[34rem] lg:max-w-none",
    blob:
      "absolute left-1/2 top-1/2 h-[16rem] w-[15rem] -translate-x-1/2 -translate-y-1/2 rounded-[45%_55%_50%_50%/58%_42%_55%_45%] bg-accent-warm md:h-[24rem] md:w-[22rem] lg:h-[28rem] lg:w-[24rem]",
    phone:
      "relative z-10 aspect-[3/4] w-[16rem] overflow-visible md:w-[19rem] lg:w-[20rem]",
    phoneImage: "object-contain",
    copy:
      "mx-auto w-full max-w-[38rem] lg:mx-0 lg:pt-8",
    title: homeTypeScale.title,
    accentLine:
      "mt-8 h-1.5 w-20 rounded-full bg-accent-warm md:mt-9 md:w-[5.5rem]",
    subtitle: homeTypeScale.subtitle,
    cta:
      "mt-12 inline-flex max-w-full items-center gap-4 text-[1.375rem] font-normal leading-tight tracking-[-0.06em] text-accent-warm transition-colors hover:text-accent-warm-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-4 focus-visible:ring-offset-surface-base md:mt-14 md:gap-5 md:text-[1.625rem] lg:mt-16 lg:text-[1.875rem]",
    ctaIcon:
      "flex size-[3.25rem] shrink-0 items-center justify-center rounded-full border border-accent-warm bg-transparent text-accent-warm transition-colors group-hover:border-accent-warm-hover group-hover:text-accent-warm-hover md:size-14 lg:size-16",
    ctaArrow: "size-5 md:size-6",
  },
  projectIdeas: {
    root:
      `${semanticSurfaceTokens.base} py-14 font-[family-name:var(--fp-font-nav)] tracking-[-0.06em] text-text-primary [word-spacing:0.08em] md:py-16 lg:py-20`,
    inner:
      "w-full",
    feature:
      "grid w-full grid-cols-1 items-start gap-9 md:gap-10 lg:grid-cols-[clamp(18rem,37.8vw,28.75rem)_minmax(0,1fr)] lg:gap-[clamp(3rem,9.27vw,7rem)]",
    featureImage:
      "order-2 h-[clamp(20rem,92vw,26.25rem)] w-full max-w-full rounded-xl bg-surface-muted md:h-[26rem] lg:order-none lg:aspect-[259/284] lg:h-auto lg:max-w-none",
    copy:
      "order-1 flex w-full max-w-full flex-col items-start pt-1 lg:order-none lg:-mt-3 lg:max-w-[28.25rem]",
    title: `max-w-full lg:max-w-[28.25rem] ${homeTypeScale.title}`,
    description: `max-w-full lg:max-w-[20rem] ${homeTypeScale.subtitle}`,
    cta:
      "mt-7 inline-flex items-center gap-2 text-base font-normal leading-none tracking-[-0.06em] text-text-primary [word-spacing:0.08em] transition-colors hover:text-accent-warm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-4 focus-visible:ring-offset-surface-base md:mt-8 lg:ml-12 lg:mt-10 lg:text-[0.9375rem] lg:font-medium",
    ctaIcon:
      "flex size-9 items-center justify-center rounded-full bg-accent-warm text-accent-on-warm transition-colors group-hover:bg-accent-warm-hover",
    carouselShell: "relative mt-8 md:mt-9 lg:mt-7",
    carouselToolbar:
      "absolute right-0 top-[-3.25rem] hidden items-center gap-2 md:flex",
    carouselButton:
      "size-9 rounded-full border-border-soft bg-surface-base px-0 text-text-primary hover:border-accent-warm hover:bg-accent-warm hover:text-accent-on-warm focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
    carousel:
      "flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] sm:gap-5 md:gap-5 lg:gap-8 [&::-webkit-scrollbar]:hidden",
    card:
      "flex-[0_0_15.5rem] snap-start border-0 bg-transparent shadow-none transition-colors sm:flex-[0_0_15.75rem] md:flex-[0_0_15rem] lg:flex-[0_0_clamp(190px,21vw,296px)]",
    cardLink:
      "group block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-warm focus-visible:ring-offset-4 focus-visible:ring-offset-surface-base",
    cardImage:
      "aspect-[147/93] w-full rounded-xl bg-surface-muted",
    cardTitle:
      "mt-3.5 text-center text-base font-normal leading-snug tracking-[-0.06em] text-text-primary [word-spacing:0.08em] transition-colors group-hover:text-accent-warm lg:font-semibold",
  },
} as const;

const funnelTokens = {
  page: "pb-14 pt-7 md:pb-16 md:pt-8 lg:pb-20 lg:pt-8",
  rail: "mx-auto w-full max-w-2xl",
  intro: "space-y-5",
  introTitle:
    "text-4xl font-semibold leading-tight tracking-[-0.055em] text-text-primary md:text-5xl",
  introDescription: "text-lg leading-8 text-text-primary md:text-xl",
  accent: "h-1 w-16 bg-brand-primary",
  step: "mt-7 flex flex-col gap-7 md:mt-8",
  stepHeader: "space-y-5",
  stepTitle:
    "text-4xl font-medium leading-tight tracking-[-0.05em] text-text-primary md:text-5xl",
  stepDescription:
    "max-w-2xl text-2xl leading-snug tracking-[-0.035em] text-text-primary md:text-3xl",
  actions:
    "flex flex-col-reverse gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between",
  actionButton: "min-w-40",
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
    micro: "text-[10px] leading-none",
    microLabel: "text-[10px] uppercase tracking-[0.18em]",
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

  // Primitive dark neutrals. Surfaces should prefer semanticSurfaces.dark/footer.
  neutralColors: neutralColorTokens,

  // Merge-safe composed shells: fill and shape, never content layout.
  structuralSurfaces: structuralSurfaceTokens,

  shadows: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    card: "shadow-card",
    surface: "shadow-surface",
    homeHeroCard: "shadow-home-hero-card",
  },

  sizing: sizingTokens,
  layout: layoutTokens,
  home: homeTokens,
  funnel: funnelTokens,
  card: cardTokens,
  badge: badgeTokens,
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
export type NeutralColorToken = keyof typeof tokens.neutralColors;
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
