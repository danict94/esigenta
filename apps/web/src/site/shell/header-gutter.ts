// Padding orizzontale condiviso dai tre header dell'app (sito pubblico,
// area impresa pubblica, dashboard): stessa formula, un solo punto di
// verita', nessun nesting DOM aggiuntivo.
export const headerGutterClassName = "w-full px-[22px] min-[861px]:px-12";

// Altezza unica dei tre header: deve restare sincronizzata con
// --eg-nav-height in globals.css.
export const headerHeightClassName = "h-[var(--eg-nav-height)]";

// Shell solida condivisa (Esigenta Header Shell): superficie, testo e
// bordo comuni a Navbar fuori dalla Hero, ProHeader e ImpresaHeader.
// Fixed/sticky e il resto del layout restano decisi da ciascun header.
export const headerSurfaceClassName =
  "bg-eg-surface text-eg-ink border-b border-eg-border";

// Geometria unica del trigger icon-only (hamburger): stessa forma in
// Navbar e ImpresaHeader. I colori contestuali si aggiungono a parte.
export const headerTriggerBaseClassName =
  "relative inline-flex size-10 items-center justify-center rounded-eg-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-[861px]:hidden";

// Trigger sopra la shell solida (superficie chiara in ogni contesto).
export const headerTriggerSolidClassName =
  "border-eg-border text-eg-ink hover:bg-eg-brand-soft hover:text-eg-brand-strong focus-visible:outline-eg-brand-strong";

// Trigger sopra la Hero trasparente: famiglia on-brand/brand soltanto.
export const headerTriggerHeroClassName =
  "border-eg-on-brand-border text-eg-on-brand hover:border-eg-brand hover:bg-eg-brand hover:text-eg-on-brand focus-visible:outline-eg-on-brand";
