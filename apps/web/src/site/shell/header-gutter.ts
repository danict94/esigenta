// Padding orizzontale condiviso dai tre header dell'app (sito pubblico,
// area impresa pubblica, dashboard): stessa formula, un solo punto di
// verita', nessun nesting DOM aggiuntivo. Max-width 1180px + centratura:
// stesso .wrap del riferimento (docs/index.md) — prima mancava, e il
// contenuto dell'header si allargava fino ai bordi dello schermo invece
// di restare allineato alla colonna usata dal resto della pagina.
export const headerGutterClassName = "w-full max-w-[1180px] mx-auto px-[22px] min-[861px]:px-12";

// Altezza unica dei tre header: deve restare sincronizzata con
// --eg-nav-height in globals.css.
export const headerHeightClassName = "h-[var(--eg-nav-height)]";

// Shell condivisa (Esigenta Header Shell): Page piena (non semitrasparente)
// + bordo grafite. Page opaca invece che a 90%+blur: quel 10% lasciava
// trapelare cio' che sta sotto, e siccome l'header sta sopra superfici
// diverse a seconda della pagina (es. Hero scura in home, Page chiara
// altrove), il colore risultante NON era lo stesso ovunque — la stessa
// incoerenza gia' eliminata per lo scroll, riemersa per pagina. Piena
// opacita' = un solo colore, sempre, indipendentemente da cosa c'e' sotto.
export const headerSurfaceClassName =
  "bg-eg-page text-eg-ink border-b border-eg-border";

// Geometria unica del trigger icon-only (hamburger): stessa forma in
// Navbar e ImpresaHeader. I colori contestuali si aggiungono a parte.
export const headerTriggerBaseClassName =
  "relative inline-flex size-10 items-center justify-center rounded-eg-sm border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-[861px]:hidden";

// Trigger del menu mobile (superficie chiara in ogni contesto: tutti gli
// header sono sempre solidi, nessuno e' piu' trasparente sopra una Hero).
export const headerTriggerSolidClassName =
  "border-eg-border text-eg-ink hover:bg-eg-brand-soft hover:text-eg-brand-strong focus-visible:outline-eg-brand-strong";
