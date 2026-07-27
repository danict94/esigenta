export type SearchResult = {
  id: string;
  name: string;
  slug: string;
};

export type ScatterTag = {
  label: string;
  // Posizione ai margini (percentuali sul riquadro Hero), sempre ancorata
  // in ALTO (replica 1:1 docs/index.md: nessun post-it e' ancorato in
  // basso — vivono tutti nella fascia sopra il titolo).
  position: { left?: string; right?: string; top: string };
  rotate: string;
  delay: string;
  color: "giallo" | "carta";
  // Sotto questa soglia il post-it e' nascosto (replica le regole
  // responsive del riferimento): assente = sempre visibile.
  minVisibleWidth?: 601 | 861;
};

export type FeaturedWork = {
  title: string;
  description: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  fallbackLabel: string;
};

export const preloadedResults: SearchResult[] = [
  { id: "preload-1", name: "Ristrutturare bagno", slug: "ristrutturare-bagno" },
  { id: "preload-2", name: "Rifare tetto", slug: "rifare-tetto" },
  {
    id: "preload-3",
    name: "Installare fotovoltaico",
    slug: "installare-fotovoltaico",
  },
];

// Posizioni/rotazioni/ritardi presi 1:1 da docs/index.md (i 5 post-it della
// tavola). Solo 2 restano sempre visibili (repliche esatte n1/n4): sono gli
// unici che compaiono anche nella fascia mobile piu' stretta.
export const scatterTags: ScatterTag[] = [
  {
    label: "chi chiamo per il tetto?!",
    position: { left: "4%", top: "4%" },
    rotate: "-8deg",
    delay: "50ms",
    color: "giallo",
  },
  {
    label: "urgente! perde ancora",
    position: { left: "29%", top: "0%" },
    rotate: "5deg",
    delay: "160ms",
    color: "carta",
    minVisibleWidth: 601,
  },
  {
    label: "troppi numeri di telefono...",
    position: { right: "24%", top: "1%" },
    rotate: "-6deg",
    delay: "270ms",
    color: "giallo",
    minVisibleWidth: 601,
  },
  {
    label: "e se sbaglio impresa?",
    position: { right: "3%", top: "5%" },
    rotate: "9deg",
    delay: "380ms",
    color: "carta",
  },
  {
    label: "quanti preventivi chiedo???",
    position: { right: "1%", top: "36%" },
    rotate: "-5deg",
    delay: "490ms",
    color: "giallo",
    minVisibleWidth: 861,
  },
];

export const featuredWorks: FeaturedWork[] = [
  {
    title: "Ristrutturazione bagno",
    description:
      "Dal rifacimento completo alla sostituzione di sanitari e rivestimenti: una richiesta chiara per partire con il piede giusto.",
    href: "/interventi/ristrutturare-bagno",
    cta: "SCOPRI IL PERCORSO BAGNO",
    imageSrc: "/assets/images/rifare-bagno.webp",
    imageAlt: "Bagno ristrutturato con rivestimenti chiari e sanitari moderni",
    fallbackLabel: "Foto ristrutturazione bagno",
  },
  {
    title: "Rifacimento tetto",
    description:
      "Coperture, infiltrazioni, isolamento e manutenzioni importanti: raccogli i dettagli e raggiungi imprese adatte al lavoro.",
    href: "/interventi/rifare-tetto",
    cta: "SCOPRI IL PERCORSO TETTO",
    imageSrc: "/assets/images/rifacimento-tetto.webp",
    imageAlt: "Operaio al lavoro su un tetto con tegole",
    fallbackLabel: "Foto rifacimento tetto",
  },
  {
    title: "Impianto elettrico",
    description:
      "Adeguamenti, rifacimenti e nuove linee domestiche: trasformi un bisogno tecnico in una richiesta comprensibile.",
    href: "/interventi/rifare-impianto-elettrico",
    cta: "SCOPRI IL PERCORSO ELETTRICO",
    imageSrc: "/assets/images/impianto-elettrico.webp",
    imageAlt: "Quadro elettrico domestico durante un intervento tecnico",
    fallbackLabel: "Foto impianto elettrico",
  },
  {
    title: "Fotovoltaico",
    description:
      "Impianti solari, sopralluoghi e configurazioni iniziali: parti dai dati utili e confronti proposte coerenti.",
    href: "/interventi/installare-fotovoltaico",
    cta: "SCOPRI IL PERCORSO ENERGIA",
    imageSrc: "/assets/images/installazione-fotovoltaico.webp",
    imageAlt: "Pannelli fotovoltaici installati sul tetto di una casa",
    fallbackLabel: "Foto installazione fotovoltaico",
  },
  {
    title: "Climatizzazione",
    description:
      "Installazione o sostituzione del climatizzatore: descrivi ambienti, tempi e necessita senza perdere informazioni.",
    href: "/interventi/installare-climatizzatore",
    cta: "SCOPRI IL PERCORSO CLIMA",
    imageSrc: "/assets/images/climatizzazione.webp",
    imageAlt: "Climatizzatore installato in un ambiente domestico",
    fallbackLabel: "Foto climatizzazione",
  },
];
