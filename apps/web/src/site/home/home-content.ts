export type SearchResult = {
  id: string;
  name: string;
  slug: string;
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
